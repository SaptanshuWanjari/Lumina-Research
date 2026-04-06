import { MoreVertical } from "lucide-react";
import Link from "next/link";

interface Case {
  id: string;
  title: string;
  subtitle: string;
  status: "RUNNING" | "INGESTING" | "READY";
  lastUpdated: string;
}

interface RecentCasesProps {
  cases?: Case[];
  showViewAll?: boolean;
}

const defaultCases: Case[] = [
  {
    id: "1",
    title: "Global Supply Chain Fragility 2024",
    subtitle: "Economics / Logistics",
    status: "RUNNING",
    lastUpdated: "14 mins ago",
  },
  {
    id: "2",
    title: "Semi-Conductor Lithography Trends",
    subtitle: "Technology / Geopolitics",
    status: "INGESTING",
    lastUpdated: "2 hours ago",
  },
  {
    id: "3",
    title: "Digital Asset Regulatory Framework",
    subtitle: "Fintech / Legal",
    status: "READY",
    lastUpdated: "Yesterday",
  },
];

const statusStyles = {
  RUNNING: "bg-blue-100 text-blue-700",
  INGESTING: "bg-purple-100 text-purple-700",
  READY: "bg-slate-100 text-slate-700",
};

const RecentCases = ({
  cases = defaultCases,
  showViewAll = true,
}: RecentCasesProps) => {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm ring-1 ring-black/5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Recent Cases</h2>
        {showViewAll && (
          <Link
            href="/cases"
            className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="space-y-1">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_120px_120px_40px] gap-4 pb-3 border-b border-slate-200">
          <div className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
            Case Title
          </div>
          <div className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
            Status
          </div>
          <div className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
            Last Updated
          </div>
          <div></div>
        </div>

        {/* Table Rows */}
        {cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="grid grid-cols-[1fr_120px_120px_40px] gap-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors rounded-lg group"
          >
            {/* Title */}
            <div className="flex flex-col gap-1">
              <p className="font-medium text-slate-800 text-[15px] leading-tight">
                {caseItem.title}
              </p>
              <p className="text-xs text-slate-500">{caseItem.subtitle}</p>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <span
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide ${
                  statusStyles[caseItem.status]
                }`}
              >
                {caseItem.status}
              </span>
            </div>

            {/* Last Updated */}
            <div className="flex items-center">
              <p className="text-sm text-slate-600">{caseItem.lastUpdated}</p>
            </div>

            {/* Action Menu */}
            <div className="flex items-center justify-center">
              <button className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCases;
