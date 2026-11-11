/**
 * Sakeenah API Server
 * Hono-based REST API for wedding invitations
 *
 * Features:
 * - Invitation: Fetch invitation data with agenda and bank accounts
 * - Wishes: Guest wishes/RSVP management
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";

// Feature routes and schemas
import { invitationRoutes, wishesRoutes } from "./features/index.js";
import adminRoutes from "./features/admin/routes.js";
import { uidParamSchema } from "./features/invitation/invitation.schema.js";
import { getDbClient } from "./lib/db-client.js";
import { AppError } from "./lib/errors.js";

// Create main app and API sub-app
const app = new Hono();
const api = new Hono();

// ============ Middleware ============

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// ============ Global Error Handler ============

app.onError((err, c) => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
      },
      err.status,
    );
  }

  // Handle Zod validation errors from zValidator
  if (err.name === "ZodError") {
    return c.json(
      {
        success: false,
        error: "Validation failed",
        details: err.errors,
      },
      400,
    );
  }

  return c.json(
    {
      success: false,
      error: "Internal server error",
    },
    500,
  );
});

// ============ Mount Feature Routes ============

// Invitation routes: /api/invitation/:uid
api.route("/invitation", invitationRoutes);
api.route("/admin", adminRoutes);

// Wishes routes: /api/:uid/wishes/*
api.route("/:uid/wishes", wishesRoutes);

// Stats route (related to wishes but at /:uid level)
api.get("/:uid/stats", zValidator("param", uidParamSchema), async (c) => {
  const { uid } = c.req.valid("param");

  try {
    const pool = await getDbClient(c);
    const result = await pool.query(
      `SELECT
          COALESCE(SUM(CASE WHEN attendance = 'ATTENDING' THEN 1 ELSE 0 END), 0) as attending,
          COALESCE(SUM(CASE WHEN attendance = 'NOT_ATTENDING' THEN 1 ELSE 0 END), 0) as not_attending,
          COALESCE(SUM(CASE WHEN attendance = 'MAYBE' THEN 1 ELSE 0 END), 0) as maybe,
          COUNT(*) as total
       FROM wishes
       WHERE invitation_uid = $1`,
      [uid],
    );

    return c.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw new Error("Internal server error");
  }
});

// ============ Mount API Routes ============

app.route("/api", api);

app.notFound((c) => {
  if (
    !c.req.path.startsWith("/api/") &&
    ["GET", "HEAD"].includes(c.req.method) &&
    c.env?.ASSETS
  ) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text("Not Found", 404);
});

// ============ Export ============

export default app;
