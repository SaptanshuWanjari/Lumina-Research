import type { StorageLocationSummary } from "@/lib/server/ai-settings";

interface LocalPathsTableProps {
  locations: StorageLocationSummary[];
}

export default function LocalPathsTable({
  locations = [],
}: LocalPathsTableProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Data Footprint</h2>
        <p className="mt-1 text-sm text-slate-500">
          Storage paths below are discovered from your indexed sources. This tab is
          read-only until path management is implemented end to end.
        </p>
      </div>

      <div className="space-y-3">
        {locations.length ? (
          locations.map((location) => (
            <article
              key={location.path}
              className="rounded-[13px] border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{location.path}</p>
                  <p className="text-sm text-slate-500">
                    Referenced by {location.sourceCount} indexed{" "}
                    {location.sourceCount === 1 ? "source" : "sources"}.
                  </p>
                </div>
                <p className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  READ ONLY
                </p>
              </div>
            </article>
          ))
        ) : (
          <article className="rounded-[13px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            No stored source paths yet. Uploaded files and fetched URLs will appear here
            after ingestion writes a storage path.
          </article>
        )}
      </div>
    </div>
  );
}
