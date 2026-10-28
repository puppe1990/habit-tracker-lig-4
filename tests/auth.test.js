import crypto from "node:crypto";
import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it } from "vitest";
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

function buildDb({ rows = [], onExecute } = {}) {
  const calls = [];
  return {
    calls,
    async execute(query) {
      calls.push(query);
      if (onExecute) return onExecute(query);
      return { rows };
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

beforeEach(() => {
  faker.seed(20260228);
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
  it("persiste o hash do token e devolve token/expiração", async () => {
    const db = buildDb();

    const { token, expiresAt } = await createSession(db, "user-1");

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now());

    const insert = db.calls[0];
    expect(insert.sql).toContain("INSERT INTO sessions");
    expect(insert.args).toEqual([sha256(token), "user-1", expiresAt]);
  });
});

describe("getUserFromRequest", () => {
  const userRow = () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
  });

  it("autentica via header Authorization: Bearer", async () => {
    const row = userRow();
    const db = buildDb({ rows: [row] });
    const request = buildRequest({ bearer: `Bearer ${faker.string.alphanumeric(32)}` });

    const user = await getUserFromRequest(db, request);

    expect(user).toEqual({ id: String(row.id), name: String(row.name), email: String(row.email) });
    expect(db.calls[0].sql).toContain("FROM sessions");
  });

  it("autentica via cookie de sessão", async () => {
    const row = userRow();
    const token = faker.string.alphanumeric(32);
    let capturedHash = null;
    const db = buildDb({
      onExecute: (query) => {
        capturedHash = query.args[0];
        return { rows: [row] };
      },
    });

    const user = await getUserFromRequest(db, buildRequest({ cookie: token }));

    expect(user.id).toBe(String(row.id));
    expect(capturedHash).toBe(sha256(token));
  });

  it("retorna null sem token e não consulta o banco", async () => {
    const db = buildDb();

    await expect(getUserFromRequest(db, buildRequest())).resolves.toBeNull();
    expect(db.calls).toHaveLength(0);
  });

  it("retorna null quando a sessão não existe ou expirou", async () => {
    const db = buildDb({ rows: [] });
    const token = faker.string.alphanumeric(32);

    await expect(
      getUserFromRequest(db, buildRequest({ bearer: `Bearer ${token}` })),
    ).resolves.toBeNull();
  });
});

describe("deleteSessionFromRequest", () => {
  it("remove a sessão pelo hash do token", async () => {
    const token = faker.string.alphanumeric(32);
    const db = buildDb();

    await deleteSessionFromRequest(db, buildRequest({ cookie: token }));

    expect(db.calls[0].sql).toContain("DELETE FROM sessions");
    expect(db.calls[0].args).toEqual([sha256(token)]);
  });

  it("não faz nada sem token", async () => {
    const db = buildDb();

    await deleteSessionFromRequest(db, buildRequest());

    expect(db.calls).toHaveLength(0);
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
