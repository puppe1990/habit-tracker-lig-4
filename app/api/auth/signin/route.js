import { createSession, setSessionCookie, verifyPassword } from "../../../../lib/auth";
import { getDatabase } from "../../../../lib/db";
import { findUserByEmail } from "../../../../lib/users";
import { corsJson, corsPreflight } from "../../../../lib/cors";

const CORS_METHODS = "POST, OPTIONS";

export function OPTIONS(request) {
  return corsPreflight(request, CORS_METHODS);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return corsJson(
        request,
        { error: "Email e senha são obrigatórios" },
        { status: 400 },
        CORS_METHODS,
      );
    }

    const db = getDatabase();
    const user = findUserByEmail(db, email);
    if (!user || !verifyPassword(password, String(user.password_hash))) {
      return corsJson(
        request,
        { error: "Email ou senha inválidos" },
        { status: 401 },
        CORS_METHODS,
      );
    }

    const session = createSession(db, String(user.id));
    const response = corsJson(
      request,
      {
        ok: true,
        sessionToken: session.token,
        user: { id: String(user.id), name: String(user.name), email: String(user.email) },
      },
      undefined,
      CORS_METHODS,
    );
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Signin failed:", error);
    return corsJson(request, { error: "Falha ao autenticar" }, { status: 500 }, CORS_METHODS);
  }
}
