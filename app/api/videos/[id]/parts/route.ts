import { NextRequest, NextResponse } from "next/server";
import { addPart, deletePart } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.part_number) {
      return NextResponse.json({ error: "part_number is required" }, { status: 400 });
    }
    const part = await addPart(Number(id), body);
    return NextResponse.json(part, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await params; // ensure params are resolved
    const { searchParams } = new URL(req.url);
    const partId = searchParams.get("partId");
    if (!partId) return NextResponse.json({ error: "partId required" }, { status: 400 });
    await deletePart(Number(partId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
