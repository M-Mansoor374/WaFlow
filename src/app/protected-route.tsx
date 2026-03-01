import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";

export function ProtectedRoute() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isLoading) {
    return <LoadingSkeleton variant="fullPage" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
