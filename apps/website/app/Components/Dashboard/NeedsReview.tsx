import Link from "next/link";
import { TriangleAlert, User, ArrowUpRight } from "lucide-react";

import ListCard from "@/app/Components/Common/ListCard";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { dashboardNeedsReview, type DashboardReviewItem } from "@/lib/mock-dashboard";

interface NeedsReviewProps {
  items?: DashboardReviewItem[];
  count?: number;
}

const NeedsReview = ({
  items = dashboardNeedsReview,
  count = dashboardNeedsReview.length,
}: NeedsReviewProps) => {
  return (
    <ListCard
      title="Needs Review"
      action={
        count > 0 ? (
          <span className="rounded-full bg-red-500 px-2.5 py-1 text-center text-xs font-bold text-white min-w-[24px]">
            {count}
          </span>
        ) : null
      }
      bodyClassName="space-y-4"
    >
      {items.length === 0 ? (
        <Empty className="border border-slate-200 bg-slate-50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Nothing waiting for review</EmptyTitle>
            <EmptyDescription>
              Review gates and conflict checks will appear here when a run needs your input.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 p-4 transition-colors hover:border-slate-300"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.type === "CONFLICT DETECTION"
                      ? "bg-red-100"
                      : "bg-slate-100"
                  }`}
                >
                  {item.type === "CONFLICT DETECTION" ? (
                    <TriangleAlert
                      className="w-4 h-4 text-red-600"
                      strokeWidth={2}
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-600" strokeWidth={2} />
                  )}
                </div>
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  {item.type}
                </span>
              </div>
              {item.severity === "high" && (
                <TriangleAlert
                  className="w-5 h-5 text-orange-500"
                  strokeWidth={2}
                />
              )}
            </div>
            <h3 className="font-semibold text-slate-800 mb-2 text-[15px]">
              {item.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {item.description}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-9 rounded-full bg-slate-900 px-5 text-sm font-medium hover:bg-slate-800" asChild>
                <Link href={item.href}>Review</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-9 rounded-full px-4" asChild>
                <Link href={item.href}>
                  Open
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </article>
        ))
      )}
    </ListCard>
  );
};

export default NeedsReview;
