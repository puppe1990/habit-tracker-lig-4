import { afterEach, describe, expect, it, vi } from "vitest";
import { createStateStore } from "../chrome-extension/lib/store.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function chromeStorageWith(value) {
  const saved = {};
  return {
    saved,
    get: (keys, callback) => callback(keys.includes("k") ? { k: value } : {}),
    set: (entry) => Object.assign(saved, entry),
  };
}

function webStorageWith(value) {
  const saved = {};
  return {
    saved,
    getItem: () => value,
    setItem: (key, raw) => {
      saved[key] = raw;
    },
  };
}

describe("createStateStore", () => {
  it("lê e grava via chrome.storage", async () => {
    const chromeStorage = chromeStorageWith({ habits: ["ler"] });
    const store = createStateStore({ storageKey: "k", chromeStorage });

    await expect(store.load()).resolves.toEqual({ habits: ["ler"] });

    store.save({ habits: ["correr"] });
    expect(chromeStorage.saved).toEqual({ k: { habits: ["correr"] } });
  });

  it("retorna null quando chrome.storage não tem a chave", async () => {
    const store = createStateStore({
      storageKey: "missing",
      chromeStorage: chromeStorageWith(null),
    });

    await expect(store.load()).resolves.toBeNull();
  });

  it("usa localStorage quando chrome.storage não existe", async () => {
    const webStorage = webStorageWith('{"habits":["beber água"]}');
    const store = createStateStore({ storageKey: "k", webStorage });

    await expect(store.load()).resolves.toEqual({ habits: ["beber água"] });

    store.save({ habits: [] });
    expect(webStorage.saved).toEqual({ k: '{"habits":[]}' });
  });

  it("retorna null para JSON corrompido", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = createStateStore({ storageKey: "k", webStorage: webStorageWith("{not json") });

    await expect(store.load()).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalled();
  });
});
