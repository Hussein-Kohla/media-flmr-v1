import * as React from "react"
import { Button } from "./button"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

const EmptyState = ({ title, description, actionLabel, onAction, icon, className }: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto", className)}>
      {icon && (
        <div className="mb-6 text-[var(--color-ink-tertiary)]">
          {icon}
        </div>
      )}
      <h2 className="text-4xl font-bold text-[var(--color-ink-primary)] font-display leading-tight mb-4">
        {title}
      </h2>
      <p className="text-[var(--color-ink-secondary)] mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
