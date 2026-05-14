import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, indicatorClassName, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    return (
      <div
        ref={ref}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-zinc-800", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-600 transition-all duration-500",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
