export function insertUser(db, { id, name, email, passwordHash }) {
  db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)").run(
    id,
    name,
    email,
    passwordHash,
  );
}

export function findUserByEmail(db, email) {
  const row = db
    .prepare("SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1")
    .get(email);
  return row ?? null;
}

export function findUserById(db, userId) {
  return db.prepare("SELECT id, name, email FROM users WHERE id = ? LIMIT 1").get(userId) ?? null;
}
