import { getBaseUrlFromRequest, toAbsoluteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getBaseUrlFromRequest(request);
  const markdown = `# Lumina Research

> Single-user AI research and decision workspace

Lumina Research is a powerful single-user workspace that runs stateful AI research workflows (orchestrated by Python LangGraph) to analyze sources (URLs, PDFs, notes) and generate reviewable decision reports with citations, drafts, and human-in-the-loop approval checkpoints.

## Primary Entry Points

- [Sign In](${toAbsoluteUrl("/login", baseUrl)}): Authenticate into the workspace using Supabase Auth (supports Google, GitHub, or Email/Password).
- [Sign Up](${toAbsoluteUrl("/signup", baseUrl)}): Register a new single-user workspace account.
- [API Documentation](${toAbsoluteUrl("/docs/api", baseUrl)}): Technical catalog and schema overview of developer integration points.

## Developer & Agent Resources

- [API Catalog](${toAbsoluteUrl("/.well-known/api-catalog", baseUrl)}): RFC-compliant application linkset listing all machine-discoverable endpoints.
- [OpenAPI Specification](${toAbsoluteUrl("/openapi.json", baseUrl)}): OpenAPI 3.1.0 JSON configuration describing backend-for-frontend API paths.
- [MCP Server Endpoint](${toAbsoluteUrl("/api/mcp", baseUrl)}): Model Context Protocol JSON-RPC HTTP server endpoint offering website interaction tools.
- [MCP Discovery Card](${toAbsoluteUrl("/.well-known/mcp/server-card.json", baseUrl)}): Server metadata and capabilities definition.
- [Agent Skills Catalog](${toAbsoluteUrl("/.well-known/agent-skills/index.json", baseUrl)}): List of prompt/skill profiles for autonomous agents.

## Crawl Surfaces & Core Skills

- [Workspace Overview Skill](${toAbsoluteUrl("/.well-known/agent-skills/workspace-overview/SKILL.md", baseUrl)}): Compact guide for agents learning about Lumina Research.
- [API Discovery Skill](${toAbsoluteUrl("/.well-known/agent-skills/api-discovery/SKILL.md", baseUrl)}): Step-by-step discovery guidelines for integration endpoints.
- [Auth Discovery Skill](${toAbsoluteUrl("/.well-known/agent-skills/auth-discovery/SKILL.md", baseUrl)}): Auth handshake instructions for accessing protected routes.
- [Full Consolidated Docs](${toAbsoluteUrl("/llms-full.txt", baseUrl)}): Complete markdown documentation including all page guides in a single consolidated payload.
`;

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
