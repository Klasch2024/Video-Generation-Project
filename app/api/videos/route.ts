import { NextRequest, NextResponse } from "next/server";
import { getVideos, createVideo } from "@/lib/db";

export async function GET() {
  try {
    const videos = await getVideos();
    return NextResponse.json(videos);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    const video = await createVideo(body);
    return NextResponse.json(video, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
