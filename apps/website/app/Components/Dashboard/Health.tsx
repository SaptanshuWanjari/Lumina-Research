import { ChartGantt } from "lucide-react";

const Health = () => {
  const data = {
    status:
      "Your workspace is performing at peak efficiency. Signal extraction and citation accuracy are above historical averages.",
    active_cases: 8,
    reports_published: 142,
    in_progress: {
      ingestion: 82,
      analysis_run: 45,
    },
  };

  type ProgressBarProps = {
    label: string;
    value: number;
  };

  const ProgressBar = ({ label, value }:ProgressBarProps) => (
    <div className="mb-5">
      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1 tracking-wide">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="w-full h-1.5 bg-slate-300 rounded-full">
        <div
          className="h-1.5 bg-slate-600 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-[#c9d3df] rounded-[28px] p-6 flex items-center justify-between max-w-180">
      {/* LEFT */}
      <div className="max-w-95">
        <h2 className="text-[28px] font-semibold text-slate-700 leading-tight mb-3">
          Workspace
          <br />
          Health
        </h2>

        <p className="text-[13px] text-slate-600 leading-relaxed mb-8">
          {data.status}
        </p>

        {/* stats */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-[36px] font-bold text-slate-700">
              {data.active_cases}
            </p>
            <p className="text-[10px] tracking-widest text-slate-500 mt-1">
              ACTIVE CASES
            </p>
          </div>

          <div className="h-10 w-px bg-slate-400/40" />

          <div>
            <p className="text-[36px] font-bold text-slate-700">
              {data.reports_published}
            </p>
            <p className="text-[10px] tracking-widest text-slate-500 mt-1">
              REPORTS PUBLISHED
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT CARD */}
      <div className="bg-[#dde3ea] rounded-[24px] px-5 py-6 w-60">
        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-700 font-semibold text-sm">
            In Progress
          </h3>
          <ChartGantt className="w-4 h-4 text-slate-500" />
        </div>

        <ProgressBar
          label="INGESTION"
          value={data.in_progress.ingestion}
        />
        <ProgressBar
          label="ANALYSIS"
          value={data.in_progress.analysis_run}
        />

        {/* divider */}
        <div className="my-4 h-px bg-slate-400/30" />

        {/* footer */}
        <div className="flex items-center gap-2 text-[10px] text-slate-600 tracking-widest">
          <div className="w-2 h-2 bg-slate-600 rounded-full" />
          <span>ACTIVE PROCESSING ENGINE</span>
        </div>
      </div>
    </div>
  );
};

export default Health;
