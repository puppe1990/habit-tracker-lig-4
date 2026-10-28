import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient, isUnauthorizedResponse } from "../chrome-extension/lib/api.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(data, { status = 200, ok = true } = {}) {
  return {
    status,
    ok,
    json: async () => data,
  };
}

describe("createApiClient", () => {
  it("monta URL, headers e devolve corpo parseado", async () => {
    const fetchMock = stubFetch(jsonResponse({ ok: true }));
    const apiRequest = createApiClient({
      baseUrl: "https://api.example",
      getToken: () => "token-123",
    });

    const { response, data } = await apiRequest("/api/state", {
      method: "PUT",
      body: JSON.stringify({ habits: [] }),
    });

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example/api/state");
    expect(options.headers.get("authorization")).toBe("Bearer token-123");
    expect(options.headers.get("content-type")).toBe("application/json");
  });

  it("omite Authorization sem token e Content-Type sem body", async () => {
    const fetchMock = stubFetch(jsonResponse(null));
    const apiRequest = createApiClient({ baseUrl: "https://api.example", getToken: () => null });

    await apiRequest("/api/state");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.get("authorization")).toBeNull();
    expect(options.headers.get("content-type")).toBeNull();
  });

  it("tolera resposta sem JSON", async () => {
    stubFetch({ status: 204, ok: true, json: async () => Promise.reject(new Error("no body")) });
    const apiRequest = createApiClient({ baseUrl: "https://api.example", getToken: () => null });

    await expect(apiRequest("/api/auth/signout", { method: "POST" })).resolves.toMatchObject({
      data: null,
    });
  });
});

describe("isUnauthorizedResponse", () => {
  it.each([
    [401, {}, true],
    [200, { user: null, configured: true }, true],
    [200, { user: null, configured: false }, false],
    [200, { user: { id: "1" } }, false],
    [500, {}, false],
  ])("status %i + body %o → %s", (status, data, expected) => {
    expect(isUnauthorizedResponse({ status, ok: status < 400 }, data)).toBe(expected);
  });
});
