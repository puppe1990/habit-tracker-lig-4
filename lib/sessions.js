export function insertSession(db, { tokenHash, userId, expiresAt }) {
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
    tokenHash,
    userId,
    expiresAt,
  );
}

export function findSessionUser(db, tokenHash, nowIso) {
  const row = db
    .prepare(
      `
      SELECT users.id, users.name, users.email
      FROM sessions
      INNER JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      LIMIT 1
    `,
    )
    .get(tokenHash, nowIso);

  return row ?? null;
}

export function deleteSessionByTokenHash(db, tokenHash) {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}
