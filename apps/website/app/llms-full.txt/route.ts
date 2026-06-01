import { getBaseUrlFromRequest, getPublicSitePages } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrlFromRequest(request);
  const pages = getPublicSitePages(baseUrl);
  const compiledMarkdown = pages
    .map((page) => {
      return `========================================
Page: ${page.title} (${page.path})
Description: ${page.description}
========================================

${page.markdown}`;
    })
    .join("\n\n");

  const body = `# Lumina Research - Full Documentation

This document compiles the complete public documentation for Lumina Research in a single file for efficient ingestion by LLMs and autonomous agents.

${compiledMarkdown}`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
