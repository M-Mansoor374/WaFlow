import { useState } from "react";
import type { Message } from "@/types/message";

interface ImageMessageProps {
  message: Message;
}

export function ImageMessage({ message }: ImageMessageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const media = message.media;
  if (!media?.url) return null;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={media.url}
          alt={media.caption ?? "Image"}
          className="max-w-[280px] max-h-[280px] object-cover"
        />
      </button>
      {lightboxOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
          aria-label="Close"
        >
          <img
            src={media.url}
            alt={media.caption ?? "Image"}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      )}
      {media.caption && (
        <p className="whitespace-pre-wrap break-words text-sm">{media.caption}</p>
      )}
    </div>
  );
}
