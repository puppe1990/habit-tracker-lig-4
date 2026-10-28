import { describe, expect, it } from "vitest";
import { corsJson, corsPreflight } from "../lib/cors.js";

function buildRequest(origin) {
  return {
    headers: {
      get: (name) => (name.toLowerCase() === "origin" ? (origin ?? null) : null),
    },
  };
}

const METHODS = "GET, PUT, OPTIONS";

describe("corsPreflight", () => {
  it.each([
    ["produção", "https://habit-tracker-lig-4.apps.gestaobem.com"],
    ["localhost", "http://localhost:3000"],
    ["loopback", "http://127.0.0.1:3000"],
    ["dev alternativo", "http://localhost:8791"],
    ["extensão chrome", "chrome-extension://abcdefghijklmnop"],
  ])("libera origem permitida (%s)", (_label, origin) => {
    const response = corsPreflight(buildRequest(origin), METHODS);

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(origin);
    expect(response.headers.get("access-control-allow-methods")).toBe(METHODS);
    expect(response.headers.get("access-control-allow-headers")).toContain("Authorization");
    expect(response.headers.get("vary")).toBe("Origin");
  });

  it("não envia headers para origem desconhecida", () => {
    const response = corsPreflight(buildRequest("https://evil.example"), METHODS);

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("não envia headers quando não há Origin", () => {
    const response = corsPreflight(buildRequest(), METHODS);

    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("corsJson", () => {
  it("mantém status e corpo e adiciona CORS", async () => {
    const response = corsJson(
      buildRequest("http://localhost:3000"),
      { ok: true },
      { status: 201 },
      METHODS,
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("não adiciona CORS para origem não autorizada", () => {
    const response = corsJson(
      buildRequest("https://evil.example"),
      { ok: true },
      undefined,
      METHODS,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});
