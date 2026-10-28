export const DEFAULT_APP_STATE = {
  habits: [],
  records: {},
  darkMode: false,
  isHorizontalLayout: true,
};

export function normalizeAppState(value = {}) {
  return {
    habits: Array.isArray(value.habits) ? value.habits : [],
    records: value.records && typeof value.records === "object" ? value.records : {},
    darkMode: Boolean(value.darkMode),
    isHorizontalLayout:
      value.isHorizontalLayout === undefined ? true : Boolean(value.isHorizontalLayout),
  };
}
