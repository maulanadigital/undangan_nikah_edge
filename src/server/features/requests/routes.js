import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getDbClient } from "../../lib/db-client.js";
import { hashClientAddress } from "../../lib/admin-auth.js";
import { AppError } from "../../lib/errors.js";
import { invitationRequestSchema } from "./request.schema.js";

const requestRoutes = new Hono();
const requestLimit = 5;
const requestWindowSeconds = 60 * 60;

requestRoutes.post("/", zValidator("json", invitationRequestSchema), async (c) => {
  const request = c.req.valid("json");
  const db = await getDbClient(c);
  const now = Math.floor(Date.now() / 1000);
  const ipHash = await hashClientAddress(
    c.req.header("cf-connecting-ip") || "unknown",
  );
  const recent = await db.query(
    "SELECT COUNT(*) AS count FROM invitation_requests WHERE ip_hash = $1 AND created_at >= $2",
    [ipHash, now - requestWindowSeconds],
  );
  if (Number(recent.rows[0].count) >= requestLimit) {
    return c.json(
      { success: false, error: "Terlalu banyak request. Coba lagi nanti." },
      429,
      { "Retry-After": String(requestWindowSeconds) },
    );
  }

  const whatsapp = request.whatsapp.replace(/\D/g, "");
  if (whatsapp.length < 8 || whatsapp.length > 15) {
    throw new AppError("Nomor WhatsApp tidak valid", 400);
  }

  await db.query(
    `INSERT INTO invitation_requests
       (id, groom_name, bride_name, event_date, whatsapp, ip_hash, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
    [
      crypto.randomUUID(),
      request.groomName,
      request.brideName,
      request.eventDate,
      whatsapp,
      ipHash,
      now,
    ],
  );
  return c.json(
    { success: true, message: "Request undangan berhasil dikirim." },
    201,
  );
});

requestRoutes.onError((error, c) => {
  if (error instanceof AppError) {
    return c.json(
      { success: false, error: error.message, code: error.code },
      error.status,
    );
  }
  if (error.name === "ZodError") {
    return c.json(
      { success: false, error: "Periksa kembali data yang diisi." },
      400,
    );
  }
  console.error(`[Invitation request API] ${error.name}: ${error.message}`);
  return c.json({ success: false, error: "Internal server error" }, 500);
});

export default requestRoutes;
