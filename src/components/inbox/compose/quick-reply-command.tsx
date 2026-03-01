import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export interface QuickReply {
  id: string;
  title: string;
  body: string;
  scope: "account" | "personal";
  usageCount: number;
}

interface QuickReplyCommandProps {
  query: string;
  onSelect: (body: string) => void;
  open: boolean;
}

export function QuickReplyCommand({ query, onSelect, open }: QuickReplyCommandProps) {
  const [items, setItems] = useState<QuickReply[]>([]);

  useEffect(() => {
    if (!open) return;
    apiClient<QuickReply[]>("/quick-replies")
      .then((data) => setItems(data ?? []))
      .catch(() => setItems([]));
  }, [open]);

  const filtered = items.filter(
    (q) =>
      !query ||
      q.title.toLowerCase().includes(query.toLowerCase()) ||
      q.body.toLowerCase().includes(query.toLowerCase()),
  ).sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));

  if (!open || filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-md">
      {filtered.slice(0, 10).map((q) => (
        <button
          key={q.id}
          type="button"
          className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
          onClick={() => onSelect(q.body)}
        >
          <span className="font-medium">{q.title}</span>
          <span className="truncate text-xs text-muted-foreground">{q.body}</span>
        </button>
      ))}
    </div>
  );
}
