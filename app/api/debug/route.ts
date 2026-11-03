import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    POSTGRES_URL: process.env.POSTGRES_URL ? "SET" : "MISSING",
    NODE_ENV:     process.env.NODE_ENV,
  });
}
