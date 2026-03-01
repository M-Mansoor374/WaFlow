import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentSelector } from "@/components/inbox/assignment/agent-selector";
import { TypingIndicator } from "./typing-indicator";
import { LockBanner } from "./lock-banner";
import { useInboxStore } from "@/stores/inbox.store";
import { useAuthStore } from "@/stores/auth.store";
import type { Conversation } from "@/types/conversation";

interface ConversationHeaderProps {
  conversation: Conversation | undefined;
  onBack?: () => void;
  onOpenContact?: () => void;
  showBack?: boolean;
  showContactButton?: boolean;
  onLockOverride?: (reason: string) => void;
}

export function ConversationHeader({
  conversation,
  onBack,
  onOpenContact,
  showBack,
  showContactButton,
  onLockOverride,
}: ConversationHeaderProps) {
  const { t } = useTranslation("inbox");
  const { conversationId } = useParams<{ conversationId: string }>();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const typingAgents = useInboxStore((s) =>
    conversationId ? (s.typingAgents[conversationId] ?? []) : [],
  );
  const lockState = useInboxStore((s) =>
    conversationId ? s.lockState[conversationId] : undefined,
  );

  const showLockBanner =
    lockState &&
    currentUserId &&
    lockState.agentId !== currentUserId;

  const title = conversation?.contactName ?? conversation?.contactPhone ?? t("empty.selectConversation");

  return (
    <div className="flex shrink-0 flex-col border-b border-border bg-background">
      <div className="flex items-center gap-2 px-3 py-2">
        {showBack && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label={t("common:back")}>
            <ChevronLeft className="size-5" />
          </Button>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
        {conversationId && (
          <AgentSelector
            conversationId={conversationId}
            assignedTo={conversation?.assignedTo ?? null}
          />
        )}
        {showContactButton && onOpenContact && (
          <Button variant="ghost" size="icon" onClick={onOpenContact} aria-label={t("contact.title")}>
            <User className="size-5" />
          </Button>
        )}
      </div>
      <TypingIndicator names={typingAgents.map((a) => a.name)} />
      {showLockBanner && (
        <LockBanner
          agentName={lockState.agentName}
          onReplyAnyway={onLockOverride}
        />
      )}
    </div>
  );
}
