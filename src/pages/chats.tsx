import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWsEvent } from "@/hooks/use-websocket";
import { useInboxStore } from "@/stores/inbox.store";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import type { Message } from "@/types/message";
import type { Conversation } from "@/types/conversation";
import type { ConversationParticipant } from "@/types/conversation";

export function Component() {
  useTranslation(["inbox", "common"]);
  const { conversationId } = useParams<{ conversationId: string }>();

  const fetchConversations = useInboxStore((s) => s.fetchConversations);
  const selectConversation = useInboxStore((s) => s.selectConversation);
  const handleMessageNew = useInboxStore((s) => s.handleMessageNew);
  const handleMessageStatus = useInboxStore((s) => s.handleMessageStatus);
  const handleConversationUpdated = useInboxStore((s) => s.handleConversationUpdated);
  const handleAgentTyping = useInboxStore((s) => s.handleAgentTyping);
  const handleConversationLock = useInboxStore((s) => s.handleConversationLock);
  const handleConversationUnlock = useInboxStore((s) => s.handleConversationUnlock);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    } else {
      selectConversation(null);
    }
  }, [conversationId, selectConversation]);

  useWsEvent<Message>("message:new", handleMessageNew);
  useWsEvent<{ conversationId: string; messageId: string; status: Message["status"] }>(
    "message:status",
    handleMessageStatus,
  );
  useWsEvent<Conversation>("conversation:updated", handleConversationUpdated);
  useWsEvent<{ conversationId: string; agent: ConversationParticipant; isTyping: boolean }>(
    "agent:typing",
    handleAgentTyping,
  );
  useWsEvent<{ conversationId: string; agentId: string; agentName: string; lockedAt: string }>(
    "conversation:lock",
    handleConversationLock,
  );
  useWsEvent<{ conversationId: string }>("conversation:unlock", handleConversationUnlock);

  return (
    <div className="h-full min-h-0 -m-4 flex flex-col md:-m-6">
      <InboxLayout />
    </div>
  );
}
