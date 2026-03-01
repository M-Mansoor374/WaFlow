import { Skeleton } from "@/components/ui/skeleton";

type SkeletonVariant = "card" | "list" | "table" | "chat" | "profile" | "fullPage";

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex items-start gap-3 py-2">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-16 w-48 rounded-lg" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

function FullPageSkeleton() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-64 flex-col border-e border-border p-4 gap-4">
        <Skeleton className="h-8 w-full" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div className="h-14 border-b border-border flex items-center px-4 gap-3">
          <Skeleton className="h-8 w-8 md:hidden" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-24" />
        </div>
        {/* Content skeleton */}
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const VARIANT_MAP: Record<SkeletonVariant, React.FC> = {
  card: CardSkeleton,
  list: ListSkeleton,
  table: TableSkeleton,
  chat: ChatSkeleton,
  profile: ProfileSkeleton,
  fullPage: FullPageSkeleton,
};

export function LoadingSkeleton({
  variant = "card",
  count = 1,
}: LoadingSkeletonProps) {
  const SkeletonComponent = VARIANT_MAP[variant];

  if (variant === "fullPage") {
    return <FullPageSkeleton />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}
