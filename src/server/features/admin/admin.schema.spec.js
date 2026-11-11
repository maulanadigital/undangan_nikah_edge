import { describe, expect, it } from "vitest";
import { invitationSchema } from "./admin.schema.js";

const invitation = {
  uid: "cepeti-maulana-2026",
  title: "Pernikahan Cepti & Maulana",
  groomName: "Maulana",
  brideName: "Cepti",
  date: "2026-12-26",
  mapsUrl: "https://maps.app.goo.gl/example",
  mapsEmbed: "https://www.google.com/maps/embed?pb=example",
};

describe("admin invitation schema", () => {
  it("accepts HTTPS maps URLs and defaults optional fields safely", () => {
    const result = invitationSchema.parse(invitation);

    expect(result.language).toBe("id");
    expect(result.favicon).toBe("/favicon.svg");
    expect(result.mapsEmbed).toContain("https://www.google.com/maps/embed");
  });

  it("rejects unsafe link protocols", () => {
    expect(
      invitationSchema.safeParse({
        ...invitation,
        mapsUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
  });

  it("only accepts Google Maps embed URLs for iframe sources", () => {
    expect(
      invitationSchema.safeParse({
        ...invitation,
        mapsEmbed: "https://example.test/attacker",
      }).success,
    ).toBe(false);
  });

  it("rejects malformed invitation UIDs", () => {
    expect(
      invitationSchema.safeParse({ ...invitation, uid: "Cepti & Maulana" })
        .success,
    ).toBe(false);
  });
});
