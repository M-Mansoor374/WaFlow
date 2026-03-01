import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/inbox/conversation-list/conversation-list";
import { InboxToolbar } from "@/components/inbox/conversation-list/inbox-toolbar";
import { ChatThread } from "@/components/inbox/chat-thread/chat-thread";
import { ContactSidebar } from "@/components/inbox/contact-sidebar/contact-sidebar";
import { cn } from "@/lib/utils";

type MobileView = "list" | "thread" | "contact";

export function InboxLayout() {
  const { t } = useTranslation("inbox");
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [contactPanelOpen, setContactPanelOpen] = useState(true);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Sync mobile view with URL: when conversationId is set, show thread on mobile
  useEffect(() => {
    if (!conversationId) setMobileView("list");
    else if (isMobile && mobileView === "list") setMobileView("thread");
  }, [conversationId, isMobile]);

  const showList = !conversationId ? true : isMobile ? mobileView === "list" : true;
  const showThread = isMobile ? (conversationId && mobileView === "thread") : true;
  const showContact = conversationId && (isMobile ? mobileView === "contact" : contactPanelOpen);

  const openContact = () => {
    if (isMobile) setMobileView("contact");
    else setContactPanelOpen(true);
  };

  const backToList = () => {
    navigate("chats");
    if (isMobile) setMobileView("list");
  };

  const backToThread = () => {
    if (isMobile) setMobileView("thread");
  };

  return (
    <div className="flex h-full min-h-0 w-full">
      {/* Left panel: conversation list */}
      <div
        className={cn(
          "flex w-full flex-col border-e border-border bg-background md:w-[320px] md:shrink-0",
          !showList && "hidden md:flex",
        )}
      >
        <InboxToolbar />
        <div className="flex-1 min-h-0">
          <ConversationList />
        </div>
      </div>

      {/* Center panel: chat thread */}
      <div
        className={cn(
          "flex flex-1 flex-col bg-muted/30 min-w-0",
          !showThread && "hidden md:flex",
        )}
      >
        {showThread ? (
          <ChatThread
            onBack={backToList}
            onOpenContact={openContact}
            showBack={isMobile}
            showContactButton={!!conversationId}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="mx-auto size-12 mb-2 opacity-50" />
              <p className="text-sm">{t("empty.selectConversation")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: contact sidebar */}
      {showContact && conversationId && (
        <div
          className={cn(
            "flex w-full flex-col border-s border-border bg-background md:w-[320px] md:shrink-0",
            isMobile ? "absolute inset-0 z-10 bg-background" : "",
          )}
        >
          <div className="flex shrink-0 items-center border-b border-border px-3 py-2">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={backToThread} aria-label={t("common:back")}>
                <ChevronLeft className="size-5" />
              </Button>
            )}
            <span className="font-medium">{t("contact.title")}</span>
          </div>
          <ContactSidebar className="flex-1 min-h-0" />
        </div>
      )}
    </div>
  );
}
