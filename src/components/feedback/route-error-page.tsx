import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

export function RouteErrorPage() {
  const error = useRouteError();
  const is404 =
    isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <AlertTriangle className="h-14 w-14 text-destructive" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {is404 ? "Page not found" : "Something went wrong"}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {is404
            ? "The page you're looking for doesn't exist or has been moved."
            : isRouteErrorResponse(error)
              ? error.error?.message ?? "An unexpected error occurred."
              : error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="default">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Go to home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    </div>
  );
}
