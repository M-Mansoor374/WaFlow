import { useTranslation } from "react-i18next";
import { Paperclip } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const MAX_IMAGE_SIZE = 16 * 1024 * 1024;
const MAX_VIDEO_SIZE = 16 * 1024 * 1024;
const MAX_AUDIO_SIZE = 16 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 100 * 1024 * 1024;

export type MediaType = "image" | "video" | "audio" | "document" | "location";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[], type: MediaType) => void;
  onDragOver?: (over: boolean) => void;
  disabled?: boolean;
  className?: string;
}

function getMediaTypeFromFile(file: File): MediaType {
  const type = file.type.toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "document";
}

function validateFile(file: File, type: MediaType): string | null {
  const limits: Record<MediaType, number> = {
    image: MAX_IMAGE_SIZE,
    video: MAX_VIDEO_SIZE,
    audio: MAX_AUDIO_SIZE,
    document: MAX_DOCUMENT_SIZE,
    location: 0,
  };
  const max = limits[type];
  if (type === "location") return null;
  if (file.size > max) {
    const maxMb = max / (1024 * 1024);
    return `File must be under ${maxMb}MB`;
  }
  return null;
}

export function FileUploadZone({
  onFilesSelected,
  disabled,
}: Omit<FileUploadZoneProps, "onDragOver" | "className">) {
  const { t } = useTranslation("inbox");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={t("compose.attach")}
        >
          <Paperclip className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="grid gap-1">
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <span>Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) onFilesSelected(files, "image");
              }}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <span>Video</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) onFilesSelected(files, "video");
              }}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <span>Audio</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) onFilesSelected(files, "audio");
              }}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <span>Document</span>
            <input
              type="file"
              accept="*/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) onFilesSelected(files, "document");
              }}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { validateFile, getMediaTypeFromFile };
export const FILE_LIMITS = {
  image: MAX_IMAGE_SIZE,
  video: MAX_VIDEO_SIZE,
  audio: MAX_AUDIO_SIZE,
  document: MAX_DOCUMENT_SIZE,
};
