import { NextResponse } from "next/server";

export async function GET() {
  const gc = process.env.GLOBAL_CONFIG ?? "";
  return NextResponse.json({
    GLOBAL_CONFIG_preview: gc ? gc.slice(0, 40) + "…" : "MISSING",
    VERCEL_API_TOKEN:   process.env.VERCEL_API_TOKEN ? "SET" : "MISSING",
    NODE_ENV:           process.env.NODE_ENV,
  });
}
