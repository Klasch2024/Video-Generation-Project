import { sql } from "@vercel/postgres";

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

export async function setupSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS videos (
      id            SERIAL PRIMARY KEY,
      title         TEXT NOT NULL,
      topic         TEXT,
      thread_url    TEXT,
      status        TEXT NOT NULL DEFAULT 'planned',
      tiktok_posted BOOLEAN NOT NULL DEFAULT FALSE,
      youtube_posted BOOLEAN NOT NULL DEFAULT FALSE,
      bg_music_url  TEXT,
      description   TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS video_parts (
      id               SERIAL PRIMARY KEY,
      video_id         INT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      part_number      INT NOT NULL,
      gofile_url       TEXT,
      download_url     TEXT,
      duration_seconds INT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(video_id, part_number)
    )
  `;
}

export async function seedData() {
  const existing = await sql`SELECT COUNT(*) AS n FROM videos`;
  if (Number(existing.rows[0].n) > 0) return;

  // Video 1: Hello Aoi demo
  await sql`
    INSERT INTO videos (title, topic, status, tiktok_posted, youtube_posted)
    VALUES ('Hello Aoi', 'Demo', 'completed', false, false)
  `;

  // Video 2: Testosteronemaxxing
  const { rows: [v2] } = await sql`
    INSERT INTO videos (title, topic, thread_url, status, tiktok_posted, youtube_posted,
      bg_music_url, description)
    VALUES (
      'How To Increase Testosterone Naturally',
      'Testosterone',
      null,
      'completed', true, true,
      'https://www.youtube.com/watch?v=example',
      'Testosteronemaxxing guide — boost T naturally #testosterone #looksmaxing #fitness'
    )
    RETURNING id
  `;
  await sql`
    INSERT INTO video_parts (video_id, part_number, gofile_url, download_url) VALUES
    (${v2.id}, 1, 'https://gofile.io/d/6YdhloTU', 'https://tmpfiles.org/dl/wUADohVqNROC/testosteronemaxxing_part1_with_music.mp4'),
    (${v2.id}, 2, 'https://gofile.io/d/gUjBCMK7', 'https://tmpfiles.org/dl/w1AGoEVSNYhe/testosteronemaxxing_part2_with_music.mp4'),
    (${v2.id}, 3, 'https://gofile.io/d/PvcRT6Xn', 'https://tmpfiles.org/dl/wkA4oAVoNVNw/testosteronemaxxing_part3_with_music.mp4')
  `;

  // Video 3: Lipmaxing
  const { rows: [v3] } = await sql`
    INSERT INTO videos (title, topic, status, tiktok_posted, youtube_posted, description)
    VALUES (
      'The Ultimate Lipmaxing Guide',
      'Lipmaxing',
      'completed', true, true,
      'The ultimate lipmaxing guide — lip exercises, products & procedures #lipmaxing #looksmaxing'
    )
    RETURNING id
  `;
  await sql`
    INSERT INTO video_parts (video_id, part_number, gofile_url, download_url) VALUES
    (${v3.id}, 1, 'https://gofile.io/d/JPTCos9P', null),
    (${v3.id}, 2, 'https://gofile.io/d/PcFTBlkj', null),
    (${v3.id}, 3, 'https://gofile.io/d/P22CiAHH', null)
  `;

  // Video 4: Neck Training
  const { rows: [v4] } = await sql`
    INSERT INTO videos (title, topic, status, tiktok_posted, youtube_posted,
      bg_music_url, description)
    VALUES (
      'The Looksmaxing Guide To Neck Training',
      'Neck Training',
      'completed', false, false,
      'https://www.youtube.com/watch?v=aQkfOkFvx2U',
      'The looksmaxing guide to neck training (Part 1): aesthetic ratios & structural framing #necktraining #looksmaxing'
    )
    RETURNING id
  `;
  await sql`
    INSERT INTO video_parts (video_id, part_number, gofile_url, download_url) VALUES
    (${v4.id}, 1, 'https://gofile.io/d/4qX1BdYr', 'https://tmpfiles.org/dl/weAaoMoblKah/necktraining_part1_with_music.mp4')
  `;
}

export async function getVideos(): Promise<Video[]> {
  const { rows: videos } = await sql<Video>`
    SELECT * FROM videos ORDER BY created_at DESC
  `;
  const { rows: parts } = await sql<VideoPart>`
    SELECT * FROM video_parts ORDER BY video_id, part_number
  `;
  return videos.map((v) => ({
    ...v,
    parts: parts.filter((p) => p.video_id === v.id),
  }));
}

export async function getVideo(id: number): Promise<Video | null> {
  const { rows } = await sql<Video>`SELECT * FROM videos WHERE id = ${id}`;
  if (!rows[0]) return null;
  const { rows: parts } = await sql<VideoPart>`
    SELECT * FROM video_parts WHERE video_id = ${id} ORDER BY part_number
  `;
  return { ...rows[0], parts };
}

export async function createVideo(data: {
  title: string;
  topic?: string;
  thread_url?: string;
  bg_music_url?: string;
  description?: string;
}): Promise<Video> {
  const { rows } = await sql<Video>`
    INSERT INTO videos (title, topic, thread_url, bg_music_url, description)
    VALUES (${data.title}, ${data.topic ?? null}, ${data.thread_url ?? null},
            ${data.bg_music_url ?? null}, ${data.description ?? null})
    RETURNING *
  `;
  return { ...rows[0], parts: [] };
}

export async function updateVideo(
  id: number,
  data: Partial<Pick<Video, "title" | "topic" | "thread_url" | "status" | "tiktok_posted" | "youtube_posted" | "bg_music_url" | "description">>
): Promise<Video | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (data.title !== undefined) { sets.push(`title = $${i++}`); values.push(data.title); }
  if (data.topic !== undefined) { sets.push(`topic = $${i++}`); values.push(data.topic); }
  if (data.thread_url !== undefined) { sets.push(`thread_url = $${i++}`); values.push(data.thread_url); }
  if (data.status !== undefined) { sets.push(`status = $${i++}`); values.push(data.status); }
  if (data.tiktok_posted !== undefined) { sets.push(`tiktok_posted = $${i++}`); values.push(data.tiktok_posted); }
  if (data.youtube_posted !== undefined) { sets.push(`youtube_posted = $${i++}`); values.push(data.youtube_posted); }
  if (data.bg_music_url !== undefined) { sets.push(`bg_music_url = $${i++}`); values.push(data.bg_music_url); }
  if (data.description !== undefined) { sets.push(`description = $${i++}`); values.push(data.description); }

  if (sets.length === 0) return getVideo(id);

  sets.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE videos SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`;
  const { rows } = await sql.query<Video>(query, values);
  if (!rows[0]) return null;
  const { rows: parts } = await sql<VideoPart>`
    SELECT * FROM video_parts WHERE video_id = ${id} ORDER BY part_number
  `;
  return { ...rows[0], parts };
}

export async function deleteVideo(id: number): Promise<void> {
  await sql`DELETE FROM videos WHERE id = ${id}`;
}

export async function addPart(videoId: number, data: {
  part_number: number;
  gofile_url?: string;
  download_url?: string;
  duration_seconds?: number;
}): Promise<VideoPart> {
  const { rows } = await sql<VideoPart>`
    INSERT INTO video_parts (video_id, part_number, gofile_url, download_url, duration_seconds)
    VALUES (${videoId}, ${data.part_number}, ${data.gofile_url ?? null},
            ${data.download_url ?? null}, ${data.duration_seconds ?? null})
    ON CONFLICT (video_id, part_number) DO UPDATE
      SET gofile_url = EXCLUDED.gofile_url,
          download_url = EXCLUDED.download_url,
          duration_seconds = EXCLUDED.duration_seconds
    RETURNING *
  `;
  return rows[0];
}

export async function deletePart(partId: number): Promise<void> {
  await sql`DELETE FROM video_parts WHERE id = ${partId}`;
}

export async function getStats() {
  const { rows: [counts] } = await sql<{
    total_videos: string;
    total_parts: string;
    youtube_posted: string;
    tiktok_posted: string;
    completed: string;
    in_progress: string;
  }>`
    SELECT
      COUNT(DISTINCT v.id)::text               AS total_videos,
      COUNT(p.id)::text                        AS total_parts,
      SUM(CASE WHEN v.youtube_posted THEN 1 ELSE 0 END)::text AS youtube_posted,
      SUM(CASE WHEN v.tiktok_posted  THEN 1 ELSE 0 END)::text AS tiktok_posted,
      SUM(CASE WHEN v.status = 'completed'    THEN 1 ELSE 0 END)::text AS completed,
      SUM(CASE WHEN v.status = 'in_progress'  THEN 1 ELSE 0 END)::text AS in_progress
    FROM videos v
    LEFT JOIN video_parts p ON p.video_id = v.id
  `;
  return {
    totalVideos:   Number(counts.total_videos),
    totalParts:    Number(counts.total_parts),
    youtubePosted: Number(counts.youtube_posted),
    tiktokPosted:  Number(counts.tiktok_posted),
    completed:     Number(counts.completed),
    inProgress:    Number(counts.in_progress),
  };
}
