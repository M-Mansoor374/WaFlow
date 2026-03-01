import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MediaPreviewItem {
  file: File;
  url?: string;
  progress?: number;
  error?: string;
}

interface MediaPreviewProps {
  items: MediaPreviewItem[];
  onRemove: (index: number) => void;
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPreview({ items, onRemove, className }: MediaPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 border-t border-border p-2", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="relative flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-2"
        >
          {item.url ? (
            <img
              src={item.url}
              alt=""
              className="size-12 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded bg-muted text-xs">
              File
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.error ?? formatSize(item.file.size)}
            </p>
            {item.progress !== undefined && item.progress < 100 && (
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(index)}
            aria-label="Remove"
          >
            <X className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
