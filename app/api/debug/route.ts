import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    KV_REST_API_URL:   process.env.KV_REST_API_URL ? "SET" : "MISSING",
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "SET" : "MISSING",
    NODE_ENV:          process.env.NODE_ENV,
  });
}
