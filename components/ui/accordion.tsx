"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface AccordionContextValue {
  value: string | string[]
  onValueChange: (value: string | string[]) => void
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)

function useAccordion() {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("Accordion components must be used within Accordion")
  }
  return context
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  defaultValue?: string | string[]
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      type = "single",
      value: controlledValue,
      onValueChange,
      defaultValue = type === "single" ? "" : [],
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : internalValue

    const handleValueChange = (newValue: string | string[]) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <AccordionContext.Provider value={{ value, onValueChange: handleValueChange, type }}>
        <div ref={ref} className={cn("w-full", className)} {...props} />
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-b border-zinc-800", className)}
      data-value={value}
      {...props}
    />
  )
)
AccordionItem.displayName = "AccordionItem"

export type AccordionTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    "data-value"?: string
  }

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, ...props }, ref) => {
    const { value: contextValue, onValueChange, type } = useAccordion()
    const itemValue = props["data-value"] ?? ""
    
    let isOpen = false
    if (type === "single") {
      isOpen = contextValue === itemValue
    } else {
      isOpen = (contextValue as string[]).includes(itemValue)
    }

    const handleClick = () => {
      if (type === "single") {
        onValueChange(isOpen ? "" : itemValue)
      } else {
        const newValue = (contextValue as string[]).includes(itemValue)
          ? (contextValue as string[]).filter((v) => v !== itemValue)
          : [...(contextValue as string[]), itemValue]
        onValueChange(newValue)
      }
    }

    return (
      <button
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-left font-semibold text-white hover:text-indigo-400 transition-colors",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span>{props.children}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: contextValue, type } = useAccordion()

    let isOpen = false
    if (type === "single") {
      isOpen = contextValue === value
    } else {
      isOpen = (contextValue as string[]).includes(value)
    }

    return isOpen ? (
      <div ref={ref} className={cn("overflow-hidden pb-4 text-zinc-400", className)} {...props} />
    ) : null
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
