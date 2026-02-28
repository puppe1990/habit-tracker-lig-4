import {
  clearSessionCookie,
  createSession,
  setSessionCookie,
  verifyPassword,
} from "../../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../../lib/turso";
import { corsJson, corsPreflight } from "../../../../lib/cors";

const CORS_METHODS = "POST, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function POST(request) {
  if (!isTursoConfigured()) {
    return corsJson(request, { error: "Turso is not configured" }, { status: 503 }, CORS_METHODS);
  }

  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return corsJson(
        request,
        { error: "Email e senha são obrigatórios" },
        { status: 400 },
        CORS_METHODS,
      );
    }

    await ensureSchema();
    const db = getTursoClient();
    const result = await db.execute({
      sql: "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    if (!result.rows.length) {
      return corsJson(request, { error: "Email ou senha inválidos" }, { status: 401 }, CORS_METHODS);
    }

    const row = result.rows[0];
    const valid = verifyPassword(password, String(row.password_hash));
    if (!valid) {
      return corsJson(request, { error: "Email ou senha inválidos" }, { status: 401 }, CORS_METHODS);
    }

    const session = await createSession(db, String(row.id));
    const response = corsJson(request, {
      ok: true,
      sessionToken: session.token,
      user: {
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
      },
    }, undefined, CORS_METHODS);
    clearSessionCookie(response);
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Signin failed:", error);
    return corsJson(request, { error: "Falha ao autenticar" }, { status: 500 }, CORS_METHODS);
  }
}
