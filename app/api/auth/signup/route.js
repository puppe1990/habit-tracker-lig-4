import crypto from "node:crypto";
import { createSession, hashPassword, setSessionCookie } from "../../../../lib/auth";
import { getDatabase } from "../../../../lib/db";
import { findUserByEmail, insertUser } from "../../../../lib/users";
import { corsJson, corsPreflight } from "../../../../lib/cors";

const CORS_METHODS = "POST, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
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

    const db = getDatabase();
    if (findUserByEmail(db, email)) {
      return corsJson(
        request,
        { error: "Este email já está cadastrado" },
        { status: 409 },
        CORS_METHODS,
      );
    }

    const userId = crypto.randomUUID();
    insertUser(db, { id: userId, name, email, passwordHash: hashPassword(password) });

    const session = createSession(db, userId);
    const response = corsJson(
      request,
      { ok: true, sessionToken: session.token, user: { id: userId, name, email } },
      undefined,
      CORS_METHODS,
    );
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Signup failed:", error);
    return corsJson(request, { error: "Falha ao criar conta" }, { status: 500 }, CORS_METHODS);
  }
}
