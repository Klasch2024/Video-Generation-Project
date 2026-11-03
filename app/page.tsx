import { Film, Play, Youtube, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatTile } from "@/components/StatTile";
import { VideoTable } from "@/components/VideoTable";
import { getVideos, getStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [videos, stats] = await Promise.all([
    getVideos().catch(() => []),
    getStats().catch(() => ({
      totalVideos: 0, totalParts: 0, youtubePosted: 0, tiktokPosted: 0,
      completed: 0, inProgress: 0, planned: 0,
    })),
  ]);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-base-50">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-base-500">
            Track every video from script to social post.
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

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Total Videos"
          value={stats.totalVideos}
          icon={Film}
          sub={`${stats.planned} planned · ${stats.inProgress} in progress`}
        />
        <StatTile
          label="Parts Rendered"
          value={stats.totalParts}
          icon={Play}
        />
        <StatTile
          label="On YouTube"
          value={stats.youtubePosted}
          icon={Youtube}
          accent="success"
          sub={`of ${stats.totalVideos} videos`}
        />
        <StatTile
          label="On TikTok"
          value={stats.tiktokPosted}
          icon={TrendingUp}
          accent="success"
          sub={`of ${stats.totalVideos} videos`}
        />
      </div>

      {/* Videos */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-base-500">
          Videos
        </h2>
        <span className="text-xs text-base-600">{stats.completed} completed</span>
      </div>
      <VideoTable videos={videos} />
    </AppShell>
  );
}
