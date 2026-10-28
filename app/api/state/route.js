import { getUserFromRequest } from "../../../lib/auth";
import { getDatabase } from "../../../lib/db";
import { readStatePayload, writeStatePayload } from "../../../lib/user-state";
import { DEFAULT_APP_STATE, normalizeAppState } from "../../../lib/habits/state";
import { corsJson, corsPreflight } from "../../../lib/cors";

const CORS_METHODS = "GET, PUT, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function GET(request) {
  try {
    const db = getDatabase();
    const user = getUserFromRequest(db, request);
    if (!user) {
      return corsJson(request, { authenticated: false }, { status: 401 }, CORS_METHODS);
    }

    const payload = readStatePayload(db, user.id);
    const state = payload ? normalizeAppState(JSON.parse(payload)) : DEFAULT_APP_STATE;

    return corsJson(request, { authenticated: true, user, state }, undefined, CORS_METHODS);
  } catch (error) {
    console.error("Failed to load state:", error);
    return corsJson(request, { error: "Failed to load state" }, { status: 500 }, CORS_METHODS);
  }
}

export async function PUT(request) {
  try {
    const incoming = await request.json();
    const state = normalizeAppState(incoming);

    const db = getDatabase();
    const user = getUserFromRequest(db, request);
    if (!user) {
      return corsJson(request, { authenticated: false }, { status: 401 }, CORS_METHODS);
    }

    writeStatePayload(db, user.id, JSON.stringify(state));
    return corsJson(request, { ok: true }, undefined, CORS_METHODS);
  } catch (error) {
    console.error("Failed to save state:", error);
    return corsJson(request, { error: "Failed to save state" }, { status: 500 }, CORS_METHODS);
  }
}
