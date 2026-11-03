import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo, deleteVideo } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const video = await getVideo(Number(id));
  if (!video) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(video);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const video = await updateVideo(Number(id), body);
    if (!video) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(video);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteVideo(Number(id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
