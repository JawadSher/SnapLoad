"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, ...props }, ref) => (
    <div className="relative w-full">
      {label && <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-11 w-full appearance-none rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 pr-10 text-base text-[var(--foreground)] shadow-sm placeholder:text-zinc-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-zinc-500" />
      </div>
    </div>
  )
)
Select.displayName = "Select"

export type SelectOptionProps = React.OptionHTMLAttributes<HTMLOptionElement>

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  (props, ref) => <option ref={ref} {...props} />
)
SelectOption.displayName = "SelectOption"

export { Select, SelectOption }
