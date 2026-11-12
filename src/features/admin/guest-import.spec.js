import { describe, expect, it } from "vitest";
import { parseGuestCsv, parseGuestNames } from "./guest-import.js";

describe("guest import parsing", () => {
  it("parses CSV headers, WhatsApp numbers, and quoted commas", () => {
    expect(
      parseGuestCsv('nama,whatsapp\n"Alan, Budi",08123456789\nSari,628123456789'),
    ).toEqual([
      { name: "Alan, Budi", phone: "08123456789" },
      { name: "Sari", phone: "628123456789" },
    ]);
  });

  it("accepts a name-only CSV without a header", () => {
    expect(parseGuestCsv("Alan\nSari")).toEqual([
      { name: "Alan", phone: "" },
      { name: "Sari", phone: "" },
    ]);
  });

  it("splits pasted names on newlines, commas, or semicolons", () => {
    expect(parseGuestNames("Alan; Sari\nBudi, Dini")).toEqual([
      { name: "Alan", phone: "" },
      { name: "Sari", phone: "" },
      { name: "Budi", phone: "" },
      { name: "Dini", phone: "" },
    ]);
  });
});
