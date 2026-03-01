import { useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Message } from "@/types/message";

interface VideoMessageProps {
  message: Message;
}

export function VideoMessage({ message }: VideoMessageProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = message.media;
  if (!media?.url) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative max-w-[280px] overflow-hidden rounded-lg">
        <video
          ref={videoRef}
          src={media.url}
          className="max-h-[280px] w-full object-cover"
          poster={media.thumbnailUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onClick={togglePlay}
          controls={playing}
        />
        {!playing && (
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity hover:bg-black/50"
            onClick={togglePlay}
            aria-label="Play"
          >
            <Play className="size-12 text-white fill-white" />
          </button>
        )}
      </div>
      {media.caption && (
        <p className="whitespace-pre-wrap break-words text-sm">{media.caption}</p>
      )}
    </div>
  );
}
