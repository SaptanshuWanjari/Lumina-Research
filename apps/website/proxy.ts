import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getHomepageLinkHeader } from "@/lib/site-config";

function wantsMarkdown(request: NextRequest) {
  return request.headers.get("accept")?.includes("text/markdown") ?? false;
}

function withHomepageHeaders(response: NextResponse) {
  response.headers.set("Link", getHomepageLinkHeader());
  response.headers.append("Vary", "Accept");
  return response;
}

export function proxy(request: NextRequest) {
  if (request.method !== "GET") {
    return withHomepageHeaders(NextResponse.next());
  }

  if (wantsMarkdown(request)) {
    const rewriteUrl = new URL("/agent-markdown", request.url);
    rewriteUrl.searchParams.set("path", request.nextUrl.pathname);
    return withHomepageHeaders(NextResponse.rewrite(rewriteUrl));
  }

  return withHomepageHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/", "/login", "/signup", "/docs/api"],
};
