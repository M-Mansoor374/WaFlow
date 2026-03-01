import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { Contact } from "@/types/contact";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { X } from "lucide-react";

interface ContactTagsProps {
  contact: Contact | null;
  existingTags: string[];
  onUpdate?: (tags: string[]) => void;
}

export function ContactTags({ contact, existingTags, onUpdate }: ContactTagsProps) {
  const { t } = useTranslation("inbox");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const tags = contact?.tags ?? [];

  const addTag = useCallback(
    async (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (!trimmed || !contact || tags.includes(trimmed)) return;
      try {
        await apiClient(`/contacts/${contact.id}/tags`, {
          method: "POST",
          body: JSON.stringify({ tag: trimmed }),
        });
        onUpdate?.([...tags, trimmed]);
      } catch {
        // ignore
      }
      setInput("");
      setSuggestions([]);
    },
    [contact, tags, onUpdate],
  );

  const removeTag = useCallback(
    async (tag: string) => {
      if (!contact) return;
      try {
        await apiClient(`/contacts/${contact.id}/tags/${encodeURIComponent(tag)}`, {
          method: "DELETE",
        });
        onUpdate?.(tags.filter((t) => t !== tag));
      } catch {
        // ignore
      }
    },
    [contact, tags, onUpdate],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInput(v);
      if (!v.trim()) {
        setSuggestions([]);
        return;
      }
      const match = v.toLowerCase();
      const filtered = existingTags.filter(
        (tag) => tag.toLowerCase().includes(match) && !tags.includes(tag),
      );
      setSuggestions(filtered.slice(0, 5));
    },
    [existingTags, tags],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{t("contact.tags")}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full hover:bg-primary/20"
              aria-label="Remove tag"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <Input
          value={input}
          onChange={onInputChange}
          placeholder={t("contact.addTag")}
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions.length > 0) addTag(suggestions[0]);
              else addTag(input);
            }
          }}
        />
        {suggestions.length > 0 && (
          <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-md">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => addTag(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
