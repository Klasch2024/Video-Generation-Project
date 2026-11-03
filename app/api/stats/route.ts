import { NextResponse } from "next/server";
import { getStats } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
