import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- StatusBadge ---
type StatusBadgeProps = {
  variant: 'success' | 'warning' | 'danger' | 'info'
  children: React.ReactNode
}

const StatusBadge = ({ variant, children }: StatusBadgeProps) => {
  const variantStyles = {
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
    info: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variantStyles[variant]
    )}>
      {children}
    </span>
  )
}

// --- DataTable ---
interface DataTableProps<T> {
  columns: { header: string; accessor: keyof T | ((item: T) => React.ReactNode) }[]
  data: T[]
  className?: string
}

const DataTable = <T extends { id: string | number }>({ columns, data, className }: DataTableProps<T>) => {
  return (
    <div className={cn("w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-sm font-bold text-[var(--color-ink-primary)] uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id} 
              className={cn(
                "border-b border-[var(--color-border)] last:border-0 transition-colors",
                rowIndex % 2 === 0 ? "bg-[var(--color-surface-0)]" : "bg-[var(--color-surface-1)]/50",
                "hover:bg-[var(--color-surface-2)]"
              )}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm text-[var(--color-ink-secondary)]">
                  {typeof col.accessor === 'function' 
                    ? col.accessor(row) 
                    : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- ProgressBar ---
interface ProgressBarProps {
  progress: number // 0 to 100
  className?: string
}

const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  return (
    <div className={cn("w-full h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden", className)}>
      <div 
        className="h-full bg-[var(--color-brand)] transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}

// --- ClientAvatar ---
interface ClientAvatarProps {
  client?: { name?: string; color?: string; avatar?: string; [key: string]: any };
  size?: number; // Tailwind typical sizing, 6 = 24px (1.5rem), 8 = 32px (2rem), 10 = 40px (2.5rem)
  className?: string;
}

const ClientAvatar = ({ client, size = 8, className }: ClientAvatarProps) => {
  if (!client) return null;
  const dimensionStr = `${size * 4}px`;
  
  if (client.avatar) {
    return (
      <div 
        className={cn("rounded-[calc(var(--radius-md)+2px)] flex-shrink-0 border border-[var(--color-border)] overflow-hidden bg-muted", className)}
        style={{ width: dimensionStr, height: dimensionStr }}
      >
        <img src={client.avatar} alt={client.name || "Client"} className="w-full h-full object-cover" />
      </div>
    );
  }

  const colors = ["#8b5cf6", "#38bdf8", "#34d399", "#fb7185", "#fbbf24"];
  const color = client.color || colors[(client.name?.length || 0) % colors.length];
  const initials = (client.name || "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().substring(0, 2);

  return (
    <div className={cn("rounded-[calc(var(--radius-md)+2px)] flex items-center justify-center font-bold flex-shrink-0 border flex-col border-[var(--color-border)]", className)}
      style={{ 
        width: dimensionStr, 
        height: dimensionStr, 
        fontSize: `${Math.max(10, size * 1.5)}px`, 
        backgroundColor: `${color}15`, 
        color: color 
      }}>
      {initials}
    </div>
  );
}

export { StatusBadge, DataTable, ProgressBar, ClientAvatar }
