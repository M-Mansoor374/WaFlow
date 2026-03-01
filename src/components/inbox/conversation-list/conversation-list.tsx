import { useRef, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { useInboxStore } from "@/stores/inbox.store";
import { InboxTabs } from "./inbox-tabs";
import { ConversationCard } from "./conversation-card";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import { Skeleton } from "@/components/ui/skeleton";

const ROW_HEIGHT = 88;

export function ConversationList() {
  const { t } = useTranslation("inbox");
  const parentRef = useRef<HTMLDivElement>(null);

  const conversations = useInboxStore((s) => s.conversations);
  const isLoadingList = useInboxStore((s) => s.isLoadingList);
  const activeConversationId = useInboxStore((s) => s.activeConversationId);
  const activeTab = useInboxStore((s) => s.activeTab);
  const setActiveTab = useInboxStore((s) => s.setActiveTab);
  const isBulkMode = useInboxStore((s) => s.isBulkMode);
  const selectedIds = useInboxStore((s) => s.selectedIds);
  const toggleSelection = useInboxStore((s) => s.toggleSelection);
  const totalCount = useInboxStore((s) => s.totalCount);
  const selectAll = useInboxStore((s) => s.selectAll);

  const loadMore = useCallback(() => {
    const state = useInboxStore.getState();
    const loaded = state.conversations.length;
    if (loaded >= state.totalCount || state.isLoadingList) return;
    useInboxStore.setState((s) => ({ page: s.page + 1 }));
    useInboxStore.getState().fetchConversations();
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: conversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;
    const loaded = lastItem.index + 1;
    if (loaded >= conversations.length && conversations.length < totalCount) {
      loadMore();
    }
  }, [lastItem?.index, conversations.length, totalCount, loadMore]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border p-2">
        <InboxTabs value={activeTab} onValueChange={setActiveTab} />
      </div>
      {isBulkMode && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedIds.length === conversations.length && conversations.length > 0}
              onChange={selectAll}
            />
            {t("bulk.selectAll")}
          </label>
        </div>
      )}
      <BulkActionsToolbar />
      <div ref={parentRef} className="flex-1 overflow-auto">
        {isLoadingList && conversations.length === 0 ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-md" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {t("empty.noConversations")}
          </p>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const conv = conversations[virtualRow.index];
              if (!conv) return null;
              return (
                <div
                  key={conv.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <ConversationCard
                    conversation={conv}
                    isSelected={activeConversationId === conv.id}
                    isBulkMode={isBulkMode}
                    isChecked={selectedIds.includes(conv.id)}
                    onToggleSelect={() => toggleSelection(conv.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
