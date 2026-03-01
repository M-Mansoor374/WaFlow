import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InboxFilters } from "./inbox-filters";
import { FilterChips } from "./filter-chips";
import { useInboxStore } from "@/stores/inbox.store";
import { apiClient } from "@/lib/api";

interface SearchResult {
  conversationId: string;
  contactName: string;
  snippet: string;
  date: string;
}

export function InboxToolbar() {
  const { t } = useTranslation("inbox");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const selectConversation = useInboxStore((s) => s.selectConversation);
  const isBulkMode = useInboxStore((s) => s.isBulkMode);
  const toggleBulkMode = useInboxStore((s) => s.toggleBulkMode);

  const runSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await apiClient<SearchResult[]>(`/search?q=${encodeURIComponent(query.trim())}`);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(runSearch, 300);
    return () => clearTimeout(timer);
  }, [runSearch, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (document.activeElement?.tagName !== "TEXTAREA") {
          setSearchOpen((o) => !o);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleResultClick = (convId: string) => {
    selectConversation(convId);
    navigate(`chats/${convId}`);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <>
      <div className="flex shrink-0 flex-col border-b border-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Input
            type="search"
            placeholder={t("search.placeholder")}
            className="h-8 flex-1"
            aria-label={t("search.placeholder")}
            onClick={() => setSearchOpen(true)}
            readOnly
          />
          <Button
            type="button"
            variant={isBulkMode ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleBulkMode}
          >
            {t("bulk.select")}
          </Button>
          <InboxFilters />
        </div>
        <FilterChips />
      </div>
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[10vh]"
          role="dialog"
          aria-modal="true"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-lg border border-border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              type="search"
              placeholder={t("search.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 border-b focus-visible:ring-0"
              autoFocus
            />
            <div className="max-h-[60vh] overflow-auto">
              {searching ? (
                <p className="p-4 text-sm text-muted-foreground">Searching...</p>
              ) : results.length === 0 && query.trim() ? (
                <p className="p-4 text-sm text-muted-foreground">{t("search.noResults")}</p>
              ) : (
                results.map((r) => (
                  <button
                    key={r.conversationId}
                    type="button"
                    className="flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left hover:bg-muted/50"
                    onClick={() => handleResultClick(r.conversationId)}
                  >
                    <span className="font-medium">{r.contactName}</span>
                    <span className="truncate text-sm text-muted-foreground">{r.snippet}</span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
