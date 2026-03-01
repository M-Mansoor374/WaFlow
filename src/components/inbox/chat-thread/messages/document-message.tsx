import { FileText } from "lucide-react";
import type { Message } from "@/types/message";

interface DocumentMessageProps {
  message: Message;
}

export function DocumentMessage({ message }: DocumentMessageProps) {
  const media = message.media;
  if (!media?.url) return null;

  const name = media.filename ?? media.caption ?? "Document";
  const sizeStr = media.size
    ? `${(media.size / 1024).toFixed(1)} KB`
    : "";

  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      download={media.filename}
      className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3 transition-colors hover:bg-muted/50"
    >
      <FileText className="size-10 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {sizeStr && <p className="text-xs text-muted-foreground">{sizeStr}</p>}
      </div>
    </a>
  );
}
