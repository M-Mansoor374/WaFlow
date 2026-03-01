import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InboxTab } from "@/stores/inbox.store";

interface InboxTabsProps {
  value: InboxTab;
  onValueChange: (tab: InboxTab) => void;
}

export function InboxTabs({ value, onValueChange }: InboxTabsProps) {
  const { t } = useTranslation("inbox");

  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as InboxTab)}>
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
        <TabsTrigger value="mine">{t("tabs.mine")}</TabsTrigger>
        <TabsTrigger value="unassigned">{t("tabs.unassigned")}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
