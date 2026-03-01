import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInboxStore } from "@/stores/inbox.store";
import type { ConversationStatus } from "@/types/conversation";
import type { Label } from "@/types/conversation";
import type { ConversationParticipant } from "@/types/conversation";
import { apiClient } from "@/lib/api";

export function InboxFilters() {
  const { t } = useTranslation("inbox");
  const filters = useInboxStore((s) => s.filters);
  const setFilters = useInboxStore((s) => s.setFilters);

  const [labels, setLabels] = useState<Label[]>([]);
  const [agents, setAgents] = useState<ConversationParticipant[]>([]);
  const [numbers, setNumbers] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    apiClient<Label[]>("/labels").then(setLabels).catch(() => setLabels([]));
    apiClient<ConversationParticipant[]>("/agents").then(setAgents).catch(() => setAgents([]));
    apiClient<{ id: string; label: string }[]>("/whatsapp-numbers").then(setNumbers).catch(() => setNumbers([]));
  }, []);

  const statuses: ConversationStatus[] = ["open", "pending", "resolved", "snoozed"];

  const toggleStatus = (s: ConversationStatus) => {
    const next = filters.status?.includes(s)
      ? (filters.status?.filter((x) => x !== s) ?? [])
      : [...(filters.status ?? []), s];
    setFilters({ ...filters, status: next.length ? next : undefined });
  };

  const toggleLabel = (id: string) => {
    const next = filters.labelIds?.includes(id)
      ? (filters.labelIds?.filter((x) => x !== id) ?? [])
      : [...(filters.labelIds ?? []), id];
    setFilters({ ...filters, labelIds: next.length ? next : undefined });
  };

  const setAssignee = (id: string) => {
    setFilters({ ...filters, assignedTo: id || undefined });
  };

  const setNumber = (id: string) => {
    setFilters({ ...filters, whatsappNumberId: id || undefined });
  };

  const hasActive = Boolean(
    filters.status?.length ||
    filters.labelIds?.length ||
    filters.assignedTo ||
    filters.whatsappNumberId,
  );

  const clearAll = () => setFilters({});

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={hasActive ? "secondary" : "ghost"} size="sm" className="gap-1.5">
          <Filter className="size-4" />
          {t("filters.title")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("filters.status")}</p>
            <div className="flex flex-wrap gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  className={`rounded-md px-2 py-1 text-xs ${filters.status?.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                >
                  {t(`status.${s}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("filters.labels")}</p>
            <div className="max-h-32 space-y-1 overflow-auto">
              {labels.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.labelIds?.includes(l.id) ?? false}
                    onChange={() => toggleLabel(l.id)}
                  />
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("filters.assignee")}</p>
            <select
              value={filters.assignedTo ?? ""}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="unassigned">{t("filters.unassigned")}</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("filters.whatsappNumber")}</p>
            <select
              value={filters.whatsappNumberId ?? ""}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {numbers.map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>
          {hasActive && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
              Clear filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
