import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../../lib/turso";

export async function GET(request) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ configured: false, user: null });
  }

  try {
    await ensureSchema();
    const db = getTursoClient();
    const user = await getUserFromRequest(db, request);
    if (!user) {
      return NextResponse.json({ configured: true, user: null }, { status: 401 });
    }

    return NextResponse.json({ configured: true, user });
  } catch (error) {
    console.error("Failed to get current user:", error);
    return NextResponse.json({ error: "Falha ao buscar usuário" }, { status: 500 });
  }
}
