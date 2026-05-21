import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn("max-w-none text-slate-700", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ children }) => (
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-8 text-2xl font-semibold text-slate-900">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-6 text-xl font-semibold text-slate-900">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="mt-5 text-lg font-semibold text-slate-900">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="mt-4 text-base font-semibold text-slate-900">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            {children}
          </h6>
        ),
        p: ({ children }) => (
          <p className="my-4 text-[15px] leading-8 text-slate-700">
            {children}
          </p>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-800">{children}</em>
        ),
        code: ({ children, className }) => {
          const block = className?.startsWith("language-");
          if (block) {
            return (
              <code className={cn("font-mono text-sm leading-6", className)}>
                {children}
              </code>
            );
          }

          return (
            <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="my-4 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-slate-100">
            {children}
          </pre>
        ),
        ul: ({ children }) => (
          <ul className="my-4 list-disc space-y-2 pl-6 text-[15px] leading-7 text-slate-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-4 list-decimal space-y-2 pl-6 text-[15px] leading-7 text-slate-700">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="marker:text-slate-400">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-4 border-slate-300 pl-4 text-[15px] italic leading-7 text-slate-600">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="my-6 overflow-x-auto rounded-[13px] border border-slate-200 bg-white">
            <table className="min-w-full border-collapse text-left text-sm text-slate-700">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-500">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-slate-200">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="align-top odd:bg-white even:bg-slate-50/70">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="border-b border-slate-200 px-4 py-3 font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 leading-6">{children}</td>
        ),
        hr: () => <hr className="my-8 border-slate-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
