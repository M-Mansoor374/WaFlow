import type { Message } from "@/types/message";

interface TextMessageProps {
  message: Message;
}

export function TextMessage({ message }: TextMessageProps) {
  return (
    <p className="whitespace-pre-wrap break-words text-sm">
      {message.body ?? ""}
    </p>
  );
}
