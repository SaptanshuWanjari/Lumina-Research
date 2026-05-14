import {
  contentSignalPolicy,
  estimateMarkdownTokens,
  getHomepageLinkHeader,
  getMarkdownForPath,
} from "@/lib/site-config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") ?? "/";
  const markdown = getMarkdownForPath(path);

  if (!markdown) {
    return new Response("Markdown representation is not available for this path.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      Link: getHomepageLinkHeader(),
      "x-markdown-tokens": estimateMarkdownTokens(markdown),
      "Content-Signal": contentSignalPolicy,
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
