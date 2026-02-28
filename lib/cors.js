import { NextResponse } from "next/server";

const STATIC_ALLOWED_ORIGINS = new Set(
  [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.URL,
    "https://habit-tracker-lig-4.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean),
);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin.startsWith("chrome-extension://")) return true;
  return STATIC_ALLOWED_ORIGINS.has(origin);
}

function setAllowHeaders(response, request, methods) {
  const origin = request.headers.get("origin");
  if (!origin || !isAllowedOrigin(origin)) return response;

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Vary", "Origin");
  response.headers.set("Access-Control-Allow-Methods", methods);
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export function corsJson(request, data, init, methods) {
  return setAllowHeaders(NextResponse.json(data, init), request, methods);
}

export function corsPreflight(request, methods) {
  return setAllowHeaders(new NextResponse(null, { status: 204 }), request, methods);
}
