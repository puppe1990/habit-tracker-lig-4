import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { clearSessionCookie, createSession, hashPassword, setSessionCookie } from "../../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../../lib/turso";

export async function POST(request) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ error: "Turso is not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha precisa ter pelo menos 6 caracteres" }, { status: 400 });
    }

    await ensureSchema();
    const db = getTursoClient();

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });
    if (existing.rows.length) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 });
    }

    const userId = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
      args: [userId, name, email, hashPassword(password)],
    });

    const session = await createSession(db, userId);
    const response = NextResponse.json({
      ok: true,
      user: { id: userId, name, email },
    });
    clearSessionCookie(response);
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Signup failed:", error);
    return NextResponse.json({ error: "Falha ao criar conta" }, { status: 500 });
  }
}
