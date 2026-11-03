import { kv } from "@vercel/kv";

export type VideoStatus = "planned" | "in_progress" | "completed";

export interface VideoPart {
  id: number;
  video_id: number;
  part_number: number;
  gofile_url: string | null;
  download_url: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface Video {
  id: number;
  title: string;
  topic: string | null;
  thread_url: string | null;
  status: VideoStatus;
  tiktok_posted: boolean;
  youtube_posted: boolean;
  bg_music_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  parts?: VideoPart[];
}

interface Store {
  videos: Video[];
  parts: VideoPart[];
  nextVideoId: number;
  nextPartId: number;
}

async function readStore(): Promise<Store> {
  const store = await kv.get<Store>("store");
  return store ?? { videos: [], parts: [], nextVideoId: 1, nextPartId: 1 };
}

async function writeStore(store: Store): Promise<void> {
  await kv.set("store", store);
}

export async function setupSchema() {
  const existing = await kv.get("store");
  if (existing) return;
  await writeStore({ videos: [], parts: [], nextVideoId: 1, nextPartId: 1 });
}

export async function seedData() {
  const store = await readStore();
  if (store.videos.length > 0) return;

  const now = new Date().toISOString();

  const videos: Video[] = [
    {
      id: 1, title: "Hello Aoi", topic: "Demo",
      thread_url: null, status: "completed",
      tiktok_posted: false, youtube_posted: false,
      bg_music_url: null, description: null,
      created_at: now, updated_at: now,
    },
    {
      id: 2, title: "How To Increase Testosterone Naturally", topic: "Testosterone",
      thread_url: null, status: "completed",
      tiktok_posted: true, youtube_posted: true,
      bg_music_url: null,
      description: "Testosteronemaxxing guide — boost T naturally #testosterone #looksmaxing",
      created_at: now, updated_at: now,
    },
    {
      id: 3, title: "The Ultimate Lipmaxing Guide", topic: "Lipmaxing",
      thread_url: null, status: "completed",
      tiktok_posted: true, youtube_posted: true,
      bg_music_url: null,
      description: "The ultimate lipmaxing guide #lipmaxing #looksmaxing",
      created_at: now, updated_at: now,
    },
    {
      id: 4, title: "The Looksmaxing Guide To Neck Training", topic: "Neck Training",
      thread_url: null, status: "completed",
      tiktok_posted: false, youtube_posted: false,
      bg_music_url: "https://www.youtube.com/watch?v=aQkfOkFvx2U",
      description: "The looksmaxing guide to neck training #necktraining #looksmaxing",
      created_at: now, updated_at: now,
    },
  ];

  const parts: VideoPart[] = [
    { id: 1, video_id: 2, part_number: 1, gofile_url: "https://gofile.io/d/6YdhloTU", download_url: "https://tmpfiles.org/dl/wUADohVqNROC/testosteronemaxxing_part1_with_music.mp4", duration_seconds: null, created_at: now },
    { id: 2, video_id: 2, part_number: 2, gofile_url: "https://gofile.io/d/gUjBCMK7", download_url: "https://tmpfiles.org/dl/w1AGoEVSNYhe/testosteronemaxxing_part2_with_music.mp4", duration_seconds: null, created_at: now },
    { id: 3, video_id: 2, part_number: 3, gofile_url: "https://gofile.io/d/PvcRT6Xn", download_url: "https://tmpfiles.org/dl/wkA4oAVoNVNw/testosteronemaxxing_part3_with_music.mp4", duration_seconds: null, created_at: now },
    { id: 4, video_id: 3, part_number: 1, gofile_url: "https://gofile.io/d/JPTCos9P", download_url: null, duration_seconds: null, created_at: now },
    { id: 5, video_id: 3, part_number: 2, gofile_url: "https://gofile.io/d/PcFTBlkj", download_url: null, duration_seconds: null, created_at: now },
    { id: 6, video_id: 3, part_number: 3, gofile_url: "https://gofile.io/d/P22CiAHH", download_url: null, duration_seconds: null, created_at: now },
    { id: 7, video_id: 4, part_number: 1, gofile_url: "https://gofile.io/d/4qX1BdYr", download_url: "https://tmpfiles.org/dl/weAaoMoblKah/necktraining_part1_with_music.mp4", duration_seconds: null, created_at: now },
  ];

  await writeStore({ videos, parts, nextVideoId: 5, nextPartId: 8 });
}

export async function getVideos(): Promise<Video[]> {
  const store = await readStore();
  return store.videos.map((v) => ({
    ...v,
    parts: store.parts.filter((p) => p.video_id === v.id),
  }));
}

export async function getVideo(id: number): Promise<Video | null> {
  const store = await readStore();
  const v = store.videos.find((x) => x.id === id);
  if (!v) return null;
  return { ...v, parts: store.parts.filter((p) => p.video_id === id) };
}

export async function createVideo(data: {
  title: string;
  topic?: string;
  thread_url?: string;
  bg_music_url?: string;
  description?: string;
}): Promise<Video> {
  const store = await readStore();
  const now = new Date().toISOString();
  const video: Video = {
    id: store.nextVideoId,
    title: data.title,
    topic: data.topic ?? null,
    thread_url: data.thread_url ?? null,
    status: "planned",
    tiktok_posted: false,
    youtube_posted: false,
    bg_music_url: data.bg_music_url ?? null,
    description: data.description ?? null,
    created_at: now,
    updated_at: now,
  };
  store.videos.push(video);
  store.nextVideoId++;
  await writeStore(store);
  return { ...video, parts: [] };
}

export async function updateVideo(
  id: number,
  data: Partial<Pick<Video, "title" | "topic" | "thread_url" | "status" | "tiktok_posted" | "youtube_posted" | "bg_music_url" | "description">>
): Promise<Video | null> {
  const store = await readStore();
  const idx = store.videos.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  store.videos[idx] = { ...store.videos[idx], ...data, updated_at: new Date().toISOString() };
  await writeStore(store);
  return { ...store.videos[idx], parts: store.parts.filter((p) => p.video_id === id) };
}

export async function deleteVideo(id: number): Promise<void> {
  const store = await readStore();
  store.videos = store.videos.filter((x) => x.id !== id);
  store.parts = store.parts.filter((p) => p.video_id !== id);
  await writeStore(store);
}

export async function addPart(
  videoId: number,
  data: { part_number: number; gofile_url?: string; download_url?: string; duration_seconds?: number }
): Promise<VideoPart> {
  const store = await readStore();
  const now = new Date().toISOString();
  const existing = store.parts.findIndex(
    (p) => p.video_id === videoId && p.part_number === data.part_number
  );
  let part: VideoPart;
  if (existing !== -1) {
    store.parts[existing] = {
      ...store.parts[existing],
      gofile_url: data.gofile_url ?? null,
      download_url: data.download_url ?? null,
      duration_seconds: data.duration_seconds ?? null,
    };
    part = store.parts[existing];
  } else {
    part = {
      id: store.nextPartId++,
      video_id: videoId,
      part_number: data.part_number,
      gofile_url: data.gofile_url ?? null,
      download_url: data.download_url ?? null,
      duration_seconds: data.duration_seconds ?? null,
      created_at: now,
    };
    store.parts.push(part);
  }
  await writeStore(store);
  return part;
}

export async function deletePart(partId: number): Promise<void> {
  const store = await readStore();
  store.parts = store.parts.filter((p) => p.id !== partId);
  await writeStore(store);
}

export async function getStats() {
  const { videos, parts } = await readStore();
  return {
    totalVideos:   videos.length,
    totalParts:    parts.length,
    youtubePosted: videos.filter((v) => v.youtube_posted).length,
    tiktokPosted:  videos.filter((v) => v.tiktok_posted).length,
    completed:     videos.filter((v) => v.status === "completed").length,
    inProgress:    videos.filter((v) => v.status === "in_progress").length,
  };
}
