import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MacroCardProps extends React.ComponentProps<"section"> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  contentClassName?: string;
}

export default function MacroCard({
  title,
  description,
  action,
  className,
  children,
  contentClassName,
  ...props
}: MacroCardProps) {
  return (
    <Card
      asChild={false}
      className={cn("rounded-[28px] py-0 shadow-sm ring-1 ring-black/5", className)}
      {...props}
    >
      <section>
        {(title || description || action) && (
          <CardHeader className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                {title ? <h2 className="text-xl font-semibold text-slate-800">{title}</h2> : null}
                {description ? (
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                ) : null}
              </div>
              {action ? <div>{action}</div> : null}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn("px-6 py-5", contentClassName)}>
          {children}
        </CardContent>
      </section>
    </Card>
  );
}

