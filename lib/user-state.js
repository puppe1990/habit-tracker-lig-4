export function readStatePayload(db, userId) {
  const row = db.prepare("SELECT payload FROM app_state WHERE user_id = ?").get(userId);
  return row?.payload ?? null;
}

export function writeStatePayload(db, userId, payload) {
  db.prepare(
    `
      INSERT INTO app_state (user_id, payload, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        payload = excluded.payload,
        updated_at = CURRENT_TIMESTAMP
    `,
  ).run(userId, payload);
}
