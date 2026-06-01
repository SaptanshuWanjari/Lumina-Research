import type { CaseActivityItem } from "@/lib/data/mock-cases";

interface CaseActivityPanelProps {
  activity: CaseActivityItem[];
}

export default function CaseActivityPanel({ activity }: CaseActivityPanelProps) {
  return (
    <section className="rounded-[13px] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="text-lg font-semibold text-slate-800">History</h2>
      <ul className="mt-4 space-y-3">
        {activity.map((item) => (
          <li key={item.id} className="flex items-start justify-between rounded-xl bg-slate-100 px-4 py-3">
            <p className="text-sm text-slate-700">{item.text}</p>
            <span className="text-xs text-slate-500">{item.at}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
