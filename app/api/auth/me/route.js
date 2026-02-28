import { getUserFromRequest } from "../../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../../lib/turso";
import { corsJson, corsPreflight } from "../../../../lib/cors";

const CORS_METHODS = "GET, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function GET(request) {
  if (!isTursoConfigured()) {
    return corsJson(request, { configured: false, user: null }, undefined, CORS_METHODS);
  }

  try {
    await ensureSchema();
    const db = getTursoClient();
    const user = await getUserFromRequest(db, request);
    if (!user) {
      return corsJson(request, { configured: true, user: null }, { status: 401 }, CORS_METHODS);
    }

    return corsJson(request, { configured: true, user }, undefined, CORS_METHODS);
  } catch (error) {
    console.error("Failed to get current user:", error);
    return corsJson(request, { error: "Falha ao buscar usuário" }, { status: 500 }, CORS_METHODS);
  }
}
