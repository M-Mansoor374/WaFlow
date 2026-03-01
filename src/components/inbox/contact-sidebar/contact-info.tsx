import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { formatPhone } from "@/lib/format";
import type { Contact } from "@/types/contact";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ContactInfoProps {
  contact: Contact | null;
  onUpdate?: (updates: Partial<Contact>) => void;
}

export function ContactInfo({ contact, onUpdate }: ContactInfoProps) {
  const { t } = useTranslation("inbox");
  const [editing, setEditing] = useState<keyof Contact | null>(null);
  const [value, setValue] = useState("");

  const startEdit = useCallback((field: keyof Contact) => {
    setEditing(field);
    const v = contact?.[field];
    setValue(typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : "");
  }, [contact]);

  const saveEdit = useCallback(async () => {
    if (!contact || editing == null) {
      setEditing(null);
      return;
    }
    const field = editing;
    const prev = contact[field];
    const next = typeof prev === "string" ? value : value.split(",").map((s) => s.trim()).filter(Boolean);
    setEditing(null);
    if (next === prev) return;
    try {
      await apiClient(`/contacts/${contact.id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: next }),
      });
      onUpdate?.({ [field]: next } as Partial<Contact>);
    } catch {
      // revert on error
    }
  }, [contact, editing, value, onUpdate]);

  if (!contact) {
    return (
      <p className="text-sm text-muted-foreground">{t("empty.selectConversation")}</p>
    );
  }

  const fields: { key: keyof Contact; label: string; value: string }[] = [
    { key: "name", label: t("contact.name"), value: contact.name },
    { key: "phone", label: t("contact.phone"), value: formatPhone(contact.phone) },
    { key: "email", label: t("contact.email"), value: contact.email ?? "" },
    { key: "company", label: t("contact.company"), value: contact.company ?? "" },
    { key: "language", label: t("contact.language"), value: contact.language ?? "" },
  ];

  return (
    <div className="space-y-3">
      {fields.map(({ key, label, value: displayValue }) => (
        <div key={String(key)}>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {editing === key ? (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") setEditing(null);
              }}
              className="mt-0.5 h-8"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => startEdit(key)}
              className={cn(
                "mt-0.5 block w-full rounded border border-transparent px-2 py-1.5 text-start text-sm hover:bg-muted/50",
                !displayValue && "text-muted-foreground",
              )}
            >
              {displayValue || "—"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
