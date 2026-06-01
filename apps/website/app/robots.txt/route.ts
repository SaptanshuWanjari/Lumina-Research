import { contentSignalPolicy, getBaseUrlFromRequest, toAbsoluteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const publicAllowPaths = ["/", "/login", "/signup", "/docs/api", "/.well-known/"];
const privateDisallowPaths = [
  "/api/",
  "/dashboard",
  "/cases",
  "/search",
  "/report",
  "/reports",
  "/runs",
  "/settings",
  "/auth/callback",
  "/auth/oauth",
  "/auth/signout",
];

function buildRuleBlock(userAgents: string | string[], allowRoot = true) {
  const agentList = Array.isArray(userAgents) ? userAgents : [userAgents];
  const lines: string[] = [];

  for (const agent of agentList) {
    lines.push(`User-agent: ${agent}`);
  }

  if (allowRoot) {
    for (const path of publicAllowPaths) {
      lines.push(`Allow: ${path}`);
    }
  } else {
    lines.push("Disallow: /");
  }

  for (const path of privateDisallowPaths) {
    lines.push(`Disallow: ${path}`);
  }

  return lines.join("\n");
}

export async function GET(request: Request) {
  const baseUrl = getBaseUrlFromRequest(request);
  const body = [
    buildRuleBlock("*"),
    buildRuleBlock("OAI-SearchBot"),
    buildRuleBlock("PerplexityBot"),
    buildRuleBlock("ChatGPT-User"),
    buildRuleBlock(["GPTBot", "Claude-Web", "Google-Extended", "CCBot"], false),
    `Sitemap: ${toAbsoluteUrl("/sitemap.xml", baseUrl)}`,
    `LLMs-txt: ${toAbsoluteUrl("/llms.txt", baseUrl)}`,
    `Content-Signal: ${contentSignalPolicy}`,
  ].join("\n\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
