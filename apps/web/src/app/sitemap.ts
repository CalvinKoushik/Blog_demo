import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: siteUrl("/search"), changeFrequency: "daily", priority: 0.8 },
    { url: siteUrl("/login"), changeFrequency: "monthly", priority: 0.3 },
    { url: siteUrl("/signup"), changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const res = await fetch(`${API}/posts?limit=50`, { next: { revalidate: 3600 } });
    if (!res.ok) return staticRoutes;
    const data = await res.json();
    const posts = data.items ?? data;
    const postEntries: MetadataRoute.Sitemap = (Array.isArray(posts) ? posts : []).map(
      (p: { slug: string; updatedAt?: string }) => ({
        url: siteUrl(`/post/${p.slug}`),
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }),
    );
    return [...staticRoutes, ...postEntries];
  } catch {
    return staticRoutes;
  }
}
