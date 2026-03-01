import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-muted-foreground">
        {icon ?? <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-medium">
        {title ?? t("empty.title")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {description ?? t("empty.description")}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
