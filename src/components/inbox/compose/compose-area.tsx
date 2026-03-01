import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useInboxStore } from "@/stores/inbox.store";
import { useWsStore } from "@/stores/ws.store";
import { Textarea } from "@/components/ui/textarea";
import { ComposeToolbar } from "./compose-toolbar";
import { validateFile, type MediaType } from "./file-upload-zone";
import { MediaPreview, type MediaPreviewItem } from "./media-preview";
import { QuickReplyCommand } from "./quick-reply-command";
import { MentionAutocomplete } from "./mention-autocomplete";
import { cn } from "@/lib/utils";

export function ComposeArea() {
  const { t } = useTranslation("inbox");
  const { conversationId } = useParams<{ conversationId: string }>();
  const textRef = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState("");
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [attachments, setAttachments] = useState<MediaPreviewItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const mentionIdsRef = useRef<string[]>([]);

  const sendMessage = useInboxStore((s) => s.sendMessage);
  const sendNote = useInboxStore((s) => s.sendNote);
  const uploadMedia = useInboxStore((s) => s.uploadMedia);

  const canSend = value.trim().length > 0 || attachments.length > 0;

  const handleSend = useCallback(() => {
    if (!conversationId) return;
    if (isNoteMode && value.trim()) {
      sendNote(conversationId, value.trim(), mentionIdsRef.current);
      mentionIdsRef.current = [];
      setValue("");
      return;
    }
    if (attachments.length > 0) {
      const item = attachments[0];
      if (item.url && !item.error) {
        const type = item.file.type.startsWith("image/")
          ? "image"
          : item.file.type.startsWith("video/")
            ? "video"
            : item.file.type.startsWith("audio/")
              ? "audio"
              : "document";
        sendMessage(conversationId, {
          type,
          body: value.trim() || undefined,
          mediaUrl: item.url,
        });
        setValue("");
        setAttachments([]);
      }
      return;
    }
    if (value.trim()) {
      sendMessage(conversationId, { type: "text", body: value.trim() });
      setValue("");
    }
  }, [conversationId, value, isNoteMode, attachments, sendMessage, sendNote]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleAttach = useCallback(
    async (files: File[], type: MediaType) => {
      if (!conversationId) return;
      for (const file of files) {
        const err = validateFile(file, type);
        const newItem: MediaPreviewItem = {
          file,
          progress: 0,
          error: err ?? undefined,
        };
        setAttachments((prev) => [...prev, newItem]);
        if (err) continue;
        try {
          const url = await uploadMedia(file);
          setAttachments((prev) =>
            prev.map((x) =>
              x.file === file ? { ...x, url, progress: 100 } : x,
            ),
          );
        } catch {
          setAttachments((prev) =>
            prev.map((x) =>
              x.file === file ? { ...x, error: "Upload failed" } : x,
            ),
          );
        }
      }
    },
    [conversationId, uploadMedia],
  );

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    const ta = textRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(200, Math.max(40, ta.scrollHeight))}px`;
  }, [value]);

  useEffect(() => {
    if (!conversationId) return;
    const ta = textRef.current;
    if (!ta) return;
    const onFocus = () => {
      useWsStore.getState().send("conversation:lock", { conversationId });
    };
    const onBlur = () => {
      useWsStore.getState().send("conversation:unlock", { conversationId });
    };
    ta.addEventListener("focus", onFocus);
    ta.addEventListener("blur", onBlur);
    return () => {
      ta.removeEventListener("focus", onFocus);
      ta.removeEventListener("blur", onBlur);
    };
  }, [conversationId]);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!conversationId || !value.trim()) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    useWsStore.getState().send("typing:start", { conversationId });
    typingTimeoutRef.current = setTimeout(() => {
      useWsStore.getState().send("typing:stop", { conversationId });
      typingTimeoutRef.current = null;
    }, 2000);
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        useWsStore.getState().send("typing:stop", { conversationId });
      }
    };
  }, [conversationId, value]);

  const showQuickReply = value.startsWith("/");
  const quickReplyQuery = showQuickReply ? value.slice(1) : "";
  const lastAt = value.lastIndexOf("@");
  const showMention = isNoteMode && lastAt >= 0 && !value.slice(lastAt + 1).includes(" ");
  const mentionQuery = showMention ? value.slice(lastAt + 1) : "";

  const handleQuickReplySelect = useCallback((body: string) => {
    setValue(body);
  }, []);

  const handleMentionSelect = useCallback((name: string, id: string) => {
    const before = value.slice(0, lastAt);
    const after = value.slice(lastAt + mentionQuery.length);
    setValue(`${before}@${name} ${after}`);
    mentionIdsRef.current = [...mentionIdsRef.current, id];
  }, [value, lastAt, mentionQuery.length]);

  if (!conversationId) return null;

  return (
    <div
      className={cn(
        "flex flex-col border-t border-border bg-background",
        dragOver && "ring-2 ring-primary/50",
      )}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) {
          const type = files[0].type.startsWith("image/")
            ? "image"
            : files[0].type.startsWith("video/")
              ? "video"
              : files[0].type.startsWith("audio/")
                ? "audio"
                : "document";
          handleAttach(files, type);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <MediaPreview items={attachments} onRemove={removeAttachment} />
      <div className="relative flex min-h-[44px] items-end gap-2 px-2 py-2">
        <QuickReplyCommand
          query={quickReplyQuery}
          onSelect={handleQuickReplySelect}
          open={showQuickReply}
        />
        <MentionAutocomplete
          query={mentionQuery}
          onSelect={handleMentionSelect}
          open={showMention}
        />
        <Textarea
          ref={textRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isNoteMode ? t("notes.mentionHint") : t("compose.placeholder")
          }
          className={cn(
            "min-h-[40px] max-h-[200px] resize-none py-2",
            isNoteMode && "border-amber-500/50 focus-visible:ring-amber-500/30",
          )}
          rows={1}
        />
      </div>
      <ComposeToolbar
        onAttach={handleAttach}
        onSend={handleSend}
        sendDisabled={!canSend}
        isNoteMode={isNoteMode}
        onNoteModeChange={setIsNoteMode}
      />
    </div>
  );
}
