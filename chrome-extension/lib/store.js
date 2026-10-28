export function createStateStore({ storageKey, chromeStorage, webStorage }) {
  return {
    async load() {
      if (!chromeStorage) {
        try {
          const raw = webStorage.getItem(storageKey);
          return raw ? JSON.parse(raw) : null;
        } catch (error) {
          console.error("Failed to parse local storage:", error);
          return null;
        }
      }

      const result = await new Promise((resolve) => {
        chromeStorage.get([storageKey], resolve);
      });

      return result?.[storageKey] ?? null;
    },

    save(payload) {
      if (!chromeStorage) {
        webStorage.setItem(storageKey, JSON.stringify(payload));
        return;
      }

      chromeStorage.set({ [storageKey]: payload });
    },
  };
}
