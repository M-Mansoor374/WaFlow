import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { useInboxStore } from "@/stores/inbox.store";

export function FilterChips() {
  const { t } = useTranslation("inbox");
  const filters = useInboxStore((s) => s.filters);
  const setFilters = useInboxStore((s) => s.setFilters);

  const chips: { key: string; label: string }[] = [];
  filters.status?.forEach((s) => chips.push({ key: `status:${s}`, label: t(`status.${s}`) }));
  filters.labelIds?.forEach((id) => chips.push({ key: `label:${id}`, label: `Label ${id}` }));
  if (filters.assignedTo === "unassigned") chips.push({ key: "assignee:unassigned", label: t("filters.unassigned") });
  if (filters.assignedTo && filters.assignedTo !== "unassigned") chips.push({ key: `assignee:${filters.assignedTo}`, label: filters.assignedTo });
  if (filters.whatsappNumberId) chips.push({ key: `num:${filters.whatsappNumberId}`, label: filters.whatsappNumberId });

  if (chips.length === 0) return null;

  const remove = (key: string) => {
    const [type, value] = key.split(":");
    if (type === "status") {
      const next = filters.status?.filter((s) => s !== value) ?? [];
      setFilters({ ...filters, status: next.length ? next : undefined });
    } else if (type === "label") {
      const next = filters.labelIds?.filter((id) => id !== value) ?? [];
      setFilters({ ...filters, labelIds: next.length ? next : undefined });
    } else if (type === "assignee") {
      setFilters({ ...filters, assignedTo: undefined });
    } else if (type === "num") {
      setFilters({ ...filters, whatsappNumberId: undefined });
    }
  };

  return (
    <div className="flex flex-wrap gap-1 px-2 pb-2">
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs"
        >
          {c.label}
          <button type="button" onClick={() => remove(c.key)} aria-label="Remove">
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
