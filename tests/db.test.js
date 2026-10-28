import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { closeDatabase, ensureSchema, getDatabase, resolveDatabasePath } from "../lib/db.js";
import { insertUser, findUserByEmail, findUserById } from "../lib/users.js";
import { insertSession, findSessionUser, deleteSessionByTokenHash } from "../lib/sessions.js";
import { readStatePayload, writeStatePayload } from "../lib/user-state.js";
import { createTestDatabase } from "./helpers/test-db.js";

const createdDirs = [];

function useTempDatabasePath() {
  const dir = mkdtempSync(join(tmpdir(), "habit-db-"));
  createdDirs.push(dir);
  process.env.DATABASE_PATH = join(dir, "nested", "habits.sqlite");
  return process.env.DATABASE_PATH;
}

afterEach(() => {
  closeDatabase();
  delete process.env.DATABASE_PATH;
  while (createdDirs.length) rmSync(createdDirs.pop(), { recursive: true, force: true });
});

describe("ensureSchema", () => {
  it("cria as tabelas e é idempotente", () => {
    const db = createTestDatabase();

    expect(() => ensureSchema(db)).not.toThrow();
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => row.name);

    expect(tables).toEqual(expect.arrayContaining(["app_state", "sessions", "users"]));
    db.close();
  });
});

describe("getDatabase", () => {
  it("cria o arquivo e a pasta a partir de DATABASE_PATH", () => {
    const path = useTempDatabasePath();

    const db = getDatabase();
    db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)").run(
      "u1",
      "Ana",
      "ana@example.com",
      "scrypt:x:y",
    );

    expect(resolveDatabasePath()).toBe(path);
    expect(existsSync(path)).toBe(true);
  });

  it("reaproveita a conexão e persiste após reabrir", () => {
    useTempDatabasePath();
    getDatabase()
      .prepare("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)")
      .run("u1", "Ana", "ana@example.com", "scrypt:x:y");

    expect(getDatabase()).toBe(getDatabase());

    closeDatabase();
    const reopened = getDatabase();
    expect(findUserById(reopened, "u1")).toMatchObject({ id: "u1", email: "ana@example.com" });
  });
});

describe("users", () => {
  it("insere e busca por email/id", () => {
    const db = createTestDatabase();
    insertUser(db, {
      id: "u1",
      name: "Ana",
      email: "ana@example.com",
      passwordHash: "scrypt:x:y",
    });

    expect(findUserByEmail(db, "ana@example.com")).toMatchObject({ id: "u1", name: "Ana" });
    expect(findUserById(db, "u1")).toMatchObject({ email: "ana@example.com" });
    expect(findUserByEmail(db, "missing@example.com")).toBeNull();
    db.close();
  });

  it("rejeita email duplicado", () => {
    const db = createTestDatabase();
    const user = { name: "Ana", email: "ana@example.com", passwordHash: "scrypt:x:y" };
    insertUser(db, { ...user, id: "u1" });

    expect(() => insertUser(db, { ...user, id: "u2" })).toThrow(/UNIQUE/);
    db.close();
  });
});

describe("sessions", () => {
  it("insere, busca por hash válido e remove", () => {
    const db = createTestDatabase();
    insertUser(db, {
      id: "u1",
      name: "Ana",
      email: "ana@example.com",
      passwordHash: "scrypt:x:y",
    });
    const future = new Date(Date.now() + 60_000).toISOString();

    insertSession(db, { tokenHash: "hash-1", userId: "u1", expiresAt: future });

    expect(findSessionUser(db, "hash-1", new Date().toISOString())).toMatchObject({ id: "u1" });
    expect(findSessionUser(db, "hash-1", new Date(Date.now() + 120_000).toISOString())).toBeNull();

    deleteSessionByTokenHash(db, "hash-1");
    expect(findSessionUser(db, "hash-1", new Date().toISOString())).toBeNull();
    db.close();
  });
});

describe("user state", () => {
  it("grava, lê e sobrescreve por usuário", () => {
    const db = createTestDatabase();
    insertUser(db, {
      id: "u1",
      name: "Ana",
      email: "ana@example.com",
      passwordHash: "scrypt:x:y",
    });

    expect(readStatePayload(db, "u1")).toBeNull();

    writeStatePayload(db, "u1", JSON.stringify({ habits: ["ler"] }));
    expect(JSON.parse(readStatePayload(db, "u1"))).toEqual({ habits: ["ler"] });

    writeStatePayload(db, "u1", JSON.stringify({ habits: ["correr"] }));
    expect(JSON.parse(readStatePayload(db, "u1"))).toEqual({ habits: ["correr"] });
    db.close();
  });
});
