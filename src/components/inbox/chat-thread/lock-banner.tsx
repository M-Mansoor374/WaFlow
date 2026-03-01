import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface LockBannerProps {
  agentName: string;
  onReplyAnyway?: (reason: string) => void;
}

export function LockBanner({ agentName, onReplyAnyway }: LockBannerProps) {
  const { t } = useTranslation("inbox");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onReplyAnyway?.(reason.trim());
      setOpen(false);
      setReason("");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{t("lock.banner", { name: agentName })}</span>
        </div>
        {onReplyAnyway && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            {t("lock.replyAnyway")}
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("lock.replyAnyway")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("lock.overrideReason")}</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("lock.overrideReason")}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common:cancel")}
            </Button>
            <Button onClick={handleConfirm} disabled={!reason.trim()}>
              {t("lock.overrideConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
