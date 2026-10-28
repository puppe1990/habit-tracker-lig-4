import { clearSessionCookie, deleteSessionFromRequest } from "../../../../lib/auth";
import { getDatabase } from "../../../../lib/db";
import { corsJson, corsPreflight } from "../../../../lib/cors";

const CORS_METHODS = "POST, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function POST(request) {
  try {
    deleteSessionFromRequest(getDatabase(), request);
  } catch (error) {
    console.error("Signout cleanup failed:", error);
  }

  const response = corsJson(request, { ok: true }, undefined, CORS_METHODS);
  clearSessionCookie(response);
  return response;
}
