import { useTranslation } from "react-i18next";
import type { Message } from "@/types/message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NoteMessageProps {
  message: Message;
}

export function NoteMessage({ message }: NoteMessageProps) {
  const { t } = useTranslation("inbox");
  const name = message.sender?.name ?? "Agent";

  return (
    <div className="rounded-lg bg-amber-500/20 dark:bg-amber-600/20 border border-amber-500/30 p-2">
      <p className="mb-1 text-xs font-medium text-amber-800 dark:text-amber-200">
        {t("notes.internalNote")}
      </p>
      <div className="flex gap-2">
        <Avatar size="sm" className="size-6 shrink-0">
          <AvatarImage src={message.sender?.avatarUrl} />
          <AvatarFallback className="text-[10px]">{name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-100">{name}</p>
          <p className="whitespace-pre-wrap break-words text-sm">{message.body ?? ""}</p>
        </div>
      </div>
    </div>
  );
}
