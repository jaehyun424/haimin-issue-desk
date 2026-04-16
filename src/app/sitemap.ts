import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { briefs } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const revalidate = 600;

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://haimin-issue-desk.vercel.app";
}

const STATIC_PATHS: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/brief", priority: 0.9 },
  { path: "/brief/activity", priority: 0.8 },
  { path: "/voice", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/source-policy", priority: 0.3 },
  { path: "/accessibility", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = baseUrl();

  const briefRows = await db
    .select({
      slug: briefs.slug,
      publishedAt: briefs.publishedAt,
      lastVerifiedAt: briefs.lastVerifiedAt,
      updatedAt: briefs.updatedAt,
    })
    .from(briefs)
    .where(eq(briefs.status, "published"))
    .orderBy(desc(briefs.publishedAt))
    .limit(1000)
    .catch(() => []);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${site}${p.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p.priority,
  }));

  const briefEntries: MetadataRoute.Sitemap = briefRows.map((r) => ({
    url: `${site}/brief/issues/${encodeURIComponent(r.slug)}`,
    lastModified: r.lastVerifiedAt ?? r.updatedAt ?? r.publishedAt ?? now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...briefEntries];
}
