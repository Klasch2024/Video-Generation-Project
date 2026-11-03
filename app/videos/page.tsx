import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { VideoTable } from "@/components/VideoTable";
import { getVideos } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const videos = await getVideos().catch(() => []);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-base-50">
            All Videos
          </h1>
          <p className="mt-0.5 text-sm text-base-500">
            {videos.length} video{videos.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Link
          href="/videos/new"
          className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Video
        </Link>
      </div>

      <VideoTable videos={videos} />
    </AppShell>
  );
}
