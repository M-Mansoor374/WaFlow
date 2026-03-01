import { useRef, useCallback, useLayoutEffect, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInboxStore } from "@/stores/inbox.store";
import { MessageBubble } from "./message-bubble";
import { DateSeparator } from "./date-separator";
import type { Message } from "@/types/message";

const DATE_ROW_HEIGHT = 40;
const MESSAGE_ROW_HEIGHT = 80;

type RowItem =
  | { type: "date"; date: string }
  | { type: "message"; message: Message };

function groupMessagesByDate(messages: Message[]): RowItem[] {
  const rows: RowItem[] = [];
  let lastDate = "";

  for (const msg of messages) {
    const dateKey = msg.createdAt.slice(0, 10);
    if (dateKey !== lastDate) {
      lastDate = dateKey;
      rows.push({ type: "date", date: msg.createdAt });
    }
    rows.push({ type: "message", message: msg });
  }

  return rows;
}

interface MessageListProps {
  conversationId: string | null;
}

export function MessageList({ conversationId }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);

  const messages = useInboxStore((s) =>
    conversationId ? (s.messages[conversationId] ?? []) : [],
  );
  const fetchOlderMessages = useInboxStore((s) => s.fetchOlderMessages);
  const isLoadingMessages = useInboxStore((s) => s.isLoadingMessages);

  const rows = useMemo(() => groupMessagesByDate(messages), [messages]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      return row?.type === "date" ? DATE_ROW_HEIGHT : MESSAGE_ROW_HEIGHT;
    },
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const handleScroll = useCallback(() => {
    if (!conversationId || isLoadingMessages) return;
    const el = parentRef.current;
    if (!el) return;
    if (el.scrollTop < 100) {
      prevScrollHeightRef.current = el.scrollHeight;
      prevScrollTopRef.current = el.scrollTop;
      fetchOlderMessages(conversationId);
    }
  }, [conversationId, isLoadingMessages, fetchOlderMessages]);

  useLayoutEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const newHeight = el.scrollHeight;
    const oldHeight = prevScrollHeightRef.current;
    if (oldHeight > 0 && newHeight > oldHeight) {
      el.scrollTop = prevScrollTopRef.current + (newHeight - oldHeight);
    }
    prevScrollHeightRef.current = 0;
    prevScrollTopRef.current = 0;
  }, [messages.length]);

  if (!conversationId) return null;

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-auto"
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;
          if (row.type === "date") {
            return (
              <div
                key={`date-${row.date}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <DateSeparator date={row.date} />
              </div>
            );
          }
          return (
            <div
              key={row.message.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MessageBubble message={row.message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
