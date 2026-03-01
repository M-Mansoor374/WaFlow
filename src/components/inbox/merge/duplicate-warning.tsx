import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DuplicateWarningProps {
  onReview: () => void;
}

export function DuplicateWarning({ onReview }: DuplicateWarningProps) {
  const { t } = useTranslation("inbox");
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
      <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
        <AlertTriangle className="size-4 shrink-0" />
        <span>{t("merge.duplicateWarning")}</span>
      </div>
      <Button variant="outline" size="sm" onClick={onReview}>
        {t("merge.review")}
      </Button>
    </div>
  );
}
