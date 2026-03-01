import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api";
import { useInboxStore } from "@/stores/inbox.store";
import type { ConversationParticipant } from "@/types/conversation";
import { cn } from "@/lib/utils";

interface AgentSelectorProps {
  conversationId: string;
  assignedTo: ConversationParticipant | null;
  className?: string;
}

export function AgentSelector({
  conversationId,
  assignedTo,
  className,
}: AgentSelectorProps) {
  const { t } = useTranslation("inbox");
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<ConversationParticipant[]>([]);
  const [search, setSearch] = useState("");

  const assignAgent = useInboxStore((s) => s.assignAgent);

  useEffect(() => {
    let cancelled = false;
    apiClient<ConversationParticipant[]>("/agents")
      .then((data) => {
        if (!cancelled) setAgents(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setAgents([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = agents.filter(
    (a) =>
      !search.trim() ||
      a.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleSelect = (agentId: string | null) => {
    assignAgent(conversationId, agentId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
        >
          {assignedTo ? (
            <>
              <Avatar size="sm" className="size-5">
                <AvatarImage src={assignedTo.avatarUrl} />
                <AvatarFallback className="text-[10px]">
                  {assignedTo.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[120px]">{assignedTo.name}</span>
            </>
          ) : (
            <span>{t("assignment.assignTo")}</span>
          )}
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b border-border">
          <Input
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-[240px] overflow-auto">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
            onClick={() => handleSelect(null)}
          >
            <UserX className="size-4" />
            {t("assignment.returnToUnassigned")}
          </button>
          {filtered.map((agent) => (
            <button
              key={agent.id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
              onClick={() => handleSelect(agent.id)}
            >
              <Avatar size="sm" className="size-6">
                <AvatarImage src={agent.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {agent.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{agent.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
