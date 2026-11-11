const PASSWORD_ITERATIONS = 100_000;
const PASSWORD_BYTES = 256;
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();
const dummySalt = new Uint8Array(16);
const dummyHash = new Uint8Array(PASSWORD_BYTES / 8);

function encodeBytes(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function digest(value) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

export async function verifyOpaqueToken(token, expectedToken) {
  const [submitted, expected] = await Promise.all([
    digest(token),
    digest(expectedToken || ""),
  ]);
  return constantTimeEqual(submitted, expected) && Boolean(expectedToken);
}

async function derivePassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt,
        iterations: PASSWORD_ITERATIONS,
      },
      key,
      PASSWORD_BYTES,
    ),
  );
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt);
  return { salt: encodeBytes(salt), hash: encodeBytes(hash) };
}

export async function verifyPassword(password, salt, expectedHash) {
  const saltBytes = salt ? decodeBytes(salt) : dummySalt;
  const expectedBytes = expectedHash ? decodeBytes(expectedHash) : dummyHash;
  const actual = await derivePassword(password, saltBytes);
  return (
    constantTimeEqual(actual, expectedBytes) && Boolean(salt && expectedHash)
  );
}

export async function hashOpaqueToken(token) {
  return encodeBytes(await digest(token));
}

export async function hashClientAddress(address) {
  return encodeBytes(await digest(address || "unknown"));
}

export function newOpaqueToken() {
  return encodeBytes(crypto.getRandomValues(new Uint8Array(32)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function readSessionCookie(cookieHeader) {
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("__Host-admin_session="));
  return cookie?.slice("__Host-admin_session=".length) || null;
}

export function sessionCookie(token, maxAge = SESSION_SECONDS) {
  return `__Host-admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export { SESSION_SECONDS };
