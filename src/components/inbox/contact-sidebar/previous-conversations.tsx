import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/format";
import { apiClient } from "@/lib/api";

interface PreviousConv {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface PreviousConversationsProps {
  contactId: string | null;
}

export function PreviousConversations({ contactId }: PreviousConversationsProps) {
  const { t } = useTranslation("inbox");
  const navigate = useNavigate();
  const { conversationId: currentConvId } = useParams<{ conversationId: string }>();
  const [list, setList] = useState<PreviousConv[]>([]);

  useEffect(() => {
    if (!contactId) {
      setList([]);
      return;
    }
    let cancelled = false;
    apiClient<PreviousConv[]>(`/contacts/${contactId}/conversations`)
      .then((data) => {
        if (!cancelled) setList(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      });
    return () => {
      cancelled = true;
    };
  }, [contactId]);

  if (!contactId || list.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {t("contact.previousConversations")}
      </p>
      <ul className="space-y-1">
        {list
          .filter((c) => c.id !== currentConvId)
          .map((conv) => (
            <li key={conv.id}>
              <button
                type="button"
                onClick={() => navigate(`chats/${conv.id}`)}
                className="w-full rounded-md border border-transparent px-2 py-1.5 text-left text-sm hover:bg-muted/50"
              >
                <span className="font-medium capitalize">{conv.status}</span>
                <span className="ms-2 text-muted-foreground">
                  {formatDate(conv.createdAt)} – {formatDate(conv.updatedAt)}
                </span>
                <span className="ms-2 text-xs text-muted-foreground">
                  ({conv.messageCount} messages)
                </span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
