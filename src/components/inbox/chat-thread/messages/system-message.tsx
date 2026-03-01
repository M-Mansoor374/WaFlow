import type { Message } from "@/types/message";

interface SystemMessageProps {
  message: Message;
}

export function SystemMessage({ message }: SystemMessageProps) {
  return (
    <div className="flex w-full justify-center py-1">
      <span className="rounded-full bg-muted px-3 py-1 text-center text-xs text-muted-foreground">
        {message.body ?? ""}
      </span>
    </div>
  );
}
