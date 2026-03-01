import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInboxStore } from "@/stores/inbox.store";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { ComposeArea } from "@/components/inbox/compose/compose-area";
import { useWsStore } from "@/stores/ws.store";

interface ChatThreadProps {
  onBack?: () => void;
  onOpenContact?: () => void;
  showBack?: boolean;
  showContactButton?: boolean;
}

export function ChatThread({
  onBack,
  onOpenContact,
  showBack,
  showContactButton,
}: ChatThreadProps) {
  const { t } = useTranslation("inbox");
  const { conversationId } = useParams<{ conversationId: string }>();
  const activeConversation = useInboxStore((s) =>
    s.conversations.find((c) => c.id === conversationId),
  );
  const isLoadingMessages = useInboxStore((s) => s.isLoadingMessages);
  const conversationError = useInboxStore((s) => s.conversationError);
  const messages = useInboxStore((s) =>
    conversationId ? (s.messages[conversationId] ?? []) : [],
  );

  if (conversationError) {
    const errorMsg =
      conversationError === "not_found"
        ? t("errors.conversationNotFound")
        : conversationError === "forbidden"
          ? t("errors.conversationForbidden")
          : t("errors.conversationNetwork");
    return (
      <div className="flex flex-1 flex-col">
        <ConversationHeader
          conversation={activeConversation}
          onBack={onBack}
          onOpenContact={onOpenContact}
          showBack={showBack}
          showContactButton={showContactButton}
        />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-sm text-muted-foreground">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-sm text-muted-foreground">
            {t("empty.selectConversation")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <ConversationHeader
        conversation={activeConversation}
        onBack={onBack}
        onOpenContact={onOpenContact}
        showBack={showBack}
        showContactButton={showContactButton}
        onLockOverride={(reason) => {
          if (conversationId) {
            useWsStore.getState().send("conversation:unlock", { conversationId, reason });
          }
        }}
      />
      {isLoadingMessages && messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      ) : (
        <>
          <MessageList conversationId={conversationId} />
          <ComposeArea />
        </>
      )}
    </div>
  );
}
