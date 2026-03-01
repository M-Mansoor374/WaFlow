import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInboxStore } from "@/stores/inbox.store";
import type { ConversationStatus } from "@/types/conversation";
import type { Label } from "@/types/conversation";
import { apiClient } from "@/lib/api";

export function BulkActionsToolbar() {
  const { t } = useTranslation("inbox");
  const selectedIds = useInboxStore((s) => s.selectedIds);
  const clearSelection = useInboxStore((s) => s.clearSelection);
  const bulkAssign = useInboxStore((s) => s.bulkAssign);
  const bulkUpdateStatus = useInboxStore((s) => s.bulkUpdateStatus);
  const bulkAddLabel = useInboxStore((s) => s.bulkAddLabel);

  const [statusOpen, setStatusOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    apiClient<Label[]>("/labels").then(setLabels).catch(() => setLabels([]));
    apiClient<{ id: string; name: string }[]>("/agents").then(setAgents).catch(() => setAgents([]));
  }, []);

  if (selectedIds.length === 0) return null;

  const statuses: ConversationStatus[] = ["open", "pending", "resolved", "snoozed"];

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/50 px-3 py-2">
      <span className="text-sm font-medium">{selectedIds.length} selected</span>
      <div className="flex items-center gap-2">
        <Popover open={assignOpen} onOpenChange={setAssignOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">{t("bulk.assign")}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <button
              type="button"
              className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
              onClick={() => {
                bulkAssign(null);
                setAssignOpen(false);
              }}
            >
              {t("assignment.returnToUnassigned")}
            </button>
            {agents.map((a) => (
              <button
                key={a.id}
                type="button"
                className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => {
                  bulkAssign(a.id);
                  setAssignOpen(false);
                }}
              >
                {a.name}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">{t("bulk.changeStatus")}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => {
                  bulkUpdateStatus(s);
                  setStatusOpen(false);
                }}
              >
                {t(`status.${s}`)}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Popover open={labelOpen} onOpenChange={setLabelOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">{t("bulk.addLabel")}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            {labels.map((l) => (
              <button
                key={l.id}
                type="button"
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => {
                  bulkAddLabel(l.id);
                  setLabelOpen(false);
                }}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="sm" onClick={() => clearSelection()}>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
