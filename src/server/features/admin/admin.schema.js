import { z } from "zod";

const optionalText = (max = 500) => z.string().trim().max(max).default("");
const httpsUrl = (max = 1000) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => {
      if (!value) return true;
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "URL must use HTTPS");
const mapsEmbedUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        url.hostname === "www.google.com" &&
        url.pathname.startsWith("/maps/embed")
      );
    } catch {
      return false;
    }
  }, "Embed must be a Google Maps HTTPS embed URL");

export const credentialsSchema = z.object({
  username: z.string().trim().min(3).max(64).regex(/^[a-z0-9_-]+$/, "Username hanya boleh huruf kecil, angka, garis bawah, dan strip"),
  password: z.string().min(12).max(128),
});

export const setupSchema = credentialsSchema.extend({
  setupToken: z.string().min(32).max(256),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128),
});

export const invitationSchema = z.object({
  uid: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(160),
  description: optionalText(2000),
  groomName: z.string().trim().min(1).max(120),
  brideName: z.string().trim().min(1).max(120),
  parentGroom: optionalText(240),
  parentBride: optionalText(240),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: optionalText(120),
  location: optionalText(240),
  address: optionalText(500),
  mapsUrl: httpsUrl(),
  mapsEmbed: mapsEmbedUrl,
  ogImage: httpsUrl().default(""),
  favicon: httpsUrl()
    .or(
      z
        .string()
        .regex(/^\/(?!\/).*/)
        .max(1000),
    )
    .or(z.literal(""))
    .default("/favicon.svg"),
  audio: httpsUrl().default(""),
  language: z.enum(["id", "en"]).default("id"),
});

export const agendaSchema = z.object({
  title: z.string().trim().min(1).max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: optionalText(50),
  endTime: optionalText(50),
  location: optionalText(240),
  address: optionalText(500),
  orderIndex: z.number().int().min(0).max(1000).default(0),
});

export const bankSchema = z.object({
  bank: z.string().trim().min(1).max(120),
  accountNumber: z.string().trim().min(1).max(80),
  accountName: z.string().trim().min(1).max(160),
  orderIndex: z.number().int().min(0).max(1000).default(0),
});

export const adminUidSchema = z.object({
  uid: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
});

export const numericIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});
