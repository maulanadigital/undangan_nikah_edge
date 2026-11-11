import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  adminUidSchema,
  agendaSchema,
  bankSchema,
  credentialsSchema,
  invitationSchema,
  numericIdSchema,
  passwordChangeSchema,
  setupSchema,
} from "./admin.schema.js";
import {
  hashClientAddress,
  hashOpaqueToken,
  hashPassword,
  newOpaqueToken,
  readSessionCookie,
  SESSION_SECONDS,
  sessionCookie,
  verifyPassword,
  verifyOpaqueToken,
} from "../../lib/admin-auth.js";
import { getDbClient } from "../../lib/db-client.js";
import {
  AppError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../lib/errors.js";

const adminRoutes = new Hono();
const loginWindowSeconds = 15 * 60;
const maxLoginFailures = 10;

function isWriteRequest(method) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}

adminRoutes.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  if (isWriteRequest(c.req.method)) {
    const origin = c.req.header("origin");
    if (!origin || origin !== new URL(c.req.url).origin) {
      return c.json({ success: false, error: "Invalid request origin" }, 403);
    }
  }
  await next();
});

async function getAdministrator(c) {
  const token = readSessionCookie(c.req.header("cookie"));
  if (!token) return null;

  const tokenHash = await hashOpaqueToken(token);
  const db = await getDbClient(c);
  const result = await db.query(
    `SELECT a.id, a.email
       FROM admin_sessions s
       JOIN administrators a ON a.id = s.administrator_id
       WHERE s.token_hash = $1 AND s.expires_at > $2`,
    [tokenHash, Math.floor(Date.now() / 1000)],
  );
  if (!result.rows[0]) return null;

  c.set("administrator", result.rows[0]);
  c.set("sessionHash", tokenHash);
  return result.rows[0];
}

async function requireAdministrator(c, next) {
  const administrator = await getAdministrator(c);
  if (!administrator) {
    return c.json({ success: false, error: "Authentication required" }, 401);
  }
  await next();
}

adminRoutes.use("/invitations", requireAdministrator);
adminRoutes.use("/invitations/*", requireAdministrator);

async function requireOwnedInvitation(c, db, uid) {
  const administrator = c.get("administrator");
  const result = await db.query(
    "SELECT uid FROM invitations WHERE uid = $1 AND owner_id = $2",
    [uid, administrator.id],
  );
  if (result.rows.length === 0) {
    throw new NotFoundError("Invitation not found");
  }
}

function invitationValues(invitation) {
  return [
    invitation.title,
    invitation.description,
    invitation.groomName,
    invitation.brideName,
    invitation.parentGroom,
    invitation.parentBride,
    invitation.date,
    invitation.time,
    invitation.location,
    invitation.address,
    invitation.mapsUrl,
    invitation.mapsEmbed,
    invitation.ogImage,
    invitation.favicon,
    invitation.audio,
    invitation.language,
  ];
}

adminRoutes.get("/auth/setup-status", async (c) => {
  const db = await getDbClient(c);
  const result = await db.query("SELECT COUNT(*) AS count FROM administrators");
  const configured = Boolean(c.env?.ADMIN_EMAIL && c.env?.ADMIN_SETUP_TOKEN);
  const setupRequired = Number(result.rows[0].count) === 0;
  return c.json({
    success: true,
    setupRequired,
    setupAvailable: setupRequired && configured,
  });
});

adminRoutes.post("/auth/setup", zValidator("json", setupSchema), async (c) => {
  const { email, password, setupToken } = c.req.valid("json");
  const configuredEmail = c.env?.ADMIN_EMAIL;
  const configuredToken = c.env?.ADMIN_SETUP_TOKEN;
  if (!configuredEmail || !configuredToken) {
    return c.json(
      { success: false, error: "Admin setup is not configured" },
      503,
    );
  }

  if (
    email.toLowerCase() !== configuredEmail.toLowerCase() ||
    !(await verifyOpaqueToken(setupToken, configuredToken))
  ) {
    throw new UnauthorizedError("Invalid setup credentials");
  }

  const db = await getDbClient(c);
  const existing = await db.query("SELECT id FROM administrators LIMIT 1");
  if (existing.rows.length > 0) {
    throw new ConflictError("Admin setup has already been completed");
  }

  const administratorId = crypto.randomUUID();
  const passwordCredentials = await hashPassword(password);
  await db.query(
    `INSERT INTO administrators (id, email, password_salt, password_hash)
       VALUES ($1, $2, $3, $4)`,
    [
      administratorId,
      configuredEmail.toLowerCase(),
      passwordCredentials.salt,
      passwordCredentials.hash,
    ],
  );
  await db.query(
    "UPDATE invitations SET owner_id = $1 WHERE owner_id IS NULL",
    [administratorId],
  );
  await db.query("DELETE FROM admin_login_attempts");

  return c.json({ success: true, message: "Admin account created" }, 201);
});

adminRoutes.post(
  "/auth/login",
  zValidator("json", credentialsSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const db = await getDbClient(c);
    const ipHash = await hashClientAddress(
      c.req.header("cf-connecting-ip") || "unknown",
    );
    const now = Math.floor(Date.now() / 1000);
    const attempts = await db.query(
      "SELECT failures, window_started_at FROM admin_login_attempts WHERE ip_hash = $1",
      [ipHash],
    );
    const attempt = attempts.rows[0];
    if (
      attempt &&
      Number(attempt.failures) >= maxLoginFailures &&
      now - Number(attempt.window_started_at) < loginWindowSeconds
    ) {
      return c.json(
        { success: false, error: "Too many login attempts. Try again later." },
        429,
        { "Retry-After": String(loginWindowSeconds) },
      );
    }

    const result = await db.query(
      `SELECT id, email, password_salt, password_hash
         FROM administrators WHERE email = $1`,
      [email.toLowerCase()],
    );
    const administrator = result.rows[0];
    const validPassword = await verifyPassword(
      password,
      administrator?.password_salt,
      administrator?.password_hash,
    );
    if (!administrator || !validPassword) {
      const failures =
        attempt && now - Number(attempt.window_started_at) < loginWindowSeconds
          ? Number(attempt.failures) + 1
          : 1;
      await db.query(
        `INSERT INTO admin_login_attempts (ip_hash, failures, window_started_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (ip_hash) DO UPDATE SET
             failures = excluded.failures,
             window_started_at = excluded.window_started_at`,
        [
          ipHash,
          failures,
          failures === 1 ? now : Number(attempt.window_started_at),
        ],
      );
      throw new UnauthorizedError("Invalid email or password");
    }

    await db.query("DELETE FROM admin_login_attempts WHERE ip_hash = $1", [
      ipHash,
    ]);
    const token = newOpaqueToken();
    const tokenHash = await hashOpaqueToken(token);
    await db.query(
      `INSERT INTO admin_sessions (token_hash, administrator_id, expires_at)
         VALUES ($1, $2, $3)`,
      [tokenHash, administrator.id, now + SESSION_SECONDS],
    );
    await db.query("DELETE FROM admin_sessions WHERE expires_at <= $1", [now]);
    c.header("Set-Cookie", sessionCookie(token));
    return c.json({
      success: true,
      data: { email: administrator.email },
    });
  },
);

adminRoutes.get("/auth/me", requireAdministrator, async (c) => {
  return c.json({ success: true, data: c.get("administrator") });
});

adminRoutes.post("/auth/logout", requireAdministrator, async (c) => {
  const db = await getDbClient(c);
  await db.query("DELETE FROM admin_sessions WHERE token_hash = $1", [
    c.get("sessionHash"),
  ]);
  c.header("Set-Cookie", sessionCookie("", 0));
  return c.json({ success: true });
});

adminRoutes.post(
  "/auth/password",
  requireAdministrator,
  zValidator("json", passwordChangeSchema),
  async (c) => {
    const { currentPassword, newPassword } = c.req.valid("json");
    const administrator = c.get("administrator");
    const db = await getDbClient(c);
    const result = await db.query(
      "SELECT password_salt, password_hash FROM administrators WHERE id = $1",
      [administrator.id],
    );
    const current = result.rows[0];
    if (
      !(await verifyPassword(
        currentPassword,
        current?.password_salt,
        current?.password_hash,
      ))
    ) {
      throw new UnauthorizedError("Current password is incorrect");
    }
    const updated = await hashPassword(newPassword);
    await db.query(
      "UPDATE administrators SET password_salt = $1, password_hash = $2 WHERE id = $3",
      [updated.salt, updated.hash, administrator.id],
    );
    await db.query(
      "DELETE FROM admin_sessions WHERE administrator_id = $1 AND token_hash != $2",
      [administrator.id, c.get("sessionHash")],
    );
    return c.json({ success: true, message: "Password updated" });
  },
);

adminRoutes.get("/invitations", async (c) => {
  const db = await getDbClient(c);
  const administrator = c.get("administrator");
  const result = await db.query(
    `SELECT i.uid, i.title, i.groom_name, i.bride_name, i.wedding_date,
            (SELECT COUNT(*) FROM wishes w WHERE w.invitation_uid = i.uid) AS wish_count
       FROM invitations i
       WHERE i.owner_id = $1
       ORDER BY i.wedding_date DESC`,
    [administrator.id],
  );
  return c.json({ success: true, data: result.rows });
});

adminRoutes.post(
  "/invitations",
  zValidator("json", invitationSchema),
  async (c) => {
    const invitation = c.req.valid("json");
    const db = await getDbClient(c);
    const administrator = c.get("administrator");
    try {
      await db.query(
        `INSERT INTO invitations (
           uid, title, description, groom_name, bride_name, parent_groom,
           parent_bride, wedding_date, time, location, address, maps_url,
           maps_embed, og_image, favicon, audio, language, owner_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [invitation.uid, ...invitationValues(invitation), administrator.id],
      );
    } catch (error) {
      if (
        error.code === "23505" ||
        /UNIQUE constraint failed/i.test(error.message ?? "")
      ) {
        throw new ConflictError("Invitation UID is already in use");
      }
      throw error;
    }
    return c.json({ success: true, data: { uid: invitation.uid } }, 201);
  },
);

adminRoutes.get(
  "/invitations/:uid",
  zValidator("param", adminUidSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    const [invitationResult, agendaResult, bankResult] = await Promise.all([
      db.query(
        `SELECT uid, title, description, groom_name, bride_name, parent_groom,
                parent_bride, wedding_date, time, location, address, maps_url,
                maps_embed, og_image, favicon, audio, language
           FROM invitations WHERE uid = $1`,
        [uid],
      ),
      db.query(
        `SELECT id, title, date, start_time, end_time, location, address, order_index
           FROM agenda WHERE invitation_uid = $1 ORDER BY order_index, date`,
        [uid],
      ),
      db.query(
        `SELECT id, bank, account_number, account_name, order_index
           FROM banks WHERE invitation_uid = $1 ORDER BY order_index`,
        [uid],
      ),
    ]);
    return c.json({
      success: true,
      data: {
        ...invitationResult.rows[0],
        agenda: agendaResult.rows,
        banks: bankResult.rows,
      },
    });
  },
);

adminRoutes.put(
  "/invitations/:uid",
  zValidator("param", adminUidSchema),
  zValidator("json", invitationSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const invitation = c.req.valid("json");
    if (uid !== invitation.uid) {
      throw new AppError("Invitation UID cannot be changed", 400);
    }
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    await db.query(
      `UPDATE invitations SET
         title = $1, description = $2, groom_name = $3, bride_name = $4,
         parent_groom = $5, parent_bride = $6, wedding_date = $7, time = $8,
         location = $9, address = $10, maps_url = $11, maps_embed = $12,
         og_image = $13, favicon = $14, audio = $15, language = $16
       WHERE uid = $17 AND owner_id = $18`,
      [...invitationValues(invitation), uid, c.get("administrator").id],
    );
    return c.json({ success: true });
  },
);

adminRoutes.delete(
  "/invitations/:uid",
  zValidator("param", adminUidSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    await db.query("DELETE FROM invitations WHERE uid = $1", [uid]);
    return c.json({ success: true });
  },
);

adminRoutes.post(
  "/invitations/:uid/agenda",
  zValidator("param", adminUidSchema),
  zValidator("json", agendaSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const event = c.req.valid("json");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    await db.query(
      `INSERT INTO agenda
         (invitation_uid, title, date, start_time, end_time, location, address, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uid,
        event.title,
        event.date,
        event.startTime,
        event.endTime,
        event.location,
        event.address,
        event.orderIndex,
      ],
    );
    return c.json({ success: true }, 201);
  },
);

adminRoutes.put(
  "/invitations/:uid/agenda/:id",
  zValidator("param", adminUidSchema.extend(numericIdSchema.shape)),
  zValidator("json", agendaSchema),
  async (c) => {
    const { uid, id } = c.req.valid("param");
    const event = c.req.valid("json");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    const result = await db.query(
      `UPDATE agenda SET title = $1, date = $2, start_time = $3, end_time = $4,
         location = $5, address = $6, order_index = $7
       WHERE id = $8 AND invitation_uid = $9`,
      [
        event.title,
        event.date,
        event.startTime,
        event.endTime,
        event.location,
        event.address,
        event.orderIndex,
        id,
        uid,
      ],
    );
    if (result.rowCount === 0) throw new NotFoundError("Event not found");
    return c.json({ success: true });
  },
);

adminRoutes.delete(
  "/invitations/:uid/agenda/:id",
  zValidator("param", adminUidSchema.extend(numericIdSchema.shape)),
  async (c) => {
    const { uid, id } = c.req.valid("param");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    const result = await db.query(
      "DELETE FROM agenda WHERE id = $1 AND invitation_uid = $2",
      [id, uid],
    );
    if (result.rowCount === 0) throw new NotFoundError("Event not found");
    return c.json({ success: true });
  },
);

adminRoutes.post(
  "/invitations/:uid/banks",
  zValidator("param", adminUidSchema),
  zValidator("json", bankSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const bank = c.req.valid("json");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    await db.query(
      `INSERT INTO banks
         (invitation_uid, bank, account_number, account_name, order_index)
       VALUES ($1, $2, $3, $4, $5)`,
      [uid, bank.bank, bank.accountNumber, bank.accountName, bank.orderIndex],
    );
    return c.json({ success: true }, 201);
  },
);

adminRoutes.put(
  "/invitations/:uid/banks/:id",
  zValidator("param", adminUidSchema.extend(numericIdSchema.shape)),
  zValidator("json", bankSchema),
  async (c) => {
    const { uid, id } = c.req.valid("param");
    const bank = c.req.valid("json");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    const result = await db.query(
      `UPDATE banks SET bank = $1, account_number = $2, account_name = $3,
         order_index = $4 WHERE id = $5 AND invitation_uid = $6`,
      [
        bank.bank,
        bank.accountNumber,
        bank.accountName,
        bank.orderIndex,
        id,
        uid,
      ],
    );
    if (result.rowCount === 0)
      throw new NotFoundError("Bank account not found");
    return c.json({ success: true });
  },
);

adminRoutes.delete(
  "/invitations/:uid/banks/:id",
  zValidator("param", adminUidSchema.extend(numericIdSchema.shape)),
  async (c) => {
    const { uid, id } = c.req.valid("param");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    const result = await db.query(
      "DELETE FROM banks WHERE id = $1 AND invitation_uid = $2",
      [id, uid],
    );
    if (result.rowCount === 0)
      throw new NotFoundError("Bank account not found");
    return c.json({ success: true });
  },
);

adminRoutes.get(
  "/invitations/:uid/wishes",
  zValidator("param", adminUidSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const limit = Math.min(
      Math.max(Number.parseInt(c.req.query("limit") || "50", 10) || 50, 1),
      100,
    );
    const offset = Math.max(
      Number.parseInt(c.req.query("offset") || "0", 10) || 0,
      0,
    );
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    const [wishes, count] = await Promise.all([
      db.query(
        `SELECT id, name, message, attendance, created_at
           FROM wishes WHERE invitation_uid = $1
           ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [uid, limit, offset],
      ),
      db.query(
        "SELECT COUNT(*) AS count FROM wishes WHERE invitation_uid = $1",
        [uid],
      ),
    ]);
    return c.json({
      success: true,
      data: wishes.rows,
      pagination: { total: Number(count.rows[0].count), limit, offset },
    });
  },
);

adminRoutes.delete(
  "/invitations/:uid/wishes/:id",
  zValidator("param", adminUidSchema.extend(numericIdSchema.shape)),
  async (c) => {
    const { uid, id } = c.req.valid("param");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    const result = await db.query(
      "DELETE FROM wishes WHERE id = $1 AND invitation_uid = $2",
      [id, uid],
    );
    if (result.rowCount === 0) throw new NotFoundError("Wish not found");
    return c.json({ success: true });
  },
);

adminRoutes.get(
  "/invitations/:uid/stats",
  zValidator("param", adminUidSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const db = await getDbClient(c);
    await requireOwnedInvitation(c, db, uid);
    const result = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN attendance = 'ATTENDING' THEN 1 ELSE 0 END), 0) AS attending,
         COALESCE(SUM(CASE WHEN attendance = 'NOT_ATTENDING' THEN 1 ELSE 0 END), 0) AS not_attending,
         COALESCE(SUM(CASE WHEN attendance = 'MAYBE' THEN 1 ELSE 0 END), 0) AS maybe,
         COUNT(*) AS total
       FROM wishes WHERE invitation_uid = $1`,
      [uid],
    );
    return c.json({ success: true, data: result.rows[0] });
  },
);

adminRoutes.onError((error, c) => {
  if (error instanceof AppError) {
    return c.json(
      { success: false, error: error.message, code: error.code },
      error.status,
    );
  }
  if (error.name === "ZodError") {
    return c.json(
      { success: false, error: "Validation failed", details: error.issues },
      400,
    );
  }
  console.error(`[Admin API] ${error.name}: ${error.message}`);
  return c.json({ success: false, error: "Internal server error" }, 500);
});

export default adminRoutes;
