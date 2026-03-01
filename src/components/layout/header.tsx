import { useTranslation } from "react-i18next";
import { Menu, Bell, Globe, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useTenantStore } from "@/stores/tenant.store";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
  { code: "ar", label: "العربية" },
] as const;

export function Header() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const logoUrl = useTenantStore((s) => s.logoUrl);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-3 md:px-6">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Tenant logo */}
      {logoUrl && (
        <img src={logoUrl} alt="" className="h-8 w-auto hidden md:block" />
      )}

      <div className="flex-1" />

      {/* Language switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {LANGUAGES.map(({ code, label }) => (
            <DropdownMenuItem
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className={i18n.language === code ? "bg-accent" : ""}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -end-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm truncate max-w-[120px]">
              {user?.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled className="text-muted-foreground text-xs">
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="h-4 w-4 me-2" />
            {t("nav.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
