import { createHash } from "node:crypto";

export const contentSignalPolicy = "ai-train=no, search=yes, ai-input=no";

export type PublicSitePage = {
  path: string;
  title: string;
  description: string;
  markdown: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_SITE_URL;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }

  return `https://${trimmed.replace(/\/+$/, "")}`;
}

export function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  return normalizeUrl(siteUrl ?? DEFAULT_SITE_URL);
}

export function toAbsoluteUrl(path: string) {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? null;
}

export function getSupabaseAuthBaseUrl() {
  const supabaseUrl = getSupabaseUrl();
  return supabaseUrl ? `${supabaseUrl}/auth/v1` : null;
}

export function getPublicSitePages(): PublicSitePage[] {
  return [
    {
      path: "/",
      title: "Lumina Research",
      description:
        "AI research and decision workspace for running cases, comparing evidence, and shipping cited reports.",
      markdown: `# Lumina Research

Lumina Research is a single-user AI research and decision workspace.

## What you can do

- Create and manage research cases
- Run analysis workflows and review outputs
- Trace claims back to cited source material
- Compare reports, sources, and run health from one workspace

## Useful entry points

- Sign in: ${toAbsoluteUrl("/login")}
- Create an account: ${toAbsoluteUrl("/signup")}
- API catalog: ${toAbsoluteUrl("/.well-known/api-catalog")}
- API docs: ${toAbsoluteUrl("/docs/api")}
`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      path: "/login",
      title: "Log In",
      description:
        "Authenticate into the Lumina Research workspace with Supabase-backed sign-in.",
      markdown: `# Log In

Sign in to access the Lumina Research workspace.

## Supported flows

- Email and password sign-in
- Google OAuth
- GitHub OAuth

After authentication, the app redirects into the workspace dashboard.
`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      path: "/signup",
      title: "Sign Up",
      description:
        "Create a Lumina Research account and start a new research workspace session.",
      markdown: `# Sign Up

Create a Lumina Research account.

## What happens next

- A workspace session is created through Supabase Auth
- You can enter the dashboard and start creating cases
- Protected API routes become available once authenticated
`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      path: "/docs/api",
      title: "API Documentation",
      description:
        "Discovery document for Lumina Research APIs, auth metadata, health checks, and OpenAPI description.",
      markdown: `# Lumina Research API

Machine-discoverable API resources for Lumina Research.

## Discovery

- OpenAPI: ${toAbsoluteUrl("/openapi.json")}
- API catalog: ${toAbsoluteUrl("/.well-known/api-catalog")}
- Health: ${toAbsoluteUrl("/api/health")}
- OIDC metadata: ${toAbsoluteUrl("/.well-known/openid-configuration")}
- OAuth protected resource metadata: ${toAbsoluteUrl("/.well-known/oauth-protected-resource")}

## Notes

- Browser UI uses Supabase-backed authentication
- Authenticated application routes and BFF routes are intentionally excluded from public crawl surfaces
`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}

export function getMarkdownForPath(path: string) {
  return getPublicSitePages().find((page) => page.path === path)?.markdown ?? null;
}

export function estimateMarkdownTokens(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return String(Math.max(1, Math.round(words * 1.35)));
}

export type AgentSkillDocument = {
  name: string;
  description: string;
  urlPath: string;
  body: string;
};

export function getAgentSkillDocuments(): AgentSkillDocument[] {
  return [
    {
      name: "workspace-overview",
      description:
        "Summarize Lumina Research, its public entry points, and the main machine-discovery URLs.",
      urlPath: "/.well-known/agent-skills/workspace-overview/SKILL.md",
      body: `---
name: workspace-overview
description: Summarize Lumina Research, its public entry points, and the main machine-discovery URLs.
---

# Workspace Overview

Use this skill when you need a compact overview of the Lumina Research website.

## Primary URLs

- Home: ${toAbsoluteUrl("/")}
- API catalog: ${toAbsoluteUrl("/.well-known/api-catalog")}
- API docs: ${toAbsoluteUrl("/docs/api")}
- OpenAPI: ${toAbsoluteUrl("/openapi.json")}

## Purpose

Lumina Research is an AI research and decision workspace for cases, evidence review, and cited reporting.
`,
    },
    {
      name: "api-discovery",
      description:
        "Locate the API catalog, OpenAPI document, and health endpoint for Lumina Research.",
      urlPath: "/.well-known/agent-skills/api-discovery/SKILL.md",
      body: `---
name: api-discovery
description: Locate the API catalog, OpenAPI document, and health endpoint for Lumina Research.
---

# API Discovery

Use this skill when you need programmatic API discovery details.

## Endpoints

- API catalog: ${toAbsoluteUrl("/.well-known/api-catalog")}
- OpenAPI description: ${toAbsoluteUrl("/openapi.json")}
- Health status: ${toAbsoluteUrl("/api/health")}

## Guidance

Prefer the API catalog first, then follow the service-desc and service-doc links.
`,
    },
    {
      name: "auth-discovery",
      description:
        "Find OpenID Connect discovery and OAuth protected resource metadata for authenticated API access.",
      urlPath: "/.well-known/agent-skills/auth-discovery/SKILL.md",
      body: `---
name: auth-discovery
description: Find OpenID Connect discovery and OAuth protected resource metadata for authenticated API access.
---

# Auth Discovery

Use this skill when you need to determine how Lumina Research protects its APIs.

## Endpoints

- OIDC discovery: ${toAbsoluteUrl("/.well-known/openid-configuration")}
- OAuth authorization server metadata: ${toAbsoluteUrl("/.well-known/oauth-authorization-server")}
- Protected resource metadata: ${toAbsoluteUrl("/.well-known/oauth-protected-resource")}

## Guidance

Use the protected resource metadata first to learn which authorization server issues tokens for this site.
`,
    },
  ];
}

export function getAgentSkillDigest(body: string) {
  return `sha256:${createHash("sha256").update(body).digest("hex")}`;
}

export function getHomepageLinkHeader() {
  return [
    `</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
    `</docs/api>; rel="service-doc"; type="text/html"`,
    `</openapi.json>; rel="service-desc"; type="application/openapi+json"`,
    `</.well-known/openid-configuration>; rel="openid-configuration"; type="application/json"`,
  ].join(", ");
}
