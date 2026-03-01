import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DateSeparatorProps {
  date: string;
  className?: string;
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const d = date.toDateString();
  const t = today.toDateString();
  const y = yesterday.toDateString();

  if (d === t) return "Today";
  if (d === y) return "Yesterday";
  return formatDate(dateStr, { formatStr: "dd/MM/yyyy" });
}

export function DateSeparator({ date, className }: DateSeparatorProps) {
  const label = getDateLabel(date);
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center py-2",
        className,
      )}
    >
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
