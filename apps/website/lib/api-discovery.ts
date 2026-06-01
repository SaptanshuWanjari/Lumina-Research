import { toAbsoluteUrl } from "@/lib/site-config";

export function getApiCatalog(baseUrl?: string) {
  const apiAnchor = toAbsoluteUrl("/api", baseUrl);

  return {
    linkset: [
      {
        anchor: apiAnchor,
        "service-desc": [
          {
            href: toAbsoluteUrl("/openapi.json", baseUrl),
            type: "application/openapi+json",
          },
        ],
        "service-doc": [
          {
            href: toAbsoluteUrl("/docs/api", baseUrl),
            type: "text/html",
          },
        ],
        status: [
          {
            href: toAbsoluteUrl("/api/health", baseUrl),
            type: "application/json",
          },
        ],
        "service-meta": [
          {
            href: toAbsoluteUrl("/.well-known/oauth-protected-resource", baseUrl),
            type: "application/json",
          },
        ],
      },
    ],
  };
}

export function getOpenApiDocument(baseUrl?: string) {
  const apiServerUrl = toAbsoluteUrl("/api", baseUrl);

  return {
    openapi: "3.1.0",
    info: {
      title: "Lumina Research Website API",
      version: "0.1.0",
      description:
        "Discovery-oriented OpenAPI description for the Lumina Research Next.js BFF routes.",
    },
    servers: [
      {
        url: apiServerUrl,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "sb-access-token",
        },
      },
    },
    security: [{ bearerAuth: [] }, { sessionCookie: [] }],
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: {
            "200": {
              description: "API availability status",
            },
          },
          security: [],
        },
      },
      "/me": {
        get: {
          summary: "Current authenticated user",
          responses: {
            "200": { description: "Authenticated user context" },
            "401": { description: "Unauthenticated" },
          },
        },
      },
      "/dashboard": {
        get: {
          summary: "Dashboard data",
          responses: {
            "200": { description: "Workspace dashboard payload" },
            "401": { description: "Unauthenticated" },
          },
        },
      },
      "/search": {
        get: {
          summary: "Search indexed workspace entities",
          responses: {
            "200": { description: "Search result set" },
            "401": { description: "Unauthenticated" },
          },
        },
      },
      "/cases": {
        get: {
          summary: "List cases",
          responses: {
            "200": { description: "Case collection" },
            "401": { description: "Unauthenticated" },
          },
        },
        post: {
          summary: "Create case",
          responses: {
            "201": { description: "Case created" },
            "401": { description: "Unauthenticated" },
          },
        },
      },
      "/cases/{caseId}": {
        get: {
          summary: "Fetch case detail",
          parameters: [
            {
              name: "caseId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Case detail" },
            "404": { description: "Case not found" },
          },
        },
      },
      "/cases/{caseId}/sources": {
        get: {
          summary: "List case sources",
          parameters: [
            {
              name: "caseId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Source collection" },
          },
        },
        post: {
          summary: "Create case source",
          parameters: [
            {
              name: "caseId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "201": { description: "Source created" },
          },
        },
      },
      "/cases/{caseId}/runs": {
        get: {
          summary: "List runs for a case",
          parameters: [
            {
              name: "caseId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Run collection" },
          },
        },
        post: {
          summary: "Start run for a case",
          parameters: [
            {
              name: "caseId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "202": { description: "Run accepted" },
          },
        },
      },
      "/runs/{runId}/approve": {
        post: {
          summary: "Approve a run waiting for review",
          parameters: [
            {
              name: "runId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Run approved" },
          },
        },
      },
      "/reports": {
        get: {
          summary: "List reports",
          responses: {
            "200": { description: "Report collection" },
          },
        },
      },
      "/reports/{reportId}": {
        get: {
          summary: "Fetch report detail",
          parameters: [
            {
              name: "reportId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Report detail" },
            "404": { description: "Report not found" },
          },
        },
      },
    },
  };
}
