import Link from "next/link";

import AddToCaseDialog from "@/app/Components/Dialogs/AddToCaseDialog";
import { SearchResultItem } from "@/lib/data/mock-search";

interface SearchResultCardProps {
  item: SearchResultItem;
  detailHref: string;
  isSelected?: boolean;
}

const SearchResultCard = ({
  item,
  detailHref,
  isSelected = false,
}: SearchResultCardProps) => {
  return (
    <article
      className={`rounded-[13px] p-5 shadow-sm ring-1 transition-colors md:p-6 ${
        isSelected
          ? "bg-white ring-slate-900/12"
          : "bg-[#f7fafc] ring-black/5 hover:bg-white"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f2eff0]">
              <div className="rounded-md bg-[#f04444] px-2 py-2 text-[15px] font-bold tracking-wide text-white">
                PDF
              </div>
            </div>
            <div className="space-y-2">
              <Link href={detailHref} className="block">
                <h3 className="max-w-3xl text-2xl font-semibold leading-tight text-slate-800 md:text-3xl">
                  {item.title}
                </h3>
              </Link>
              <p className="text-base font-medium text-slate-600 md:text-lg">
                {item.publisher} • {item.type} • {item.date}
              </p>
            </div>
          </div>

          <div className="flex flex-row items-start justify-between gap-3 lg:flex-col lg:items-end lg:justify-start lg:pt-1">
            <div className="rounded-full bg-[#d6e6f6] px-4 py-2.5 text-right">
              <p className="text-sm font-bold tracking-[0.16em] text-slate-700">
                {item.confidence}% CONFIDENCE
              </p>
            </div>
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-600 md:text-sm">
              {item.relevance} RELEVANCE
            </p>
          </div>
        </div>

        <p className="text-xl leading-[1.55] text-slate-700 md:text-2xl">
          {item.snippet.map((part, index) =>
            part.highlight ? (
              <span
                key={`${item.id}-snippet-${index}`}
                className="mx-1 rounded-xl bg-[#e7edf4] px-2 py-1 font-semibold text-slate-900"
              >
                {part.text}
              </span>
            ) : (
              <span key={`${item.id}-snippet-${index}`}>{part.text}</span>
            )
          )}
        </p>

        <div className="h-px w-full bg-slate-300/60" />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-full space-y-2 xl:max-w-[38%]">
            <p className="text-sm font-semibold tracking-[0.25em] text-slate-500">
              KEY ENTITIES
            </p>
            <p className="text-base font-semibold leading-snug text-slate-800 md:text-lg">
              {item.keyEntities.join(", ")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 xl:gap-6">
            <button className="text-base font-semibold text-slate-600 transition-colors hover:text-slate-900">
              Summarize
            </button>
            <Link
              href={item.sourceHref}
              className="text-base font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              View Source
            </Link>
            <AddToCaseDialog
              sourceTitle={item.title}
              triggerClassName="h-11 rounded-full bg-[#0f1118] px-5 text-sm font-semibold text-white hover:bg-[#1c2230]"
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default SearchResultCard;
