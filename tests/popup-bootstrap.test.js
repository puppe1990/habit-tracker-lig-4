// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const popupHtml = readFileSync(resolve(process.cwd(), "chrome-extension/popup.html"), "utf8");
const bodyHtml = popupHtml
  .match(/<body>([\s\S]*)<\/body>/)[1]
  .replace(/<script[\s\S]*?<\/script>/, "");

function createChromeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    local: {
      get(keys, callback) {
        callback(
          Object.fromEntries(keys.filter((key) => key in data).map((key) => [key, data[key]])),
        );
      },
      set(entry) {
        Object.assign(data, entry);
      },
    },
  };
}

function stubApi(handlers) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const handler = handlers[`${options.method ?? "GET"} ${new URL(url).pathname}`];
    if (!handler) throw new Error(`Unexpected request: ${options.method ?? "GET"} ${url}`);
    return { status: 200, ok: true, json: async () => handler() };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function loadPopup({ chromeStorage, apiHandlers }) {
  vi.stubGlobal("chrome", { storage: { local: chromeStorage.local } });
  stubApi(apiHandlers);
  vi.resetModules();
  document.body.innerHTML = bodyHtml;
  await import("../chrome-extension/popup.js");
}

beforeEach(() => {
  vi.stubGlobal("crypto", globalThis.crypto);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("popup bootstrap sem sessão", () => {
  it("mostra a tela de login e alterna para cadastro", async () => {
    const chromeStorage = createChromeStorage();

    await loadPopup({
      chromeStorage,
      apiHandlers: {
        "GET /api/auth/me": () => ({ configured: false, user: null }),
      },
    });

    await vi.waitFor(() => {
      expect(document.getElementById("auth-view").classList.contains("hidden")).toBe(false);
    });

    expect(document.getElementById("tracker-view").classList.contains("hidden")).toBe(true);
    expect(document.querySelector(".brand p").textContent).toBe("LIG-4 no popup");
    expect(document.getElementById("signin-form").classList.contains("hidden")).toBe(false);

    document.getElementById("tab-signup").click();
    expect(document.getElementById("signup-form").classList.contains("hidden")).toBe(false);
    expect(document.getElementById("signin-form").classList.contains("hidden")).toBe(true);
  });

  it("alterna a visibilidade da senha", async () => {
    const chromeStorage = createChromeStorage();

    await loadPopup({
      chromeStorage,
      apiHandlers: {
        "GET /api/auth/me": () => ({ configured: false, user: null }),
      },
    });

    await vi.waitFor(() => {
      expect(document.querySelector(".password-toggle")).not.toBeNull();
    });

    const toggle = document.querySelector(".password-toggle");
    toggle.click();
    expect(document.getElementById("signin-password").type).toBe("text");
    toggle.click();
    expect(document.getElementById("signin-password").type).toBe("password");
  });
});

describe("popup com sessão persistida", () => {
  it("valida a sessão, renderiza hábitos e resumo", async () => {
    const user = { id: "u1", name: "Ana", email: "ana@example.com" };
    const habits = [{ id: "h1", name: "Ler" }];
    const records = { "2026-10": { h1: { 1: "done", 2: "missed" } } };
    const chromeStorage = createChromeStorage({
      habit_tracker_extension_netlify_v1: {
        sessionToken: "token",
        user,
        habits,
        records,
      },
    });

    await loadPopup({
      chromeStorage,
      apiHandlers: {
        "GET /api/auth/me": () => ({ configured: true, user }),
        "GET /api/state": () => ({ configured: true, user, state: { habits, records } }),
      },
    });

    await vi.waitFor(() => {
      expect(document.querySelectorAll(".habit-item")).toHaveLength(1);
    });

    expect(document.getElementById("tracker-view").classList.contains("hidden")).toBe(false);
    expect(document.getElementById("auth-view").classList.contains("hidden")).toBe(true);
    expect(document.querySelector(".habit-name").textContent).toBe("Ler");
    expect(document.querySelector(".summary-item-title").textContent).toBe("Ler");
    expect(document.querySelector(".state-btn").textContent).toBe("Sem marcação");

    document.getElementById("tab-summary").click();
    expect(document.getElementById("summary-panel").classList.contains("hidden")).toBe(false);
    expect(document.querySelectorAll(".summary-card")).toHaveLength(4);
  });
});
