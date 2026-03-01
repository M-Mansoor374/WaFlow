import { Navigate, type RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/app/protected-route";
import { AppShell } from "@/components/layout/app-shell";

export function buildRoutes(isCustomDomain: boolean): RouteObject[] {
  const appRoutes: RouteObject[] = [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: "dashboard", lazy: () => import("@/pages/dashboard") },
    { path: "chats", lazy: () => import("@/pages/chats") },
    { path: "chats/:conversationId", lazy: () => import("@/pages/chats") },
    { path: "contacts", lazy: () => import("@/pages/contacts") },
    { path: "settings", lazy: () => import("@/pages/settings") },
    { path: "quick-replies", lazy: () => import("@/pages/quick-replies") },
  ];

  return [
    { path: "/login", lazy: () => import("@/pages/login") },
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: isCustomDomain ? "/" : "/:tenantSlug",
          element: <AppShell />,
          children: appRoutes,
        },
      ],
    },
  ];
}
