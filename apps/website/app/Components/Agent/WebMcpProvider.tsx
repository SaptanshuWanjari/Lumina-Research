"use client";

import { useEffect } from "react";

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (
    input: Record<string, unknown>,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
};

type ModelContextLike = {
  provideContext?: (context: { tools: WebMcpTool[] }) => void;
};

export function WebMcpProvider() {
  useEffect(() => {
    const modelContext = (navigator as Navigator & {
      modelContext?: ModelContextLike;
    }).modelContext;

    if (!modelContext?.provideContext) return;

    const toAbsoluteUrl = (path: string) =>
      new URL(path, window.location.origin).toString();

    modelContext.provideContext({
      tools: [
        {
          name: "open-login",
          description: "Navigate the browser to the Lumina Research login page.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          execute: () => {
            const url = toAbsoluteUrl("/login");
            window.location.assign(url);
            return {
              content: [{ type: "text", text: `Navigating to ${url}` }],
            };
          },
        },
        {
          name: "open-signup",
          description: "Navigate the browser to the Lumina Research signup page.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          execute: () => {
            const url = toAbsoluteUrl("/signup");
            window.location.assign(url);
            return {
              content: [{ type: "text", text: `Navigating to ${url}` }],
            };
          },
        },
        {
          name: "open-api-docs",
          description:
            "Navigate the browser to the Lumina Research API discovery page.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          execute: () => {
            const url = toAbsoluteUrl("/docs/api");
            window.location.assign(url);
            return {
              content: [{ type: "text", text: `Navigating to ${url}` }],
            };
          },
        },
      ],
    });
  }, []);

  return null;
}
