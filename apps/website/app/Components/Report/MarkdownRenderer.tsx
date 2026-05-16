import type { ReactNode } from "react";
import type React from "react";

import { cn } from "@/lib/utils";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

type ListItem = {
  indent: number;
  text: string;
};

function renderInline(text: string): ReactNode[] {
  const pattern =
    /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`link-${key}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900"
        >
          {match[2]}
        </a>,
      );
    } else if (match[4]) {
      nodes.push(
        <strong key={`strong-${key}`} className="font-semibold text-slate-900">
          {match[4]}
        </strong>,
      );
    } else if (match[5]) {
      nodes.push(
        <code
          key={`code-${key}`}
          className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800"
        >
          {match[5]}
        </code>,
      );
    } else if (match[6]) {
      nodes.push(
        <em key={`em-${key}`} className="italic text-slate-800">
          {match[6]}
        </em>,
      );
    }

    lastIndex = index + match[0].length;
    key += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderList(
  items: ListItem[],
  ordered: boolean,
  key: string,
) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag
      key={key}
      className={cn(
        "my-4 space-y-2 text-[15px] leading-7 text-slate-700",
        ordered ? "list-decimal pl-6" : "list-disc pl-6",
      )}
    >
      {items.map((item, index) => (
        <li
          key={`${key}-${index}`}
          className="marker:text-slate-400"
          style={{ marginLeft: `${Math.max(0, item.indent) * 1.25}rem` }}
        >
          {renderInline(item.text)}
        </li>
      ))}
    </ListTag>
  );
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !(lines[index] ?? "").trim().startsWith("```")) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push(
        <pre
          key={`code-${blocks.length}`}
          className="my-4 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-100"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const classMap = {
        1: "mt-2 text-3xl font-semibold tracking-tight text-slate-950",
        2: "mt-8 text-2xl font-semibold text-slate-900",
        3: "mt-6 text-xl font-semibold text-slate-900",
        4: "mt-5 text-lg font-semibold text-slate-900",
        5: "mt-4 text-base font-semibold text-slate-900",
        6: "mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500",
      } as const;

      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      blocks.push(
        <Tag key={`heading-${blocks.length}`} className={classMap[level as keyof typeof classMap]}>
          {renderInline(text)}
        </Tag>,
      );
      index += 1;
      continue;
    }

    const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      const items: ListItem[] = [];

      while (index < lines.length) {
        const current = lines[index] ?? "";
        const match = current.match(/^(\s*)[-*+]\s+(.*)$/);
        if (!match) break;

        items.push({
          indent: Math.floor(match[1].length / 2),
          text: match[2],
        });
        index += 1;
      }

      blocks.push(renderList(items, false, `ul-${blocks.length}`));
      continue;
    }

    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (orderedMatch) {
      const items: ListItem[] = [];

      while (index < lines.length) {
        const current = lines[index] ?? "";
        const match = current.match(/^(\s*)\d+\.\s+(.*)$/);
        if (!match) break;

        items.push({
          indent: Math.floor(match[1].length / 2),
          text: match[2],
        });
        index += 1;
      }

      blocks.push(renderList(items, true, `ol-${blocks.length}`));
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];

      while (index < lines.length && (lines[index] ?? "").trim().startsWith(">")) {
        quoteLines.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="my-4 border-l-4 border-slate-300 pl-4 text-[15px] italic leading-7 text-slate-600"
        >
          {quoteLines.join(" ")}
        </blockquote>,
      );
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;

    while (index < lines.length) {
      const next = lines[index] ?? "";
      const nextTrimmed = next.trim();
      if (
        !nextTrimmed ||
        nextTrimmed.startsWith("```") ||
        /^#{1,6}\s+/.test(nextTrimmed) ||
        /^(\s*)[-*+]\s+/.test(next) ||
        /^(\s*)\d+\.\s+/.test(next) ||
        nextTrimmed.startsWith(">")
      ) {
        break;
      }

      paragraphLines.push(nextTrimmed);
      index += 1;
    }

    blocks.push(
      <p
        key={`paragraph-${blocks.length}`}
        className="my-4 text-[15px] leading-8 text-slate-700"
      >
        {renderInline(paragraphLines.join(" "))}
      </p>,
    );
  }

  return <div className={cn("max-w-none", className)}>{blocks}</div>;
}
