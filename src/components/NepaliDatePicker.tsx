"use client"

import React from "react"
import DatePickerNP from "date-picker-np"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface NepaliDatePickerProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    containerClassName?: string
}

export function NepaliDatePicker({
    value,
    onChange,
    placeholder = "Select Date (BS)",
    className,
    containerClassName
}: NepaliDatePickerProps) {
    return (
        <div className={cn("relative group w-full", containerClassName)}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10">
                <Calendar className="h-4 w-4" />
            </div>
            <DatePickerNP
                value={value}
                onChange={(val) => onChange(val || "")}
                inputContainerStyles={{
                    paddingLeft: "2.5rem",
                    height: 44, // Using number instead of string to fix library type error
                    width: "100%",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                } as any}
            />
            {/* 
        The date-picker-np library might use internal styles that we need to override via CSS globals if needed,
        but for now, we'll use inputContainerStyles. If dark mode text is still an issue, we can inject a style tag here.
      */}
            <style jsx global>{`
        /* Overriding date-picker-np internal styles for dark mode if they use hardcoded colors */
        .ndp-main-container {
          background-color: hsl(var(--background)) !important;
          border-color: hsl(var(--border)) !important;
          color: hsl(var(--foreground)) !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
          border-radius: 0.75rem !important;
        }
        .ndp-header {
          background-color: hsl(var(--muted)) !important;
          color: hsl(var(--foreground)) !important;
        }
        .ndp-date {
          color: hsl(var(--foreground)) !important;
        }
        .ndp-date:hover {
          background-color: hsl(var(--accent)) !important;
        }
        .ndp-selected-date {
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }
        .ndp-current-date {
          border-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary)) !important;
        }
        .ndp-day-name {
          color: hsl(var(--muted-foreground)) !important;
        }
        .ndp-month-select, .ndp-year-select {
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border)) !important;
        }
      `}</style>
        </div>
    )
}
