"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined)

function useTooltip() {
  const context = React.useContext(TooltipContext)
  if (!context) {
    throw new Error("Tooltip components must be used within Tooltip")
  }
  return context
}

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, defaultOpen = false, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen)

    return (
      <TooltipContext.Provider value={{ open, setOpen }}>
        <div ref={ref} className={cn("relative", className)} {...props} />
      </TooltipContext.Provider>
    )
  }
)
Tooltip.displayName = "Tooltip"

export type TooltipTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const { setOpen } = useTooltip()

    return (
      <button
        ref={ref}
        className={cn("inline-flex items-center justify-center", className)}
        onMouseEnter={(e) => {
          setOpen(true)
          onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          setOpen(false)
          onMouseLeave?.(e)
        }}
        {...props}
      />
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

export type TooltipContentProps = React.HTMLAttributes<HTMLDivElement>

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, ...props }, ref) => {
    const { open } = useTooltip()

    return open ? (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)]",
          className
        )}
        {...props}
      />
    ) : null
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent }
