function parseCsvRows(value) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quoted) {
      if (character === '"' && value[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field.trim());
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && value[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error("CSV memiliki tanda kutip yang belum ditutup.");
  return rows;
}

export function parseGuestCsv(value) {
  const rows = parseCsvRows(value);
  if (!rows.length) return [];

  const header = rows[0].map((cell) => cell.toLowerCase());
  const hasHeader = header.some((cell) =>
    ["name", "nama", "phone", "whatsapp", "wa"].includes(cell),
  );
  const nameIndex = hasHeader
    ? header.findIndex((cell) => ["name", "nama"].includes(cell))
    : 0;
  const phoneIndex = hasHeader
    ? header.findIndex((cell) => ["phone", "whatsapp", "wa", "nomor"].includes(cell))
    : 1;
  if (nameIndex < 0) {
    throw new Error("CSV harus memiliki kolom name atau nama.");
  }

  return rows.slice(hasHeader ? 1 : 0).flatMap((row) => {
    const name = row[nameIndex]?.trim();
    return name
      ? [{ name, phone: phoneIndex < 0 ? "" : (row[phoneIndex] || "").trim() }]
      : [];
  });
}

export function parseGuestNames(value) {
  return value
    .split(/[\n;,]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name, phone: "" }));
}
