import { Navigate, type RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/app/protected-route";
import { AppShell } from "@/components/layout/app-shell";

const appRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", lazy: () => import("@/pages/dashboard") },
  { path: "chats", lazy: () => import("@/pages/chats") },
  { path: "chats/:conversationId", lazy: () => import("@/pages/chats") },
  { path: "contacts", lazy: () => import("@/pages/contacts") },
  { path: "settings", lazy: () => import("@/pages/settings") },
  { path: "quick-replies", lazy: () => import("@/pages/quick-replies") },
  { path: "demo", lazy: () => import("@/pages/demo-inbox") },
];

function appShellRoute(path: string): RouteObject {
  return {
    path,
    element: <AppShell />,
    children: appRoutes,
  };
}

export function buildRoutes(isCustomDomain: boolean): RouteObject[] {
  const protectedChildren: RouteObject[] = isCustomDomain
    ? [appShellRoute("/")]
    : [
        appShellRoute("/"), // match root so localhost/ works (e.g. Loom demo)
        appShellRoute("/:tenantSlug"), // match /demo, /acme, etc.
      ];

  return [
    { path: "/login", lazy: () => import("@/pages/login") },
    {
      element: <ProtectedRoute />,
      children: protectedChildren,
    },
  ];
}
