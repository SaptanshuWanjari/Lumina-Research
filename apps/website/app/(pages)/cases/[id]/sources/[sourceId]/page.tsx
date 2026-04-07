import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  CircleDashed,
  Download,
  FileSearch,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../../../../Components/Layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSourceById, type SourceStatus } from "@/lib/mock-cases";
import { ReSyncButton, LaunchExplorerButton, SourceActionMenu } from "@/app/Components/Sources/SourceActionButtons";

function statusBadgeClass(status: SourceStatus) {
  if (status === "indexed") return "bg-emerald-100 text-emerald-800";
  if (status === "ingesting") return "bg-amber-100 text-amber-800";
  if (status === "failed") return "bg-rose-100 text-rose-800";
  return "bg-slate-200 text-slate-700";
}

const PIPELINE_STEPS = ["Fetch", "Extract", "Chunk", "Embed", "Index"] as const;

function completedStepCount(status: SourceStatus) {
  if (status === "pending") return 0;
  if (status === "ingesting") return 3;
  if (status === "failed") return 2;
  return PIPELINE_STEPS.length;
}

export async function generateMetadata(
  props: PageProps<"/cases/[id]/sources/[sourceId]">
): Promise<Metadata> {
  const { id, sourceId } = await props.params;
  const source = getSourceById(id, sourceId);
  return {
    title: `${source.title} · Source Extraction`,
  };
}

export default async function SourceExtractionPage(
  props: PageProps<"/cases/[id]/sources/[sourceId]">
) {
  const { id, sourceId } = await props.params;
  const query = await props.searchParams;

  const source = getSourceById(id, sourceId);
  const selectedChunkId =
    typeof query.chunk === "string" ? query.chunk : source.chunks[0]?.id;
  const selectedChunk =
    source.chunks.find((chunk) => chunk.id === selectedChunkId) ??
    source.chunks[0];
  const doneSteps = completedStepCount(source.status);

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,2.1fr)_330px]">
          <div className="space-y-5">
            <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-slate-200 px-3 py-1 text-[12px] font-semibold tracking-[0.14em] text-slate-700">
                      SOURCE ANALYSIS
                    </Badge>
                    <Badge
                      className={`rounded-full px-3 py-1 text-[13px] font-semibold tracking-[0.14em] ${statusBadgeClass(
                        source.status
                      )}`}
                    >
                      {source.status.toUpperCase()}
                    </Badge>
                  </div>
                  <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
                    {source.title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600">
                    {source.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
                    <p>FILE SIZE</p>
                    <p className="font-semibold text-slate-800">{source.fileSize}</p>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
                    <p>CHUNKS</p>
                    <p className="font-semibold text-slate-800">
                      {source.chunksCount}
                    </p>
                  </div>
                  <ReSyncButton />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {PIPELINE_STEPS.map((step, idx) => {
                  const done = idx < doneSteps;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                          done
                            ? "bg-slate-900 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {done ? <CheckCircle2 className="size-3" /> : idx + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {step}
                      </span>
                      {idx < PIPELINE_STEPS.length - 1 && (
                        <span className="mx-1 h-px w-8 bg-slate-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            </header>

            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold tracking-[0.06em] text-slate-800">
                  Document Content Chunks
                </h2>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Filter by keyword..."
                    className="h-9 w-[220px] rounded-full border-slate-300 bg-slate-50 text-sm"
                  />
                </div>
              </header>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,1fr)]">
                <div className="space-y-3">
                  {source.chunks.length === 0 ? (
                    <div className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      No chunks available for this source state.
                    </div>
                  ) : (
                    source.chunks.map((chunk) => (
                      <Link
                        key={chunk.id}
                        href={`/cases/${id}/sources/${sourceId}?chunk=${chunk.id}`}
                        className={`block rounded-[13px] border px-4 py-3 transition-colors ${
                          selectedChunk?.id === chunk.id
                            ? "border-slate-400 bg-slate-100"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[15px] font-semibold tracking-[0.12em] text-slate-500">
                            #{chunk.id.toUpperCase()}
                          </p>
                          <p
                            className={`text-[14px] font-bold ${
                              chunk.vectorized
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }`}
                          >
                            {chunk.vectorized ? "VECTORIZED" : "PENDING"}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-slate-800">{chunk.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {chunk.excerpt}
                        </p>
                        <p className="mt-2 text-[14px] font-semibold tracking-wide text-slate-400">
                          {chunk.pageRange}
                        </p>
                      </Link>
                    ))
                  )}
                </div>

                <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold tracking-[0.1em] text-slate-500">
                    Chunk Detail
                  </h3>
                  {selectedChunk ? (
                    <>
                      <p className="mt-3 text-base font-semibold text-slate-800">
                        {selectedChunk.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {selectedChunk.excerpt}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="rounded-xl bg-white px-3 py-2">
                          <p className="text-[12px] tracking-widest text-slate-400">
                            USED IN REPORT
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {selectedChunk.usedInReport ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <p className="text-[12px] tracking-widest text-slate-400">
                            CHUNK RANGE
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {selectedChunk.pageRange}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Select a chunk to inspect details.
                    </p>
                  )}

                  <div className="mt-4 rounded-xl bg-white px-3 py-3">
                    <p className="text-[14px] font-semibold tracking-[0.14em] text-slate-500">
                      LATENT SPACE PREVIEW
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Embeddings visualization available for semantic drift
                      inspection.
                    </p>
                    <LaunchExplorerButton />
                  </div>
                </article>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,1fr)]">
                <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[15px] font-semibold tracking-[0.12em] text-slate-500">
                    AUTOMATED EXECUTIVE SUMMARY
                  </p>
                  <p className="mt-2 text-sm italic leading-relaxed text-slate-600">
                    &quot;{source.summary}&quot;
                  </p>
                </article>
                <article className="rounded-[13px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[15px] font-semibold tracking-[0.12em] text-slate-500">
                    PRIMARY DETECTED ENTITIES
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {source.entities.length ? (
                      source.entities.map((entity) => (
                        <Badge
                          key={entity}
                          className="rounded-full bg-slate-200 px-2.5 py-1 text-[14px] text-slate-700"
                        >
                          {entity}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No entities detected in current source state.
                      </p>
                    )}
                  </div>
                </article>
              </div>
            </section>

            {source.status === "failed" && source.errors?.length ? (
              <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h2 className="text-base font-semibold tracking-[0.06em] text-slate-800">
                  Errors
                </h2>
                <Accordion type="single" collapsible className="mt-3 gap-2">
                  {source.errors.map((error, idx) => (
                    <AccordionItem
                      key={error.title}
                      value={`error-${idx}`}
                      className="border border-rose-200 bg-rose-50"
                    >
                      <AccordionTrigger className="py-4 text-sm text-rose-900">
                        {error.title}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-sm text-rose-800">
                        <p>{error.detail}</p>
                        <p className="mt-2 font-semibold">Recommended fix:</p>
                        <p>{error.fix}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ) : null}
          </div>

          <aside>
            <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                SOURCE CONTROL CENTER
              </h3>

              <div className="mt-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  SOURCE HEALTH
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[84%] rounded-full bg-slate-700" />
                </div>
                <p className="mt-1 text-xs text-slate-500">Readability 84%</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-100 px-3 py-2">
                    <p className="text-[10px] tracking-widest text-slate-400">
                      DENSITY
                    </p>
                    <p className="font-semibold text-slate-700">Dense</p>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2">
                    <p className="text-[10px] tracking-widest text-slate-400">
                      CONSISTENCY
                    </p>
                    <p className="font-semibold text-slate-700">High</p>
                  </div>
                </div>
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  ACTIONS
                </p>
                <SourceActionMenu />
              </div>

              <div className="my-5 h-px bg-slate-200" />

              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  INDEX METADATA
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex justify-between">
                    <span>Indexed Date:</span>
                    <span className="font-semibold text-slate-700">
                      {source.indexedAt}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Model Used:</span>
                    <span className="font-semibold text-slate-700">
                      {source.modelUsed}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Token Count:</span>
                    <span className="font-semibold text-slate-700">
                      {source.tokenCount}
                    </span>
                  </li>
                </ul>
              </div>

              {/* <div className="my-5 h-px bg-slate-200" />

              <div className="rounded-[13px] bg-slate-900 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <h4 className="text-sm font-semibold tracking-wide">
                    Extraction Notes
                  </h4>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Chunk distribution is stable with high semantic cohesion across
                  finance-related sections.
                </p>
              </div> */}

              <div className="my-5 h-px bg-slate-200" />

              <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <FileSearch className="size-4 text-slate-500" />
                  {source.chunksCount} chunks in index
                </p>
                <p className="flex items-center gap-2">
                  <CircleDashed className="size-4 text-slate-500" />
                  Pipeline status: {source.status}
                </p>
                <p className="flex items-center gap-2">
                  {source.status === "failed" ? (
                    <AlertTriangle className="size-4 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  )}
                  {source.status === "failed"
                    ? "Review extraction errors before re-sync."
                    : "Source ready for citation-backed synthesis."}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}
