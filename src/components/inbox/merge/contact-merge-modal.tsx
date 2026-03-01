import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import type { Contact } from "@/types/contact";

interface ContactMergeModalProps {
  contactId: string;
  duplicateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMerged?: () => void;
}

type Step = 1 | 2 | 3 | 4;

export function ContactMergeModal({
  contactId,
  duplicateId,
  open,
  onOpenChange,
  onMerged,
}: ContactMergeModalProps) {
  const { t } = useTranslation("inbox");
  const [step, setStep] = useState<Step>(1);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [duplicate, setDuplicate] = useState<Contact | null>(null);

  useEffect(() => {
    if (!open || !contactId || !duplicateId) return;
    setStep(1);
    setPrimaryId(null);
    Promise.all([
      apiClient<Contact>(`/contacts/${contactId}`),
      apiClient<Contact>(`/contacts/${duplicateId}`),
    ])
      .then(([c, d]) => {
        setContact(c);
        setDuplicate(d);
      })
      .catch(() => {
        onOpenChange(false);
      });
  }, [open, contactId, duplicateId, onOpenChange]);

  const handleConfirm = async () => {
    if (!primaryId) return;
    try {
      await apiClient("/contacts/merge", {
        method: "POST",
        body: JSON.stringify({ primaryContactId: primaryId, duplicateContactId: primaryId === contactId ? duplicateId : contactId }),
      });
      onMerged?.();
      onOpenChange(false);
    } catch {
      // error
    }
  };

  if (!contact || !duplicate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("merge.mergeContacts")}</DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded border p-3">
              <p className="font-medium">{contact.name}</p>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
              {contact.email && <p className="text-sm">{contact.email}</p>}
            </div>
            <div className="rounded border p-3">
              <p className="font-medium">{duplicate.name}</p>
              <p className="text-sm text-muted-foreground">{duplicate.phone}</p>
              {duplicate.email && <p className="text-sm">{duplicate.email}</p>}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("merge.primaryContact")}</p>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="primary"
                checked={primaryId === contact.id}
                onChange={() => setPrimaryId(contact.id)}
              />
              {contact.name} ({contact.phone})
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="primary"
                checked={primaryId === duplicate.id}
                onChange={() => setPrimaryId(duplicate.id)}
              />
              {duplicate.name} ({duplicate.phone})
            </label>
          </div>
        )}
        {step === 3 && (
          <p className="text-sm text-muted-foreground">{t("merge.preview")}</p>
        )}
        {step === 4 && (
          <p className="text-sm">Confirm merge?</p>
        )}
        <DialogFooter>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => (s + 1) as Step)}>
              {t("common:next")}
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={!primaryId}>
              {t("common:confirm")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
