import { useRef, useState, useEffect } from "react";
import type { Message } from "@/types/message";

interface AudioMessageProps {
  message: Message;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioMessage({ message }: AudioMessageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const media = message.media;
  if (!media?.url) return null;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () => setDuration(el.duration);
    const onEnded = () => setPlaying(false);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={togglePlay}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/10 hover:bg-black/20"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <span className="text-lg font-bold">‖</span>
        ) : (
          <span className="ms-0.5 text-lg">▶</span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex h-2 gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-current opacity-30"
              style={{
                height: `${Math.sin((i / 19) * Math.PI) * 8 + 4}px`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs opacity-80">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration || 0)}</span>
        </div>
      </div>
      <audio ref={audioRef} src={media.url} preload="metadata" />
    </div>
  );
}
