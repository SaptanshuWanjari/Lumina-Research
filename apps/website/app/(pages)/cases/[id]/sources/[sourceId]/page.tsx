import { notFound } from "next/navigation";

import DashboardLayout from "../../../../../Components/Layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { getSourceDetail } from "@/lib/server/data";
import { formatDateTime, truncateText } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  fetching: "bg-sky-100 text-sky-800",
  extracting: "bg-blue-100 text-blue-800",
  chunking: "bg-indigo-100 text-indigo-800",
  embedding: "bg-violet-100 text-violet-800",
  indexed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  archived: "bg-slate-200 text-slate-700",
};

export default async function SourcePage(
  props: PageProps<"/cases/[id]/sources/[sourceId]">,
) {
  const { id, sourceId } = await props.params;
  const detail = await getSourceDetail(id, sourceId);
  if (!detail) notFound();

  const fileName =
    typeof detail.source.metadata.filename === "string"
      ? detail.source.metadata.filename
      : null;

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-6">
          <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={STATUS_CLASS[detail.source.status] ?? "bg-slate-100 text-slate-700"}>
                {detail.source.status}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700">
                {detail.source.sourceType}
              </Badge>
            </div>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              {detail.source.title}
            </h1>
            <p className="mt-3 max-w-4xl text-slate-600">
              {detail.source.url ??
                truncateText(detail.source.noteText ?? "Uploaded source", 220)}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">CHUNKS</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {detail.chunks.length}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">ATTEMPTS</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {detail.attempts.length}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">FILENAME</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {fileName ?? "N/A"}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">UPDATED</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(detail.source.updatedAt)}
                </p>
              </article>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-slate-800">Indexed Chunks</h2>
              <div className="mt-4 space-y-3">
                {detail.chunks.length === 0 ? (
                  <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No chunks available yet. Wait for ingestion to reach `indexed`.
                  </div>
                ) : (
                  detail.chunks.map((chunk) => (
                    <article
                      key={chunk.id}
                      className="rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-900">
                          Chunk {chunk.chunkIndex}
                        </p>
                        <span className="text-xs text-slate-500">
                          {chunk.tokenCount ? `${chunk.tokenCount} tokens` : "token count N/A"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {truncateText(chunk.content, 420)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-slate-800">Ingestion Attempts</h2>
              <div className="mt-4 space-y-3">
                {detail.attempts.length === 0 ? (
                  <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No ingestion attempts recorded yet.
                  </div>
                ) : (
                  detail.attempts.map((attempt) => (
                    <article
                      key={attempt.id}
                      className="rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-900">
                          Attempt {attempt.attemptNo}
                        </p>
                        <Badge className={STATUS_CLASS[attempt.status] ?? "bg-slate-100 text-slate-700"}>
                          {attempt.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Stage: {attempt.stage ?? "unknown"}
                      </p>
                      {attempt.errorMessage ? (
                        <p className="mt-2 text-sm text-rose-700">{attempt.errorMessage}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-slate-500">
                        Started {formatDateTime(attempt.startedAt)} • Finished {formatDateTime(attempt.finishedAt)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
