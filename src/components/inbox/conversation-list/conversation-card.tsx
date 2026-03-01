import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation } from "@/types/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface ConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  isBulkMode: boolean;
  isChecked: boolean;
  onToggleSelect: () => void;
}

export function ConversationCard({
  conversation,
  isSelected,
  isBulkMode,
  isChecked,
  onToggleSelect,
}: ConversationCardProps) {
  const { t } = useTranslation("inbox");
  const navigate = useNavigate();
  const location = useLocation();

  const statusVariant: Record<Conversation["status"], "default" | "secondary" | "outline" | "destructive"> = {
    open: "default",
    pending: "secondary",
    resolved: "outline",
    snoozed: "outline",
  };

  const handleClick = () => {
    if (isBulkMode) {
      onToggleSelect();
    } else {
      const base = location.pathname.replace(/\/[^/]+$/, "") || "chats";
      const path = base.endsWith("chats") ? `${base}/${conversation.id}` : `chats/${conversation.id}`;
      navigate(path);
    }
  };

  const initials = conversation.contactName
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-3 border-b border-border px-3 py-3 transition-colors hover:bg-muted/50",
        isSelected && "bg-accent",
      )}
    >
      {isBulkMode && (
        <div className="flex shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            aria-label={t("bulk.selectAll")}
          />
        </div>
      )}
      <Avatar size="sm" className="shrink-0">
        <AvatarImage src={conversation.contactAvatarUrl} alt={conversation.contactName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-foreground">
            {conversation.contactName || conversation.contactPhone}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(conversation.lastMessage.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {conversation.lastMessage.body || "—"}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant={statusVariant[conversation.status]} className="text-xs">
            {t(`status.${conversation.status}`)}
          </Badge>
          {conversation.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
          {conversation.unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {conversation.unreadCount}
            </Badge>
          )}
          {conversation.assignedTo && (
            <Avatar size="sm" className="size-5 shrink-0">
              <AvatarImage src={conversation.assignedTo.avatarUrl} />
              <AvatarFallback className="text-[10px]">
                {conversation.assignedTo.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
