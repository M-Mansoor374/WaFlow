import type { Message } from "@/types/message";
import { DeliveryStatus } from "./delivery-status";
import { formatTime } from "@/lib/format";
import { TextMessage } from "./messages/text-message";
import { ImageMessage } from "./messages/image-message";
import { VideoMessage } from "./messages/video-message";
import { AudioMessage } from "./messages/audio-message";
import { DocumentMessage } from "./messages/document-message";
import { LocationMessage } from "./messages/location-message";
import { NoteMessage } from "./messages/note-message";
import { SystemMessage } from "./messages/system-message";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOut = message.direction === "out";

  const content = (
    <>
      {message.type === "text" && <TextMessage message={message} />}
      {message.type === "image" && <ImageMessage message={message} />}
      {message.type === "video" && <VideoMessage message={message} />}
      {message.type === "audio" && <AudioMessage message={message} />}
      {message.type === "document" && <DocumentMessage message={message} />}
      {message.type === "location" && <LocationMessage message={message} />}
      {message.type === "note" && <NoteMessage message={message} />}
      {message.type === "system" && <SystemMessage message={message} />}
      {!["text", "image", "video", "audio", "document", "location", "note", "system"].includes(message.type) && (
        <TextMessage message={message} />
      )}
    </>
  );

  if (message.type === "system") {
    return <SystemMessage message={message} />;
  }

  return (
    <div
      className={cn(
        "flex w-full gap-2 px-3 py-1",
        isOut && "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-0.5 rounded-2xl px-3 py-2",
          isOut
            ? "rounded-se-sm bg-primary text-primary-foreground"
            : "rounded-ss-sm bg-muted",
        )}
      >
        {content}
        <div className={cn("flex items-center justify-end gap-1", isOut ? "text-primary-foreground/80" : "text-muted-foreground")}>
          <span className="text-[10px]">{formatTime(message.createdAt)}</span>
          <DeliveryStatus status={message.status} direction={message.direction} />
        </div>
      </div>
    </div>
  );
}
