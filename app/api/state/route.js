import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../lib/turso";

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

export async function GET(request) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ configured: false, state: null });
  }

  try {
    await ensureSchema();
    const db = getTursoClient();
    const user = await getUserFromRequest(db, request);
    if (!user) {
      return NextResponse.json({ configured: true, authenticated: false }, { status: 401 });
    }

    const result = await db.execute({
      sql: "SELECT payload FROM app_state WHERE user_id = ?",
      args: [user.id],
    });

    if (!result.rows.length) {
      return NextResponse.json({ configured: true, authenticated: true, user, state: DEFAULT_STATE });
    }

    const row = result.rows[0];
    const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : DEFAULT_STATE;
    return NextResponse.json({
      configured: true,
      authenticated: true,
      user,
      state: normalizeState(payload),
    });
  } catch (error) {
    console.error("Failed to load Turso state:", error);
    return NextResponse.json({ error: "Failed to load state" }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ error: "Turso is not configured" }, { status: 503 });
  }

  try {
    const incoming = await request.json();
    const state = normalizeState(incoming);

    await ensureSchema();
    const db = getTursoClient();
    const user = await getUserFromRequest(db, request);
    if (!user) {
      return NextResponse.json({ configured: true, authenticated: false }, { status: 401 });
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save Turso state:", error);
    return NextResponse.json({ error: "Failed to save state" }, { status: 500 });
  }
}
