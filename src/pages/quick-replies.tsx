import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api";

interface QuickReply {
  id: string;
  title: string;
  body: string;
  scope: "account" | "personal";
  usageCount: number;
}

export function Component() {
  const { t } = useTranslation(["inbox", "common"]);
  const [list, setList] = useState<QuickReply[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuickReply | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scope, setScope] = useState<"account" | "personal">("account");

  const load = () => {
    apiClient<QuickReply[]>("/quick-replies")
      .then(setList)
      .catch(() => setList([]));
  };

  useEffect(() => load(), []);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setBody("");
    setScope("account");
    setOpen(true);
  };

  const openEdit = (q: QuickReply) => {
    setEditing(q);
    setTitle(q.title);
    setBody(q.body);
    setScope(q.scope);
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await apiClient(`/quick-replies/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ title, body, scope }),
        });
      } else {
        await apiClient("/quick-replies", {
          method: "POST",
          body: JSON.stringify({ title, body, scope }),
        });
      }
      setOpen(false);
      load();
    } catch {
      // error
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t("common:confirm"))) return;
    try {
      await apiClient(`/quick-replies/${id}`, { method: "DELETE" });
      load();
    } catch {
      // error
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("quickReplies.title")}</h1>
        <Button onClick={openCreate}>{t("quickReplies.create")}</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Body</TableHead>
              <TableHead>{t("quickReplies.scope")}</TableHead>
              <TableHead>{t("quickReplies.usageCount")}</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.title}</TableCell>
                <TableCell className="max-w-[200px] truncate">{q.body}</TableCell>
                <TableCell>{q.scope}</TableCell>
                <TableCell>{q.usageCount ?? 0}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(q)}>
                    {t("common:edit")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(q.id)}>
                    {t("common:delete")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("common:edit") : t("quickReplies.create")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Body (use {"{{variable}}"} for placeholders)</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 min-h-[100px]" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("quickReplies.scope")}</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as "account" | "personal")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="account">{t("quickReplies.account")}</option>
                <option value="personal">{t("quickReplies.personal")}</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common:cancel")}
            </Button>
            <Button onClick={save} disabled={!title.trim() || !body.trim()}>
              {t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
