import { useTranslation } from "react-i18next";

interface TypingIndicatorProps {
  names: string[];
}

export function TypingIndicator({ names }: TypingIndicatorProps) {
  const { t } = useTranslation("inbox");
  if (names.length === 0) return null;
  const text = names.length === 1
    ? t("typing", { name: names[0] })
    : names.join(", ") + " " + t("typing", { name: "" }).replace(" is typing...", " are typing...");
  return (
    <p className="px-3 py-1 text-xs italic text-muted-foreground">{text}</p>
  );
}
