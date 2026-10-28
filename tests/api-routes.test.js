import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let routes;
let closeDatabase;
let databasePath;

function jsonRequest(body, { bearer = null, cookie = null } = {}) {
  return {
    headers: {
      get: (name) => (name.toLowerCase() === "authorization" && bearer ? `Bearer ${bearer}` : null),
    },
    cookies: {
      get: (name) => (name === "ht_session" && cookie ? { value: cookie } : undefined),
    },
    json: async () => body,
  };
}

async function signUp(name, email, password) {
  const response = await routes.signup.POST(jsonRequest({ name, email, password }));
  return { response, body: await response.json() };
}

beforeAll(async () => {
  const dir = mkdtempSync(join(tmpdir(), "habit-api-"));
  databasePath = join(dir, "habits.sqlite");
  process.env.DATABASE_PATH = databasePath;
  vi.resetModules();

  closeDatabase = (await import("../lib/db.js")).closeDatabase;
  routes = {
    signup: await import("../app/api/auth/signup/route.js"),
    signin: await import("../app/api/auth/signin/route.js"),
    me: await import("../app/api/auth/me/route.js"),
    signout: await import("../app/api/auth/signout/route.js"),
    state: await import("../app/api/state/route.js"),
  };
});

afterAll(() => {
  closeDatabase();
  delete process.env.DATABASE_PATH;
  rmSync(join(databasePath, ".."), { recursive: true, force: true });
});

describe("POST /api/auth/signup", () => {
  it("cria conta, devolve token e cookie", async () => {
    const { response, body } = await signUp("Ana", "ana@example.com", "segredo123");

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({ name: "Ana", email: "ana@example.com" });
    expect(body.sessionToken).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(response.cookies.get("ht_session")?.value).toBe(body.sessionToken);
  });

  it("rejeita email duplicado", async () => {
    await signUp("Ana", "duplicado@example.com", "segredo123");

    const { response } = await signUp("Outra", "duplicado@example.com", "segredo123");
    expect(response.status).toBe(409);
  });

  it("rejeita campos faltando e senha curta", async () => {
    const missing = await signUp("", "x@example.com", "segredo123");
    expect(missing.response.status).toBe(400);

    const short = await signUp("Ana", "curta@example.com", "123");
    expect(short.response.status).toBe(400);
  });
});

describe("POST /api/auth/signin", () => {
  it("autentica com senha correta", async () => {
    await signUp("Bia", "bia@example.com", "segredo123");

    const response = await routes.signin.POST(
      jsonRequest({ email: "BIA@example.com", password: "segredo123" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.email).toBe("bia@example.com");
  });

  it("rejeita senha errada e email desconhecido", async () => {
    await signUp("Bia", "bia2@example.com", "segredo123");

    const wrong = await routes.signin.POST(
      jsonRequest({ email: "bia2@example.com", password: "errada" }),
    );
    const unknown = await routes.signin.POST(
      jsonRequest({ email: "ninguem@example.com", password: "segredo123" }),
    );

    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
  });
});

describe("sessão e estado", () => {
  it("GET /api/auth/me exige token e devolve o usuário", async () => {
    const { body } = await signUp("Caio", "caio@example.com", "segredo123");

    const unauthorized = await routes.me.GET(jsonRequest());
    expect(unauthorized.status).toBe(401);

    const authorized = await routes.me.GET(jsonRequest({}, { bearer: body.sessionToken }));
    expect(authorized.status).toBe(200);
    await expect(authorized.json()).resolves.toMatchObject({
      user: { email: "caio@example.com" },
    });
  });

  it("GET /api/state devolve estado padrão e PUT persiste", async () => {
    const { body } = await signUp("Duda", "duda@example.com", "segredo123");
    const auth = { bearer: body.sessionToken };

    const initial = await routes.state.GET(jsonRequest({}, auth));
    await expect(initial.json()).resolves.toMatchObject({
      state: { habits: [], records: {}, darkMode: false, isHorizontalLayout: true },
    });

    const put = await routes.state.PUT(
      jsonRequest({ habits: [{ id: "h1", name: "Ler" }], records: { "2026-10": {} } }, auth),
    );
    expect(put.status).toBe(200);

    const loaded = await routes.state.GET(jsonRequest({}, auth));
    const loadedBody = await loaded.json();
    expect(loadedBody.state.habits).toEqual([{ id: "h1", name: "Ler" }]);
  });

  it("PUT /api/state exige autenticação", async () => {
    const response = await routes.state.PUT(jsonRequest({ habits: [] }));

    expect(response.status).toBe(401);
  });

  it("POST /api/auth/signout invalida a sessão", async () => {
    const { body } = await signUp("Eva", "eva@example.com", "segredo123");
    const auth = { bearer: body.sessionToken };

    const signout = await routes.signout.POST(jsonRequest({}, auth));
    expect(signout.status).toBe(200);

    const me = await routes.me.GET(jsonRequest({}, auth));
    expect(me.status).toBe(401);
  });
});
