import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  bgColor?: string;
  iconColor?: string;
}

const StatCard = ({
  icon: Icon,
  value,
  label,
  bgColor = "bg-white",
  iconColor = "text-slate-700",
}: StatCardProps) => {
  return (
    <div
      className={`${bgColor} rounded-[24px] p-6 shadow-sm ring-1 ring-black/5 flex flex-col items-start gap-4 min-h-[140px]`}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
      </div>

      {/* Value */}
      <div className="flex flex-col gap-1">
        <p className="text-4xl font-bold text-slate-800 tracking-tight">
          {value}
        </p>
        <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
