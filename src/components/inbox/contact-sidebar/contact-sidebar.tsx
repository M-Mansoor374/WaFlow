import { useState } from "react";
import { useInboxStore } from "@/stores/inbox.store";
import { ContactInfo } from "./contact-info";
import { ContactTags } from "./contact-tags";
import { PreviousConversations } from "./previous-conversations";
import { DuplicateWarning } from "@/components/inbox/merge/duplicate-warning";
import { ContactMergeModal } from "@/components/inbox/merge/contact-merge-modal";
import { cn } from "@/lib/utils";

interface ContactSidebarProps {
  className?: string;
}

export function ContactSidebar({ className }: ContactSidebarProps) {
  const activeContact = useInboxStore((s) => s.activeContact);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const setActiveContact = useInboxStore((s) => s.setActiveContact);
  const updateContact = (updates: Partial<NonNullable<typeof activeContact>>) => {
    if (activeContact) {
      setActiveContact({ ...activeContact, ...updates });
    }
  };

  const existingTags = useInboxStore((s) => {
    const tags = new Set<string>();
    s.conversations.forEach((c) => c.labels.forEach((l) => tags.add(l.name)));
    return Array.from(tags);
  });

  return (
    <div className={cn("flex flex-col overflow-hidden", className)}>
      <div className="flex-1 space-y-6 overflow-auto p-4">
        {activeContact?.potentialDuplicates?.length ? (
          <DuplicateWarning onReview={() => setMergeModalOpen(true)} />
        ) : null}
        <ContactInfo contact={activeContact} onUpdate={updateContact} />
        <ContactTags
          contact={activeContact}
          existingTags={existingTags}
          onUpdate={(tags) => activeContact && updateContact({ tags })}
        />
        <PreviousConversations contactId={activeContact?.id ?? null} />
      </div>
      {activeContact?.potentialDuplicates?.[0] && (
        <ContactMergeModal
          contactId={activeContact.id}
          duplicateId={activeContact.potentialDuplicates[0]}
          open={mergeModalOpen}
          onOpenChange={setMergeModalOpen}
          onMerged={() => useInboxStore.getState().setActiveContact(null)}
        />
      )}
    </div>
  );
}
