import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "../../../Components/Layout/DashboardLayout";
import { MarkdownRenderer } from "@/app/Components/Report/MarkdownRenderer";
import { ApproveRunButton } from "@/app/Components/Runs/ApproveRunButton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRunDetail } from "@/lib/server/data";
import { formatDateTime, formatDurationMs } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700",
  running: "bg-sky-100 text-sky-800",
  needs_review: "bg-amber-100 text-amber-800",
  resuming: "bg-blue-100 text-blue-800",
  complete: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-200 text-slate-700",
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function isRecord(value: unknown): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatScore(value: unknown) {
  return typeof value === "number" ? value.toFixed(2) : "n/a";
}

function artifactGroupLabel(artifactType: string) {
  switch (artifactType) {
    case "draft_report":
      return "Draft Report";
    case "retrieval_set":
      return "Retrieved Evidence";
    case "trace":
      return "Research Plan";
    case "human_review":
      return "Review State";
    default:
      return formatLabel(artifactType);
  }
}

function sortArtifactTypes(types: string[]) {
  const order = ["draft_report", "retrieval_set", "trace"];
  return [...types].sort((left, right) => {
    const leftIndex = order.indexOf(left);
    const rightIndex = order.indexOf(right);
    const leftRank = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const rightRank = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
    return leftRank - rightRank || left.localeCompare(right);
  });
}

function renderStringList(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const values = items.filter((item): item is string => typeof item === "string");
  if (values.length === 0) return null;

  return (
    <ul className="mt-3 space-y-2 text-sm text-slate-700">
      {values.map((item) => (
        <li key={item} className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
          {item}
        </li>
      ))}
    </ul>
  );
}

function renderResearchPlan(payload: Record<string, JsonValue>) {
  return (
    <div className="space-y-3">
      {renderStringList(payload.research_plan)}
    </div>
  );
}

function renderRetrievalSet(payload: Record<string, JsonValue>) {
  const chunks = Array.isArray(payload.chunks)
    ? payload.chunks.filter(isRecord)
    : [];

  if (chunks.length === 0) {
    return <p className="text-sm text-slate-500">No retrieved evidence recorded.</p>;
  }

  return (
    <div className="space-y-3">
      {chunks.map((chunk, index) => (
        <article key={`${String(chunk.case_id ?? "chunk")}-${index}`} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            {typeof chunk.query === "string" ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                {chunk.query}
              </span>
            ) : null}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              Score {formatScore(chunk.score)}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {typeof chunk.content === "string"
              ? chunk.content
              : "No content excerpt stored."}
          </p>
        </article>
      ))}
    </div>
  );
}

function renderRetrievalEntries(chunks: Record<string, JsonValue>[]) {
  if (chunks.length === 0) {
    return <p className="text-sm text-slate-500">No retrieved evidence recorded.</p>;
  }

  if (chunks.length === 1) {
    const chunk = chunks[0];
    return (
      <article className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          {typeof chunk.query === "string" ? (
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              {chunk.query}
            </span>
          ) : null}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            Score {formatScore(chunk.score)}
          </span>
          {typeof chunk.citation_label === "string" ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
              {chunk.citation_label}
            </span>
          ) : null}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {typeof chunk.content === "string"
            ? chunk.content
            : "No content excerpt stored."}
        </p>
      </article>
    );
  }

  return (
    <Tabs defaultValue="evidence-0" className="mt-2">
      <TabsList className="flex h-auto w-full justify-start overflow-x-auto rounded-2xl bg-slate-100 p-1">
        {chunks.map((chunk, index) => (
          <TabsTrigger
            key={`evidence-tab-${index}`}
            value={`evidence-${index}`}
            className="min-w-fit shrink-0 px-3 py-2 text-xs sm:text-sm"
          >
            {typeof chunk.query === "string"
              ? `${index + 1}. ${chunk.query.slice(0, 32)}`
              : `Evidence ${index + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {chunks.map((chunk, index) => (
        <TabsContent key={`evidence-content-${index}`} value={`evidence-${index}`} className="mt-4">
          <article className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              {typeof chunk.query === "string" ? (
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                  {chunk.query}
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                Score {formatScore(chunk.score)}
              </span>
              {typeof chunk.citation_label === "string" ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  {chunk.citation_label}
                </span>
              ) : null}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {typeof chunk.content === "string"
                ? chunk.content
                : "No content excerpt stored."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              {typeof chunk.source_id === "string" ? (
                <span>Source {chunk.source_id}</span>
              ) : null}
              {typeof chunk.chunk_id === "string" ? (
                <span>Chunk {chunk.chunk_id}</span>
              ) : null}
            </div>
          </article>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function renderHumanReview(payload: Record<string, JsonValue>) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">Draft ready for review</p>
      <p className="mt-1">
        Report version ID:{" "}
        <span className="font-mono text-xs">
          {typeof payload.report_version_id === "string"
            ? payload.report_version_id
            : "unknown"}
        </span>
      </p>
    </div>
  );
}

function renderDraftReport(payload: Record<string, JsonValue>) {
  const citations = isRecord(payload.citations) ? payload.citations : null;
  const contentMarkdown =
    typeof payload.content_markdown === "string" ? payload.content_markdown : null;

  return (
    <div className="space-y-4">
      {contentMarkdown ? (
        <section className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <MarkdownRenderer content={contentMarkdown} />
        </section>
      ) : null}
      {typeof payload.summary === "string" ? (
        <section className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
            Summary
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {payload.summary}
          </p>
        </section>
      ) : null}
      {citations ? (
        <section className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
            Citations
          </p>
          <div className="mt-3 space-y-3">
            {Object.entries(citations).map(([topic, refs]) => {
              const values = Array.isArray(refs)
                ? refs.filter((item): item is string => typeof item === "string")
                : [];

              return (
                <article key={topic} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="font-semibold text-slate-900">{topic}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {values.length > 0 ? (
                      values.map((reference) => (
                        <span
                          key={reference}
                          className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200"
                        >
                          {reference}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No citations listed.</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function renderMarkdownPayload(title: string, content: string) {
  return (
    <section>
      <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <MarkdownRenderer content={content} />
      </div>
    </section>
  );
}

function renderFallbackPayload(payload: Record<string, JsonValue>) {
  if (typeof payload.content_markdown === "string") {
    return renderMarkdownPayload("CONTENT", payload.content_markdown);
  }

  if (typeof payload.draft_report === "string") {
    return renderMarkdownPayload("DRAFT", payload.draft_report);
  }

  if (typeof payload.final_report === "string") {
    return renderMarkdownPayload("FINAL REPORT", payload.final_report);
  }

  if (typeof payload.analysis_notes === "string") {
    return renderMarkdownPayload("ANALYSIS", payload.analysis_notes);
  }

  if (
    typeof payload.report_version_id === "string" &&
    Object.keys(payload).length === 1
  ) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        Report version ID:{" "}
        <span className="font-mono text-xs text-slate-900">
          {payload.report_version_id}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(payload).map(([key, value]) => (
        <article key={key} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
            {formatLabel(key)}
          </p>
          {typeof value === "string" ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {value}
            </p>
          ) : (
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-600">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </article>
      ))}
    </div>
  );
}

function renderArtifactPayload(
  artifactType: string,
  payload: Record<string, JsonValue> | null,
) {
  if (!payload) {
    return <p className="text-sm text-slate-500">No artifact payload stored.</p>;
  }

  switch (artifactType) {
    case "trace":
      return renderResearchPlan(payload);
    case "retrieval_set":
      return renderRetrievalSet(payload);
    case "human_review":
      return renderHumanReview(payload);
    case "draft_report":
      return renderDraftReport(payload);
    default:
      return renderFallbackPayload(payload);
  }
}

function renderArtifactGroup(
  artifactType: string,
  artifacts: { id: string; title: string | null; payloadJson: Record<string, JsonValue> | null }[],
) {
  if (artifactType === "retrieval_set") {
    const chunks = artifacts.flatMap((artifact) => {
      const payload = artifact.payloadJson;
      if (!payload || !Array.isArray(payload.chunks)) return [];
      return payload.chunks.filter(isRecord);
    });

    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Inspect retrieved chunks by query and score.
        </p>
        {renderRetrievalEntries(chunks)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {artifacts.map((artifact, index) => (
        <div
          key={artifact.id}
          className="space-y-3"
        >
          {artifacts.length > 1 ? (
            <p className="text-sm font-medium text-slate-600">
              {artifact.title ?? `${artifactGroupLabel(artifactType)} ${index + 1}`}
            </p>
          ) : null}
          <div className="rounded-[16px] bg-slate-100 p-4">
            {renderArtifactPayload(artifactType, artifact.payloadJson)}
          </div>
        </div>
      ))}
    </div>
  );
}

function isReviewStateArtifact(artifact: {
  artifactType: string;
  payloadJson: Record<string, JsonValue> | null;
}) {
  if (artifact.artifactType === "human_review") {
    return true;
  }

  const payload = artifact.payloadJson;
  if (!payload) {
    return false;
  }

  return (
    typeof payload.report_version_id === "string" &&
    Object.keys(payload).length === 1
  );
}

export default async function RunPage(props: PageProps<"/runs/[runId]">) {
  const { runId } = await props.params;
  const detail = await getRunDetail(runId);
  if (!detail) notFound();

  const reviewArtifact = detail.artifacts.find(
    (artifact) =>
      artifact.payloadJson &&
      typeof (artifact.payloadJson as Record<string, unknown>).report_version_id === "string",
  );
  const reviewReportVersionId =
    reviewArtifact &&
    typeof (reviewArtifact.payloadJson as Record<string, unknown>).report_version_id === "string"
      ? ((reviewArtifact.payloadJson as Record<string, unknown>).report_version_id as string)
      : null;

  const artifactGroups = detail.artifacts.reduce<
    Record<
      string,
      { id: string; title: string | null; payloadJson: Record<string, JsonValue> | null }[]
    >
  >((groups, artifact) => {
    if (
      isReviewStateArtifact({
        artifactType: artifact.artifactType,
        payloadJson: artifact.payloadJson as Record<string, JsonValue> | null,
      })
    ) {
      return groups;
    }
    const type = artifact.artifactType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push({
      id: artifact.id,
      title: artifact.title,
      payloadJson: artifact.payloadJson as Record<string, JsonValue> | null,
    });
    return groups;
  }, {});
  const artifactTypes = sortArtifactTypes(Object.keys(artifactGroups));
  const defaultArtifactTab = artifactTypes[0] ?? "empty";

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-6">
          <header className="rounded-[13px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={STATUS_CLASS[detail.run.status] ?? "bg-slate-100 text-slate-700"}>
                    {detail.run.status}
                  </Badge>
                  <Link
                    href={`/cases/${detail.caseItem.id}/details`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
                  >
                    {detail.caseItem.title}
                  </Link>
                </div>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                  Run Trace
                </h1>
                <p className="mt-3 text-slate-600">
                  Current step: {detail.run.currentStep ?? "unknown"}
                </p>
              </div>
              {detail.run.needsReview ? <ApproveRunButton runId={detail.run.id} /> : null}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">STARTED</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(detail.run.startedAt)}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">COMPLETED</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDateTime(detail.run.completedAt)}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">DURATION</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDurationMs(detail.run.durationMs)}
                </p>
              </article>
              <article className="rounded-[13px] bg-slate-50 p-4">
                <p className="text-xs tracking-[0.16em] text-slate-500">ARTIFACTS</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {detail.artifacts.length}
                </p>
              </article>
            </div>
            {detail.run.reviewSummary ? (
              <div className="mt-5 rounded-[13px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {detail.run.reviewSummary}
              </div>
            ) : null}
            {detail.run.errorMessage ? (
              <div className="mt-3 rounded-[13px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {detail.run.errorMessage}
              </div>
            ) : null}
          </header>

          <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Artifacts</h2>
                {detail.reports.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detail.reports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/report/${report.id}/overview`}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
                      >
                        {report.title ?? `v${report.versionNumber}`} • {report.status}
                      </Link>
                    ))}
                    {reviewReportVersionId ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-900 ring-1 ring-amber-200">
                        Report version ID • {reviewReportVersionId}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">
                    Explore the draft, evidence, plan, and review state without leaving the run.
                  </p>
                )}
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {detail.artifacts.length} items
              </span>
            </div>
            {artifactTypes.length === 0 ? (
              <div className="mt-4 rounded-[13px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No artifacts persisted yet.
              </div>
            ) : (
              <Tabs defaultValue={defaultArtifactTab} className="mt-4">
                <TabsList className="h-auto w-fit flex-wrap rounded-2xl bg-slate-100 p-1">
                  {artifactTypes.map((artifactType) => (
                    <TabsTrigger key={artifactType} value={artifactType} className="px-4 py-2">
                      {artifactGroupLabel(artifactType)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {artifactTypes.map((artifactType) => (
                  <TabsContent key={artifactType} value={artifactType} className="mt-5">
                    {renderArtifactGroup(artifactType, artifactGroups[artifactType] ?? [])}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </section>

          <details className="group rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Run Steps</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Expand to inspect each execution stage and timing.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {detail.steps.length} steps
              </span>
            </summary>
            <div className="mt-4 space-y-3">
              {detail.steps.map((step) => (
                <article
                  key={step.id}
                  className="rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900">
                      {step.stepOrder}. {step.stepKey}
                    </p>
                    <Badge className={STATUS_CLASS[step.status] ?? "bg-slate-100 text-slate-700"}>
                      {step.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {step.goal ?? "No goal recorded."}
                  </p>
                  {step.errorMessage ? (
                    <p className="mt-2 text-sm text-rose-700">{step.errorMessage}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    Started {formatDateTime(step.startedAt)} • Completed {formatDateTime(step.completedAt)} • Duration {formatDurationMs(step.durationMs)}
                  </p>
                </article>
              ))}
            </div>
          </details>
        </div>
      </section>
    </DashboardLayout>
  );
}
