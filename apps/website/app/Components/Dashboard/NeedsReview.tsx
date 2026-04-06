import { TriangleAlert, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewItem {
  id: string;
  type: "CONFLICT DETECTION" | "HUMAN-IN-LOOP" | string;
  title: string;
  description: string;
  severity?: "high" | "medium" | "low";
}

interface NeedsReviewProps {
  items?: ReviewItem[];
  count?: number;
}

const defaultItems: ReviewItem[] = [
  {
    id: "1",
    type: "CONFLICT DETECTION",
    title: "Q3 Revenue Discrepancy",
    description:
      "AI found 3 conflicting sources regarding Q4 Q3 court filing. 2nd ref...",
    severity: "high",
  },
  {
    id: "2",
    type: "HUMAN-IN-LOOP",
    title: "Citation Validation",
    description:
      "Verify source: initial_external_Doc_34 for cross-reference.",
    severity: "medium",
  },
];

const NeedsReview = ({ items = defaultItems, count = 4 }: NeedsReviewProps) => {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm ring-1 ring-black/5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Needs Review</h2>
        {count > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">
            {count}
          </span>
        )}
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition-colors"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Icon */}
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

                {/* Type Badge */}
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  {item.type}
                </span>
              </div>

              {/* Severity Indicator */}
              {item.severity === "high" && (
                <TriangleAlert
                  className="w-5 h-5 text-orange-500"
                  strokeWidth={2}
                />
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-slate-800 mb-2 text-[15px]">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {item.description}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-full h-9 text-sm font-medium"
              >
                REVIEW
              </Button>
              <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-500" strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NeedsReview;
