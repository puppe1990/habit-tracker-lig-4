import crypto from "node:crypto";
import { deleteSessionByTokenHash, findSessionUser, insertSession } from "./sessions";

export const SESSION_COOKIE_NAME = "ht_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getSessionTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) return bearerToken;
  }

  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [algo, salt, hash] = String(storedHash).split(":");
  if (algo !== "scrypt" || !salt || !hash) return false;

  if (!/^[a-f0-9]+$/i.test(hash) || hash.length !== 128) {
    return false;
  }

  try {
    const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  insertSession(db, { tokenHash: hashToken(token), userId, expiresAt });
  return { token, expiresAt };
}

export function getUserFromRequest(db, request) {
  const sessionToken = getSessionTokenFromRequest(request);
  if (!sessionToken) return null;

  const row = findSessionUser(db, hashToken(sessionToken), new Date().toISOString());
  if (!row) return null;

  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
  };
}

export function deleteSessionFromRequest(db, request) {
  const sessionToken = getSessionTokenFromRequest(request);
  if (!sessionToken) return;

  deleteSessionByTokenHash(db, hashToken(sessionToken));
}

export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}
