import { z } from "zod";

export const invitationRequestSchema = z.object({
  groomName: z.string().trim().min(1).max(120),
  brideName: z.string().trim().min(1).max(120),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  whatsapp: z
    .string()
    .trim()
    .min(8)
    .max(24)
    .regex(/^\+?[0-9\s()-]+$/),
});

export const requestStatusSchema = z.object({
  status: z.enum(["pending", "contacted", "approved", "rejected"]),
});

export const requestIdSchema = z.object({
  id: z.string().uuid(),
});

export const guestImportSchema = z.object({
  guests: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        phone: z
          .string()
          .trim()
          .max(24)
          .regex(/^\+?[0-9\s()-]*$/)
          .default(""),
      }),
    )
    .min(1)
    .max(500),
});

export const guestSlugSchema = z.object({
  uid: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  slug: z.string().min(1).max(160).regex(/^[a-z0-9-]+$/),
});
