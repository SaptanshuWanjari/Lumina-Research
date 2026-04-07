import { Skeleton } from "@/components/ui/skeleton";

interface CasesTableSkeletonProps {
  rows?: number;
}

export default function CasesTableSkeleton({ rows = 5 }: CasesTableSkeletonProps) {
  return (
    <ul className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={`case-skeleton-${index}`}
          className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[1.6fr_120px_140px_140px_180px_110px] md:gap-4 md:px-6"
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-3 w-32 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
