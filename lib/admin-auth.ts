export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_CLIENT_COOKIE = "admin_session_client";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

const encoder = new TextEncoder();

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

async function digest(value: string) {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function sign(value: string) {
  const secret = getSessionSecret();
  if (!secret) return "";

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return toHex(
    await crypto.subtle.sign("HMAC", key, encoder.encode(value))
  );
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && getSessionSecret());
}

export async function adminPasswordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const [candidateHash, expectedHash] = await Promise.all([
    digest(candidate),
    digest(expected),
  ]);

  return safeEqual(candidateHash, expectedHash);
}

export async function createAdminSessionToken() {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = `v1.${expiresAt}`;
  const signature = await sign(payload);

  if (!signature) {
    throw new Error("Admin authentication is not configured");
  }

  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string) {
  if (!token) return false;

  const [version, expiresAtValue, signature] = token.split(".");
  if (version !== "v1" || !expiresAtValue || !signature) return false;

  const expiresAt = Number(expiresAtValue);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expectedSignature = await sign(`${version}.${expiresAtValue}`);
  return Boolean(expectedSignature && safeEqual(signature, expectedSignature));
}
