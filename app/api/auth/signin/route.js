import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  createSession,
  setSessionCookie,
  verifyPassword,
} from "../../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../../lib/turso";

export async function POST(request) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ error: "Turso is not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    await ensureSchema();
    const db = getTursoClient();
    const result = await db.execute({
      sql: "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });

    if (!result.rows.length) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
    }

    const row = result.rows[0];
    const valid = verifyPassword(password, String(row.password_hash));
    if (!valid) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
    }

    const session = await createSession(db, String(row.id));
    const response = NextResponse.json({
      ok: true,
      user: {
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
      },
    });
    clearSessionCookie(response);
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Signin failed:", error);
    return NextResponse.json({ error: "Falha ao autenticar" }, { status: 500 });
  }
}
