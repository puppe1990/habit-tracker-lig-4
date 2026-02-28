import { clearSessionCookie, deleteSessionFromRequest } from "../../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../../lib/turso";
import { corsJson, corsPreflight } from "../../../../lib/cors";

const CORS_METHODS = "POST, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function POST(request) {
  if (!isTursoConfigured()) {
    const response = corsJson(request, { ok: true }, undefined, CORS_METHODS);
    clearSessionCookie(response);
    return response;
  }

  try {
    await ensureSchema();
    const db = getTursoClient();
    await deleteSessionFromRequest(db, request);
  } catch (error) {
    console.error("Signout cleanup failed:", error);
  }

  const response = corsJson(request, { ok: true }, undefined, CORS_METHODS);
  clearSessionCookie(response);
  return response;
}
