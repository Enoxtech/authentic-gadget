import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_CLIENT_COOKIE = "admin_session_client";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export type AdminRole = "super_admin" | "support" | "product_manager";

export interface AdminSession {
  role: AdminRole;
  adminId: string | null;
}

const encoder = new TextEncoder();

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function toHex(bytes: ArrayBuffer | Uint8Array) {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), (byte) =>
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

  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && getSessionSecret());
}

export async function adminPasswordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const [candidateHash, expectedHash] = await Promise.all([digest(candidate), digest(expected)]);

  return safeEqual(candidateHash, expectedHash);
}

// ---- Per-account password hashing (scrypt, salted) ----

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyAdminPasswordHash(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scrypt(password, salt, expected.length)) as Buffer;

  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

// ---- Session tokens (now encode role + adminId) ----

export async function createAdminSessionToken(session: AdminSession) {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const adminIdPart = session.adminId || "legacy";
  const payload = `v2.${expiresAt}.${session.role}.${adminIdPart}`;
  const signature = await sign(payload);

  if (!signature) {
    throw new Error("Admin authentication is not configured");
  }

  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string): Promise<AdminSession | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "v2") return null;
  const [version, expiresAtValue, role, adminIdPart, signature] = parts;

  const expiresAt = Number(expiresAtValue);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  if (role !== "super_admin" && role !== "support" && role !== "product_manager") return null;

  const expectedSignature = await sign(`${version}.${expiresAtValue}.${role}.${adminIdPart}`);
  if (!expectedSignature || !safeEqual(signature, expectedSignature)) return null;

  return { role, adminId: adminIdPart === "legacy" ? null : adminIdPart };
}
