import Link from "next/link";

import DashboardLayout from "../../Components/Layout/DashboardLayout";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { BiSolidRightArrow } from "react-icons/bi";
import { Calendar, CalendarX, FileText, SearchCheck } from "lucide-react";

import Searchbar from "../../Components/Common/Searchbar";
import { Badge } from "@/components/ui/badge";
import SearchResultCard from "../../Components/Search/SearchResultCard";
import AddToCaseDialog from "@/app/Components/Dialogs/AddToCaseDialog";
import {
  activeSearchTags,
  getSearchResultsForScope,
  normalizeSearchScope,
  searchDataSources,
  searchScopeOptions,
  searchTimeFilters,
  searchResults,
} from "@/lib/mock-search";

const timeFilterIcons = [
  <BiSolidRightArrow key="arrow" />,
  <Calendar key="calendar" />,
  <CalendarX key="calendar-x" />,
];

export default async function SearchPage(props: {
  searchParams: Promise<{ scope?: string | string[]; result?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const scope = normalizeSearchScope(searchParams.scope);
  const scopedResults = getSearchResultsForScope(scope);
  const selectedId = Array.isArray(searchParams.result)
    ? searchParams.result[0]
    : searchParams.result;
  const selectedResult =
    scopedResults.find((item) => item.id === selectedId) ?? scopedResults[0] ?? searchResults[0];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#f3f6f9] min-h-screen">
        <section className="rounded-[28px] bg-[#d9e7f5] p-6 shadow-sm ring-1 ring-black/5">
          <Searchbar />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="capitalize font-[15px] text-black/50">
              Active Search:
            </span>
            {activeSearchTags.map((topic, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-none bg-white/70 px-3 py-1.5 capitalize text-slate-700"
              >
                {topic}
              </Badge>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {searchScopeOptions.map((item) => {
              const active = item.value === scope;
              return (
                <Link
                  key={item.value}
                  href={`/search?scope=${item.value}`}
                  className={`rounded-full px-4 py-2 text-xs font-semibold tracking-[0.14em] transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-white/70 text-slate-700 hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1.35fr)_360px]">
          {/* left bar */}
          <aside className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            {/* top heading and clear all button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Refine Data</h3>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Clear All
              </button>
            </div>

            {/* filter options */}
            <div className="space-y-6">
              {/* Time  */}
              <div>
                <h4 className="text-[20px]">Time</h4>
                <ul className="mt-2 space-y-2">
                  {searchTimeFilters.map((filter, index) => (
                    <li
                      key={index}
                      className="flex justify-between rounded-full bg-white hover:bg-[#d1e5f4] transition-all duration-200 px-3 py-2 items-center gap-2 cursor-pointer text-gray-700 hover:text-gray-900"
                    >
                      <span className="text-sm">{filter}</span>
                      {timeFilterIcons[index]}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Data Sources */}
              <div>
                <h4 className="font-[20px]">Data Sources</h4>
                <FieldGroup className="mt-2 ">
                  {searchDataSources.map((source, index) => (
                    <Field key={index} className="flex flex-row items-center ">
                      <FieldContent>
                        <Checkbox
                          id={`source-${index}`}
                          className="rounded-full size-5"
                        />
                      </FieldContent>
                      <FieldLabel
                        htmlFor={`source-${index}`}
                        className="text-sm"
                      >
                        {source}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
              </div>
            </div>
          </aside>

          <main className="space-y-4">
            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <SearchCheck className="size-5 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {scopedResults.length} matched results
                  </p>
                  <p className="text-xs text-slate-500">
                    Showing the strongest relevance candidates for the current scope.
                  </p>
                </div>
              </div>
            </div>

            {scopedResults.map((item) => (
              <SearchResultCard
                key={item.id}
                item={item}
                isSelected={item.id === selectedResult.id}
                detailHref={`/search?scope=${scope}&result=${item.id}`}
              />
            ))}
          </main>

          <aside className="h-fit rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5 xl:sticky xl:top-24">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
                RESULT DETAIL
              </p>
              <Badge className="rounded-full bg-slate-100 px-3 py-1 text-[10px] tracking-[0.14em] text-slate-700">
                {selectedResult.sourceKind}
              </Badge>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold leading-tight text-slate-900">
                  {selectedResult.title}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedResult.publisher} • {selectedResult.type} • {selectedResult.date}
                </p>
              </div>

              <div className="rounded-[20px] bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  WHY IT MATTERS
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {selectedResult.summary}
                </p>
              </div>

              <div className="rounded-[20px] bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500">
                  KEY ENTITIES
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedResult.keyEntities.map((entity) => (
                    <Badge
                      key={entity}
                      variant="outline"
                      className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-700"
                    >
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <Link
                  href={selectedResult.sourceHref}
                  className="rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  View Source
                </Link>
                <Link
                  href={`/search?scope=${scope}&result=${selectedResult.id}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Summarize Result
                </Link>
                <AddToCaseDialog sourceTitle={selectedResult.title} />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="size-4 text-slate-500" />
                  Confidence {selectedResult.confidence}% · {selectedResult.relevance} relevance
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
