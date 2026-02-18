import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

const badgeVariantClassName = {
  default: "border-slate-200 bg-slate-100 text-slate-700",
  draft: "border-amber-200 bg-amber-100 text-amber-700",
  published: "border-emerald-200 bg-emerald-100 text-emerald-700",
} as const

type BadgeVariant = keyof typeof badgeVariantClassName

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        badgeVariantClassName[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
