import crypto from "node:crypto";
import { faker } from "@faker-js/faker";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  createSession,
  deleteSessionFromRequest,
  getUserFromRequest,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "../lib/auth.js";
import { insertSession } from "../lib/sessions.js";
import { insertUser } from "../lib/users.js";
import { closeTestDatabase, createTestDatabase } from "./helpers/test-db.js";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function buildRequest({ bearer = null, cookie = null } = {}) {
  return {
    headers: {
      get: (name) => (name.toLowerCase() === "authorization" ? bearer : null),
    },
    cookies: {
      get: (name) => (name === SESSION_COOKIE_NAME && cookie ? { value: cookie } : undefined),
    },
  };
}

function buildResponseWithCookies() {
  const stored = [];
  return {
    stored,
    cookies: {
      set(name, value, options) {
        stored.push({ name, value, options });
      },
    },
  };
}

function seedUser(db) {
  const user = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
  };
  insertUser(db, { ...user, passwordHash: hashPassword(faker.internet.password({ length: 16 })) });
  return user;
}

let db;

beforeEach(() => {
  faker.seed(20260228);
  db = createTestDatabase();
});

afterEach(() => {
  closeTestDatabase(db);
});

describe("hashPassword / verifyPassword", () => {
  it("gera hash no formato scrypt:salt:hash", () => {
    const stored = hashPassword(faker.internet.password({ length: 24 }));

    const [algo, salt, hash] = stored.split(":");
    expect(algo).toBe("scrypt");
    expect(salt).toMatch(/^[a-f0-9]{32}$/);
    expect(hash).toMatch(/^[a-f0-9]{128}$/);
  });

  it("valida a senha correta e rejeita a errada", () => {
    const password = faker.internet.password({ length: 24 });
    const stored = hashPassword(password);

    expect(verifyPassword(password, stored)).toBe(true);
    expect(verifyPassword(`${password}x`, stored)).toBe(false);
  });

  it("aceita senhas aleatórias do faker (seeded)", () => {
    const passwords = Array.from({ length: 20 }, () => faker.internet.password({ length: 24 }));

    for (const password of passwords) {
      const stored = hashPassword(password);
      expect(verifyPassword(password, stored)).toBe(true);
      expect(verifyPassword(`${password}x`, stored)).toBe(false);
    }
  });

  it.each([
    ["vazio", ""],
    ["algoritmo desconhecido", ["md5", "abc", "def"].join(":")],
    ["sem salt", ["scrypt", "", "abc"].join(":")],
    ["hash não hexadecimal", ["scrypt", "a".repeat(32), "z".repeat(128)].join(":")],
    ["hash com tamanho errado", ["scrypt", "a".repeat(32), "a".repeat(64)].join(":")],
  ])("rejeita hash inválido (%s)", (_label, stored) => {
    expect(verifyPassword(faker.internet.password({ length: 24 }), stored)).toBe(false);
  });
});

describe("createSession", () => {
  it("persiste o hash do token e devolve token/expiração", () => {
    const user = seedUser(db);

    const { token, expiresAt } = createSession(db, user.id);

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now());

    const row = db.prepare("SELECT * FROM sessions WHERE user_id = ?").get(user.id);
    expect(row.token_hash).toBe(sha256(token));
    expect(row.expires_at).toBe(expiresAt);
  });
});

describe("getUserFromRequest", () => {
  it("autentica via header Authorization: Bearer", () => {
    const user = seedUser(db);
    const { token } = createSession(db, user.id);

    const authenticated = getUserFromRequest(db, buildRequest({ bearer: `Bearer ${token}` }));

    expect(authenticated).toEqual({ id: user.id, name: user.name, email: user.email });
  });

  it("autentica via cookie de sessão", () => {
    const user = seedUser(db);
    const { token } = createSession(db, user.id);

    const authenticated = getUserFromRequest(db, buildRequest({ cookie: token }));

    expect(authenticated.id).toBe(user.id);
  });

  it("retorna null sem token", () => {
    expect(getUserFromRequest(db, buildRequest())).toBeNull();
  });

  it("retorna null quando a sessão não existe", () => {
    seedUser(db);

    expect(
      getUserFromRequest(db, buildRequest({ bearer: `Bearer ${faker.string.alphanumeric(32)}` })),
    ).toBeNull();
  });

  it("retorna null quando a sessão expirou", () => {
    const user = seedUser(db);
    const token = faker.string.alphanumeric(32);
    insertSession(db, {
      tokenHash: sha256(token),
      userId: user.id,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });

    expect(getUserFromRequest(db, buildRequest({ cookie: token }))).toBeNull();
  });
});

describe("deleteSessionFromRequest", () => {
  it("remove a sessão pelo hash do token", () => {
    const user = seedUser(db);
    const { token } = createSession(db, user.id);

    deleteSessionFromRequest(db, buildRequest({ cookie: token }));

    const count = db.prepare("SELECT COUNT(*) AS total FROM sessions").get().total;
    expect(count).toBe(0);
  });

  it("ignora token desconhecido", () => {
    expect(() =>
      deleteSessionFromRequest(db, buildRequest({ cookie: "token-inexistente" })),
    ).not.toThrow();
  });
});

describe("cookies de sessão", () => {
  it("setSessionCookie grava cookie httpOnly com expiração", () => {
    const response = buildResponseWithCookies();
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const token = faker.string.alphanumeric(32);

    setSessionCookie(response, token, expiresAt);

    expect(response.stored).toHaveLength(1);
    const [{ name, value, options }] = response.stored;
    expect(name).toBe(SESSION_COOKIE_NAME);
    expect(value).toBe(token);
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(options.expires).toEqual(new Date(expiresAt));
  });

  it("clearSessionCookie expira o cookie", () => {
    const response = buildResponseWithCookies();

    clearSessionCookie(response);

    const [{ value, options }] = response.stored;
    expect(value).toBe("");
    expect(options.expires).toEqual(new Date(0));
  });
});
