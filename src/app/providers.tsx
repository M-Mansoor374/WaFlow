import { Suspense, useEffect, useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { ErrorBoundary } from "@/components/feedback/error-boundary";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { buildRoutes } from "@/app/router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

function AppLoadingSkeleton() {
  return <LoadingSkeleton variant="fullPage" />;
}

function AppBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().refreshAuth();
    useTenantStore.getState().resolveByHostname(window.location.hostname);
  }, []);

  return <>{children}</>;
}

function RouterGate() {
  const hostnameCheckComplete = useTenantStore((s) => s.hostnameCheckComplete);
  const isCustomDomain = useTenantStore((s) => s.isResolved);

  const router = useMemo(
    () => createBrowserRouter(buildRoutes(isCustomDomain)),
    [isCustomDomain],
  );

  if (!hostnameCheckComplete) {
    return <AppLoadingSkeleton />;
  }

  return <RouterProvider router={router} />;
}

export function Providers() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={<AppLoadingSkeleton />}>
          <TooltipProvider>
            <AppBootstrap>
              <RouterGate />
            </AppBootstrap>
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </Suspense>
      </I18nextProvider>
    </ErrorBoundary>
  );
}
