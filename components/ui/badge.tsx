import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-[var(--surface-soft)] text-[var(--foreground)] border-[color:var(--border)]",
  primary: "bg-indigo-600/10 text-indigo-500 border-indigo-500/20",
  success: "bg-green-600/10 text-green-500 border-green-500/20",
  destructive: "bg-red-600/10 text-red-500 border-red-500/20",
  warning: "bg-yellow-600/10 text-yellow-500 border-yellow-500/20",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
