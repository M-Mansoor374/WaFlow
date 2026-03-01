import * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<"input"> & { type?: "checkbox" }) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "border-input size-4 rounded border shadow-xs transition-[color,box-shadow] outline-none accent-primary disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-offset-2",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Checkbox }
