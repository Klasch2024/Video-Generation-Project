import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, Music, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { AddPartForm } from "@/components/AddPartForm";
import { VideoDetailActions } from "@/components/VideoDetailActions";
import { getVideo } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  const video = await getVideo(Number(id)).catch(() => null);
  if (!video) notFound();

  const nextPart = (video.parts?.length ?? 0) + 1;

  return (
    <AppShell>
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-base-500 hover:text-base-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-base-50">
              {video.title}
            </h1>
            <StatusBadge status={video.status} />
          </div>
          {video.topic && (
            <p className="mt-1 text-sm text-base-500">{video.topic}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <PlatformBadge label="YouTube Shorts" posted={video.youtube_posted} />
            <PlatformBadge label="TikTok" posted={video.tiktok_posted} />
          </div>
        </div>
        <VideoDetailActions video={video} />
      </div>

      {/* Info grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {video.thread_url && (
          <InfoCard
            icon={ExternalLink}
            label="Source Thread"
            href={video.thread_url}
            linkText="Open thread →"
          />
        )}
        {video.bg_music_url && (
          <InfoCard
            icon={Music}
            label="Background Music"
            href={video.bg_music_url}
            linkText="Open on YouTube →"
          />
        )}
        {video.description && (
          <div className="rounded-xl border border-base-700 bg-base-850 p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-base-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-base-500">
                Description
              </span>
            </div>
            <p className="text-xs text-base-300 leading-relaxed line-clamp-4">
              {video.description}
            </p>
          </div>
        )}
      </div>

      {/* Parts */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-base-300">
            Parts
            <span className="ml-2 text-base-600">
              ({video.parts?.length ?? 0})
            </span>
          </h2>
        </div>

        <div className="mb-4 overflow-hidden rounded-xl border border-base-700">
          {video.parts && video.parts.length > 0 ? (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[80px_1fr_1fr_100px] gap-4 border-b border-base-700 bg-base-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-base-500">
                <span>Part</span>
                <span>View (Gofile)</span>
                <span>Download</span>
                <span className="text-right">Duration</span>
              </div>
              <div className="divide-y divide-base-700">
                {video.parts.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[80px_1fr_1fr_100px] items-center gap-4 px-5 py-3.5 hover:bg-base-800 transition-colors"
                  >
                    <span className="text-sm font-semibold text-base-200">
                      Part {p.part_number}
                    </span>
                    <div>
                      {p.gofile_url ? (
                        <a
                          href={p.gofile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-base-300 hover:text-accent-500 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">Gofile</span>
                        </a>
                      ) : (
                        <span className="text-sm text-base-600">—</span>
                      )}
                    </div>
                    <div>
                      {p.download_url ? (
                        <a
                          href={p.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-base-300 hover:text-accent-500 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">MP4</span>
                        </a>
                      ) : (
                        <span className="text-sm text-base-600">—</span>
                      )}
                    </div>
                    <div className="text-right">
                      {p.duration_seconds ? (
                        <span className="text-sm text-base-500">
                          {Math.floor(p.duration_seconds / 60)}m{" "}
                          {p.duration_seconds % 60}s
                        </span>
                      ) : (
                        <span className="text-sm text-base-600">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-base-500">
              No parts yet — add the first one below.
            </div>
          )}
        </div>

        <AddPartForm videoId={video.id} nextPart={nextPart} onAdded={() => {}} />
      </div>
    </AppShell>
  );
}

function InfoCard({
  icon: Icon,
  label,
  href,
  linkText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="rounded-xl border border-base-700 bg-base-850 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-base-500" />
        <span className="text-xs font-semibold uppercase tracking-wide text-base-500">
          {label}
        </span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-base-300 hover:text-accent-500 transition-colors"
      >
        {linkText}
      </a>
    </div>
  );
}
