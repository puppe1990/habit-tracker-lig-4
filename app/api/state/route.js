import { getUserFromRequest } from "../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../lib/turso";
import { corsJson, corsPreflight } from "../../../lib/cors";

const DEFAULT_STATE = {
  habits: [],
  records: {},
  darkMode: false,
  isHorizontalLayout: true,
};

const normalizeState = (value = {}) => ({
  habits: Array.isArray(value.habits) ? value.habits : [],
  records: value.records && typeof value.records === "object" ? value.records : {},
  darkMode: Boolean(value.darkMode),
  isHorizontalLayout:
    value.isHorizontalLayout === undefined ? true : Boolean(value.isHorizontalLayout),
});

const CORS_METHODS = "GET, PUT, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function GET(request) {
  if (!isTursoConfigured()) {
    return corsJson(request, { configured: false, state: null }, undefined, CORS_METHODS);
  }

  try {
    await ensureSchema();
    const db = getTursoClient();
    const user = await getUserFromRequest(db, request);
    if (!user) {
      return corsJson(
        request,
        { configured: true, authenticated: false },
        { status: 401 },
        CORS_METHODS,
      );
    }

    const result = await db.execute({
      sql: "SELECT payload FROM app_state WHERE user_id = ?",
      args: [user.id],
    });

    if (!result.rows.length) {
      return corsJson(
        request,
        { configured: true, authenticated: true, user, state: DEFAULT_STATE },
        undefined,
        CORS_METHODS,
      );
    }

    const row = result.rows[0];
    const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : DEFAULT_STATE;
    return corsJson(
      request,
      {
        configured: true,
        authenticated: true,
        user,
        state: normalizeState(payload),
      },
      undefined,
      CORS_METHODS,
    );
  } catch (error) {
    console.error("Failed to load Turso state:", error);
    return corsJson(request, { error: "Failed to load state" }, { status: 500 }, CORS_METHODS);
  }
}

export async function PUT(request) {
  if (!isTursoConfigured()) {
    return corsJson(request, { error: "Turso is not configured" }, { status: 503 }, CORS_METHODS);
  }

  try {
    const incoming = await request.json();
    const state = normalizeState(incoming);

    await ensureSchema();
    const db = getTursoClient();
    const user = await getUserFromRequest(db, request);
    if (!user) {
      return corsJson(
        request,
        { configured: true, authenticated: false },
        { status: 401 },
        CORS_METHODS,
      );
    }

    await db.execute({
      sql: `
        INSERT INTO app_state (user_id, payload, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          payload = excluded.payload,
          updated_at = CURRENT_TIMESTAMP
      `,
      args: [user.id, JSON.stringify(state)],
    });

    return corsJson(request, { ok: true }, undefined, CORS_METHODS);
  } catch (error) {
    console.error("Failed to save Turso state:", error);
    return corsJson(request, { error: "Failed to save state" }, { status: 500 }, CORS_METHODS);
  }
}
