import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "./file-upload-zone";
import type { MediaType } from "./file-upload-zone";

interface ComposeToolbarProps {
  onAttach: (files: File[], type: MediaType) => void;
  onSend: () => void;
  sendDisabled?: boolean;
  isNoteMode?: boolean;
  onNoteModeChange?: (note: boolean) => void;
  disabled?: boolean;
}

export function ComposeToolbar({
  onAttach,
  onSend,
  sendDisabled,
  isNoteMode,
  onNoteModeChange,
  disabled,
}: ComposeToolbarProps) {
  const { t } = useTranslation("inbox");

  return (
    <div className="flex shrink-0 items-center gap-1 border-t border-border px-2 py-1">
      <FileUploadZone
        onFilesSelected={onAttach}
        disabled={disabled}
      />
      {onNoteModeChange != null && (
        <Button
          type="button"
          variant={isNoteMode ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onNoteModeChange(!isNoteMode)}
          disabled={disabled}
        >
          {isNoteMode ? t("compose.note") : t("compose.reply")}
        </Button>
      )}
      <div className="flex-1" />
      <Button
        type="button"
        size="icon"
        onClick={onSend}
        disabled={sendDisabled || disabled}
        aria-label={t("compose.send")}
      >
        <Send className="size-5" />
      </Button>
    </div>
  );
}
