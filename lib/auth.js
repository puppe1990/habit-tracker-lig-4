import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "ht_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [algo, salt, hash] = String(storedHash).split(":");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

export async function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  await db.execute({
    sql: "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    args: [tokenHash, userId, expiresAt],
  });

  return { token, expiresAt };
}

export async function getUserFromRequest(db, request) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const tokenHash = hashToken(sessionToken);
  const nowIso = new Date().toISOString();

  const result = await db.execute({
    sql: `
      SELECT users.id, users.name, users.email
      FROM sessions
      INNER JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      LIMIT 1
    `,
    args: [tokenHash, nowIso],
  });

  if (!result.rows.length) return null;

  const row = result.rows[0];
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
  };
}

export async function deleteSessionFromRequest(db, request) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return;

  await db.execute({
    sql: "DELETE FROM sessions WHERE token_hash = ?",
    args: [hashToken(sessionToken)],
  });
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
