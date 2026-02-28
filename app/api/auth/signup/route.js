import crypto from "node:crypto";
import { clearSessionCookie, createSession, hashPassword, setSessionCookie } from "../../../../lib/auth";
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
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!name || !email || !password) {
      return corsJson(
        request,
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 },
        CORS_METHODS,
      );
    }

    if (password.length < 6) {
      return corsJson(
        request,
        { error: "A senha precisa ter pelo menos 6 caracteres" },
        { status: 400 },
        CORS_METHODS,
      );
    }

    await ensureSchema();
    const db = getTursoClient();

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });
    if (existing.rows.length) {
      return corsJson(request, { error: "Este email já está cadastrado" }, { status: 409 }, CORS_METHODS);
    }

    const userId = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
      args: [userId, name, email, hashPassword(password)],
    });

    const session = await createSession(db, userId);
    const response = corsJson(request, {
      ok: true,
      sessionToken: session.token,
      user: { id: userId, name, email },
    }, undefined, CORS_METHODS);
    clearSessionCookie(response);
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Signup failed:", error);
    return corsJson(request, { error: "Falha ao criar conta" }, { status: 500 }, CORS_METHODS);
  }
}
