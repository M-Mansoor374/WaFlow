import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface Agent {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface MentionAutocompleteProps {
  query: string;
  onSelect: (name: string, id: string) => void;
  open: boolean;
}

export function MentionAutocomplete({ query, onSelect, open }: MentionAutocompleteProps) {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (!open) return;
    apiClient<Agent[]>("/agents")
      .then((data) => setAgents(data ?? []))
      .catch(() => setAgents([]));
  }, [open]);

  const filtered = agents.filter(
    (a) => !query || a.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (!open || filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-40 overflow-auto rounded-md border border-border bg-popover shadow-md">
      {filtered.slice(0, 8).map((a) => (
        <button
          key={a.id}
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
          onClick={() => onSelect(a.name, a.id)}
        >
          <span className="font-medium">{a.name}</span>
        </button>
      ))}
    </div>
  );
}
