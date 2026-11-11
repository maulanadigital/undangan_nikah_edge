import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import adminRoutes from "./routes.js";
import { getDbClient } from "../../lib/db-client.js";
import { hashPassword, verifyPassword } from "../../lib/admin-auth.js";

vi.mock("../../lib/db-client.js", () => ({
  getDbClient: vi.fn(),
}));

const origin = "https://example.test";
const setupToken = "a".repeat(48);
const email = "admin@example.test";
let credentials;

describe("admin authentication routes", () => {
  let app;
  let query;

  beforeAll(async () => {
    credentials = await hashPassword("correct horse battery staple");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    query = vi.fn(async () => ({ rows: [], rowCount: 0 }));
    getDbClient.mockResolvedValue({ query });
    app = new Hono();
    app.route("/api/admin", adminRoutes);
  });

  it("reports first-admin setup availability without exposing setup secrets", async () => {
    query.mockResolvedValueOnce({ rows: [{ count: 0 }] });
    const response = await app.request(
      `${origin}/api/admin/auth/setup-status`,
      {},
      {
        DB: {},
        ADMIN_EMAIL: email,
        ADMIN_SETUP_TOKEN: setupToken,
      },
    );

    expect(await response.json()).toEqual({
      success: true,
      setupRequired: true,
      setupAvailable: true,
    });
  });

  it("rejects state-changing requests from another origin", async () => {
    const response = await app.request(`${origin}/api/admin/auth/login`, {
      method: "POST",
      headers: {
        Origin: "https://attacker.test",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: "correct horse battery staple" }),
    });

    expect(response.status).toBe(403);
    expect(getDbClient).not.toHaveBeenCalled();
  });

  it("creates the configured first administrator and assigns existing invitations", async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValue({ rows: [], rowCount: 1 });
    const response = await app.request(
      `${origin}/api/admin/auth/setup`,
      {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: "correct horse battery staple",
          setupToken,
        }),
      },
      { DB: {}, ADMIN_EMAIL: email, ADMIN_SETUP_TOKEN: setupToken },
    );

    expect(response.status).toBe(201);
    const insertCall = query.mock.calls.find(([sql]) =>
      sql.includes("INSERT INTO administrators"),
    );
    expect(insertCall[1][1]).toBe(email);
    expect(
      await verifyPassword(
        "correct horse battery staple",
        insertCall[1][2],
        insertCall[1][3],
      ),
    ).toBe(true);
    expect(query).toHaveBeenCalledWith(
      "UPDATE invitations SET owner_id = $1 WHERE owner_id IS NULL",
      [expect.any(String)],
    );
  });

  it("does not allow a second initial administrator", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: "existing-admin" }] });
    const response = await app.request(
      `${origin}/api/admin/auth/setup`,
      {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: "correct horse battery staple",
          setupToken,
        }),
      },
      { DB: {}, ADMIN_EMAIL: email, ADMIN_SETUP_TOKEN: setupToken },
    );

    expect(response.status).toBe(409);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("creates a secure server-side session for valid credentials", async () => {
    query.mockImplementation(async (sql) => {
      if (sql.includes("SELECT failures")) return { rows: [] };
      if (sql.includes("FROM administrators WHERE email")) {
        return {
          rows: [
            {
              id: "admin-1",
              email,
              password_salt: credentials.salt,
              password_hash: credentials.hash,
            },
          ],
        };
      }
      return { rows: [], rowCount: 1 };
    });
    const response = await app.request(`${origin}/api/admin/auth/login`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "CF-Connecting-IP": "192.0.2.1",
      },
      body: JSON.stringify({
        email,
        password: "correct horse battery staple",
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toMatch(
      /^__Host-admin_session=.*; Path=\/; HttpOnly; Secure; SameSite=Strict/,
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO admin_sessions"),
      [expect.any(String), "admin-1", expect.any(Number)],
    );
    expect(await response.json()).toEqual({ success: true, data: { email } });
  });

  it("rate-limits repeated bad login attempts", async () => {
    query.mockResolvedValueOnce({
      rows: [
        { failures: 10, window_started_at: Math.floor(Date.now() / 1000) },
      ],
    });
    const response = await app.request(`${origin}/api/admin/auth/login`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "CF-Connecting-IP": "192.0.2.2",
      },
      body: JSON.stringify({ email, password: "wrong password" }),
    });

    expect(response.status).toBe(429);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("requires authentication on invitation management routes", async () => {
    const response = await app.request(
      `${origin}/api/admin/invitations`,
      {},
      { DB: {} },
    );

    expect(response.status).toBe(401);
  });
});
