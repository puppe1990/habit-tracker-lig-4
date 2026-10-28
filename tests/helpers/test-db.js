import { DatabaseSync } from "node:sqlite";
import { ensureSchema } from "../../lib/db.js";

export function createTestDatabase() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  ensureSchema(db);
  return db;
}

export function closeTestDatabase(db) {
  db.close();
}
