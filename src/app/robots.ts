import type { MetadataRoute } from "next";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://haimin-issue-desk.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  const site = baseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/brief", "/brief/activity", "/voice", "/privacy", "/terms", "/source-policy", "/accessibility"],
        disallow: ["/desk", "/desk/", "/api", "/api/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
