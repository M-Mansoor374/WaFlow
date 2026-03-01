import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";
import { getMockConversations } from "@/lib/mock-data";

const API_URL = import.meta.env.VITE_API_URL ?? "";

function useDemoStats() {
  if (API_URL) return null;
  const convs = getMockConversations();
  const open = convs.filter((c) => c.status === "open").length;
  const pending = convs.filter((c) => c.status === "pending").length;
  const resolved = convs.filter((c) => c.status === "resolved").length;
  return { total: convs.length, open, pending, resolved };
}

export function Component() {
  const { t } = useTranslation("dashboard");
  const user = useAuthStore((s) => s.user);
  const stats = useDemoStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">
        {t("welcome", { name: user?.name ?? "Demo User" })}
      </p>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-sm font-medium text-muted-foreground">{t("totalConversations")}</span>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.total}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <span className="text-sm font-medium text-muted-foreground">{t("open")}</span>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.open}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <span className="text-sm font-medium text-muted-foreground">{t("pending")}</span>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.pending}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <span className="text-sm font-medium text-muted-foreground">{t("resolved")}</span>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.resolved}</span>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col items-start gap-4 pt-6">
          <p className="text-muted-foreground">{t("viewInbox")}</p>
          <Button asChild>
            <Link to="/chats">
              <MessageCircle className="mr-2 h-4 w-4" />
              {t("openChats")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
