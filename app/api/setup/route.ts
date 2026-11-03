import { NextResponse } from "next/server";
import { setupSchema, seedData } from "@/lib/db";

export async function POST() {
  try {
    await setupSchema();
    await seedData();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
