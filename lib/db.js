import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const DEFAULT_DATABASE_PATH = ".data/habits.sqlite";

let database = null;

export function resolveDatabasePath() {
  return resolve(process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH);
}

export function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)");

  const appStateColumns = db.prepare("PRAGMA table_info(app_state)").all();
  const hasLegacyAppState =
    appStateColumns.length > 0 &&
    !appStateColumns.some((column) => String(column.name) === "user_id");

  if (hasLegacyAppState) {
    db.exec(`ALTER TABLE app_state RENAME TO app_state_legacy_${Date.now()}`);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      user_id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

function openDatabase(path) {
  mkdirSync(dirname(path), { recursive: true });

  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  ensureSchema(db);
  return db;
}

export function getDatabase() {
  if (!database) database = openDatabase(resolveDatabasePath());
  return database;
}

export function closeDatabase() {
  if (!database) return;
  database.close();
  database = null;
}
