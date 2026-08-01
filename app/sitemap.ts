import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getPosts } from "@/lib/posts";
import { casUsage } from "@/lib/cas-usage";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/about", "/services", "/contact", "/blog", "/glossaire", "/cas-usage"];
  const legalPaths = ["/legal/mentions-legales", "/legal/confidentialite", "/legal/cookies"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of siteConfig.locales) {
    for (const path of [...staticPaths, ...legalPaths]) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.6,
      });
    }
    for (const post of getPosts(locale)) {
      entries.push({
        url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
    for (const item of casUsage[locale]) {
      entries.push({
        url: `${siteConfig.url}/${locale}/cas-usage/${item.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
