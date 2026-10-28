import { getUserFromRequest } from "../../../../lib/auth";
import { getDatabase } from "../../../../lib/db";
import { corsJson, corsPreflight } from "../../../../lib/cors";

const CORS_METHODS = "GET, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function GET(request) {
  try {
    const user = getUserFromRequest(getDatabase(), request);
    if (!user) {
      return corsJson(request, { user: null }, { status: 401 }, CORS_METHODS);
    }

    return corsJson(request, { user }, undefined, CORS_METHODS);
  } catch (error) {
    console.error("Failed to get current user:", error);
    return corsJson(request, { error: "Falha ao buscar usuário" }, { status: 500 }, CORS_METHODS);
  }
}
