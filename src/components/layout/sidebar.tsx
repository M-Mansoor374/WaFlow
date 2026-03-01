import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUiStore } from "@/stores/ui.store";
import { useTenantStore } from "@/stores/tenant.store";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
}

const NAV_ITEMS = [
  { key: "dashboard", icon: LayoutDashboard, path: "dashboard" },
  { key: "chats", icon: MessageCircle, path: "chats" },
  { key: "contacts", icon: Users, path: "contacts" },
  { key: "settings", icon: Settings, path: "settings" },
] as const;

export function Sidebar({ collapsed }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const tenantName = useTenantStore((s) => s.tenantName);

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Tenant */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        {!collapsed && (
          <span className="truncate text-sm font-semibold">
            {tenantName ?? "WaFlow"}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, icon: Icon, path }) => {
            const isActive = location.pathname.includes(`/${path}`);
            return (
              <Button
                key={key}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "justify-start gap-3",
                  collapsed && "justify-center px-2",
                )}
                onClick={() => navigate(path)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate">
                    {t(`nav.${key}`)}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Collapse toggle — desktop only */}
      <div className="hidden md:flex items-center justify-center p-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
