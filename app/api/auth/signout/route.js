import { NextResponse } from "next/server";
import { clearSessionCookie, deleteSessionFromRequest } from "../../../../lib/auth";
import { ensureSchema, getTursoClient, isTursoConfigured } from "../../../../lib/turso";

export async function POST(request) {
  if (!isTursoConfigured()) {
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  }

  try {
    await ensureSchema();
    const db = getTursoClient();
    await deleteSessionFromRequest(db, request);
  } catch (error) {
    console.error("Signout cleanup failed:", error);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
