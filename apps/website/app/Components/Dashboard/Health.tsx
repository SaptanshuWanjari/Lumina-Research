import { ChartGantt } from "lucide-react";

type ProgressBarProps = {
  label: string;
  value: number;
};

function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div className="mb-5">
      <div className="mb-1 flex justify-between text-[15px] font-semibold tracking-wide text-slate-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-300">
        <div
          className="h-1.5 rounded-full bg-slate-600"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const Health = () => {
  const data = {
    status:
      "Signal extraction and citation quality remain steady across recent local analysis runs.",
    active_cases: 8,
    reports_published: 142,
    in_progress: {
      ingestion: 82,
      analysis_run: 45,
    },
  };

  return (
    <div className="bg-[#c9d3df] rounded-[28px] p-6 flex items-center justify-between">
      {/* LEFT */}
      <div className="max-w-95">
        <h2 className="text-[32px] font-semibold text-slate-700 leading-tight mb-3">
          Research
          <br />
          Status
        </h2>

        <p className="text-[17px] text-slate-600 leading-relaxed mb-8">
          {data.status}
        </p>

        {/* stats */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-[36px] font-bold text-slate-700">
              {data.active_cases}
            </p>
            <p className="text-[13px] tracking-widest text-slate-500 mt-1">
              ACTIVE CASES
            </p>
          </div>

          <div className="h-10 w-px bg-slate-400/40" />

          <div>
            <p className="text-[36px] font-bold text-slate-700">
              {data.reports_published}
            </p>
            <p className="text-[13px] tracking-widest text-slate-500 mt-1">
              REPORTS PUBLISHED
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT CARD */}
      <div className="bg-[#dde3ea] rounded-[24px] px-5 py-6 w-60">
        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-700 font-semibold text-lg">
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
        <div className="flex items-center gap-2 text-[12px] text-slate-600 tracking-widest">
          <div className="w-2 h-2 bg-slate-600 rounded-full" />
          <span>ACTIVE ANALYSIS FLOW</span>
        </div>
      </div>
    </div>
  );
};

export default Health;
