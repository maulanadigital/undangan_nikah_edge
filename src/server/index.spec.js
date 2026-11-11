import { describe, expect, it, vi } from "vitest";
import app from "./index.js";

describe("application fallback", () => {
  it("serves the SPA asset for client-side routes", async () => {
    const fetch = vi.fn(() => new Response("<main>SPA</main>"));
    const response = await app.request(
      "https://example.test/admin",
      {},
      { ASSETS: { fetch } },
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("SPA");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("does not use the SPA fallback for unknown API routes", async () => {
    const fetch = vi.fn();
    const response = await app.request(
      "https://example.test/api/unknown",
      {},
      { ASSETS: { fetch } },
    );

    expect(response.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });
});
