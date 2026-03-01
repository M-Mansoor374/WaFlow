import { Check, CheckCheck } from "lucide-react";
import type { Message } from "@/types/message";
import { cn } from "@/lib/utils";

interface DeliveryStatusProps {
  status: Message["status"];
  direction: Message["direction"];
  className?: string;
}

export function DeliveryStatus({ status, direction, className }: DeliveryStatusProps) {
  if (direction === "in") return null;

  const title =
    status === "sending"
      ? "Sending"
      : status === "sent"
        ? "Sent"
        : status === "delivered"
          ? "Delivered"
          : status === "read"
            ? "Read"
            : "Failed";

  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      title={title}
      aria-label={title}
    >
      {status === "failed" ? (
        <span className="text-destructive" aria-hidden>!</span>
      ) : status === "read" ? (
        <CheckCheck className="size-4 text-primary" aria-hidden />
      ) : status === "delivered" || status === "sent" ? (
        <CheckCheck className="size-4 text-muted-foreground" aria-hidden />
      ) : (
        <Check className="size-4 text-muted-foreground" aria-hidden />
      )}
    </span>
  );
}
