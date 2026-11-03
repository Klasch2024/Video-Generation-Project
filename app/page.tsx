import { Film, LayoutGrid, Play, Youtube } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatTile } from "@/components/StatTile";
import { VideoTable } from "@/components/VideoTable";
import { getVideos, getStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let videos = await getVideos().catch(() => []);
  let stats = await getStats().catch(() => ({
    totalVideos: 0, totalParts: 0, youtubePosted: 0, tiktokPosted: 0,
    completed: 0, inProgress: 0,
  }));

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-base-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-base-500">
          Track every video from script to social post.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Total Videos"
          value={stats.totalVideos}
          icon={Film}
          sub={`${stats.completed} completed`}
        />
        <StatTile
          label="Parts Rendered"
          value={stats.totalParts}
          icon={Play}
          accent="default"
        />
        <StatTile
          label="On YouTube"
          value={stats.youtubePosted}
          icon={Youtube}
          accent="success"
          sub="Shorts posted"
        />
        <StatTile
          label="On TikTok"
          value={stats.tiktokPosted}
          icon={LayoutGrid}
          accent="success"
          sub="Posts live"
        />
      </div>

      {/* Videos table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-base-300">All Videos</h2>
          <span className="text-xs text-base-500">{videos.length} total</span>
        </div>
        <VideoTable videos={videos} />
      </div>
    </AppShell>
  );
}
