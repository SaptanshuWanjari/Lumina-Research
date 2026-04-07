import { cn } from "@/lib/utils";

interface ListCardProps extends React.ComponentProps<"section"> {
  title: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function ListCard({
  title,
  action,
  className,
  bodyClassName,
  children,
  ...props
}: ListCardProps) {
  return (
    <section
      className={cn("overflow-hidden rounded-[13px] bg-white shadow-sm ring-1 ring-black/5", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {action ? <div>{action}</div> : null}
      </div>
      <div className={cn("px-6 py-5", bodyClassName)}>{children}</div>
    </section>
  );
}

