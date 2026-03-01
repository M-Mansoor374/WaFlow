import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { useWsStore } from "@/stores/ws.store";
import { useUiStore } from "@/stores/ui.store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const isResolved = useTenantStore((s) => s.isResolved);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  useEffect(() => {
    if (tenantSlug) {
      useTenantStore.getState().resolveBySlug(tenantSlug);
    }
  }, [tenantSlug]);

  // WebSocket lifecycle — connect when auth + tenant ready, disconnect on unmount
  useEffect(() => {
    if (isAuthenticated && isResolved) {
      useWsStore.getState().connect();
    }
    return () => useWsStore.getState().disconnect();
    // Note: React StrictMode in dev will fire mount->unmount->mount, causing
    // connect->disconnect->connect. This is expected dev-only behavior, not a bug.
  }, [isAuthenticated, isResolved]);

  if (!isResolved) {
    return <LoadingSkeleton variant="fullPage" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-e border-border bg-sidebar transition-all duration-200 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
