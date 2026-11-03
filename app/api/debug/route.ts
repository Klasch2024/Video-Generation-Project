import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    EDGE_CONFIG:        process.env.EDGE_CONFIG ? "SET" : "MISSING",
    VERCEL_API_TOKEN:   process.env.VERCEL_API_TOKEN ? "SET" : "MISSING",
    POSTGRES_URL:       process.env.POSTGRES_URL ? "SET" : "MISSING",
    NODE_ENV:           process.env.NODE_ENV,
  });
}
