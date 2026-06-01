import {
  getPublicSitePages,
  getSiteUrl,
  toAbsoluteUrl,
} from "@/lib/site-config";

type JsonRpcRequest = {
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

function jsonRpcResult(id: JsonRpcRequest["id"], result: unknown) {
  return Response.json({
    jsonrpc: "2.0",
    id: id ?? null,
    result,
  });
}

function jsonRpcError(
  id: JsonRpcRequest["id"],
  code: number,
  message: string,
  data?: unknown,
) {
  return Response.json(
    {
      jsonrpc: "2.0",
      id: id ?? null,
      error: {
        code,
        message,
        data,
      },
    },
    { status: 400 },
  );
}

function getTools() {
  return [
    {
      name: "get_site_discovery",
      description: "Return agent-discovery endpoints for Lumina Research.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
    {
      name: "list_public_routes",
      description: "List public HTML routes exposed by the website.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
    {
      name: "resolve_public_url",
      description: "Resolve a public path to an absolute Lumina Research URL.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path beginning with /",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
    },
  ];
}

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  return Response.json(
    {
      name: "lumina-research-website-mcp",
      transport: "jsonrpc-over-http",
      endpoint: toAbsoluteUrl("/api/mcp", baseUrl),
      tools: getTools(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const payload = (await request.json()) as JsonRpcRequest;
  const method = payload.method;

  if (method === "initialize") {
    return jsonRpcResult(payload.id, {
      protocolVersion: "2025-03-26",
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: "lumina-research-website",
        version: "0.1.0",
      },
    });
  }

  if (method === "tools/list") {
    return jsonRpcResult(payload.id, {
      tools: getTools(),
    });
  }

  if (method === "tools/call") {
    const name = payload.params?.name;
    const argumentsValue =
      typeof payload.params?.arguments === "object" && payload.params.arguments
        ? (payload.params.arguments as Record<string, unknown>)
        : {};

    if (name === "get_site_discovery") {
      return jsonRpcResult(payload.id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                site: getSiteUrl(baseUrl),
                apiCatalog: toAbsoluteUrl("/.well-known/api-catalog", baseUrl),
                openApi: toAbsoluteUrl("/openapi.json", baseUrl),
                apiDocs: toAbsoluteUrl("/docs/api", baseUrl),
                openIdConfiguration: toAbsoluteUrl(
                  "/.well-known/openid-configuration",
                  baseUrl,
                ),
                protectedResource: toAbsoluteUrl(
                  "/.well-known/oauth-protected-resource",
                  baseUrl,
                ),
              },
              null,
              2,
            ),
          },
        ],
      });
    }

    if (name === "list_public_routes") {
      return jsonRpcResult(payload.id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              getPublicSitePages(baseUrl).map((page) => ({
                path: page.path,
                title: page.title,
                url: toAbsoluteUrl(page.path, baseUrl),
              })),
              null,
              2,
            ),
          },
        ],
      });
    }

    if (name === "resolve_public_url") {
      const path = argumentsValue.path;
      if (typeof path !== "string" || !path.startsWith("/")) {
        return jsonRpcError(payload.id, -32602, "Invalid path argument");
      }

      return jsonRpcResult(payload.id, {
        content: [
          {
            type: "text",
            text: toAbsoluteUrl(path, baseUrl),
          },
        ],
      });
    }

    return jsonRpcError(payload.id, -32601, "Unknown tool");
  }

  return jsonRpcError(payload.id, -32601, "Method not found");
}
