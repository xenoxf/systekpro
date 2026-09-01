import React from "react"

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="sys-empty">
      {icon && (
        <div className="sys-empty-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="sys-empty-title">{title}</p>
      {description && <p className="sys-empty-desc">{description}</p>}
      {action && <div className="sys-empty-action">{action}</div>}
    </div>
  )
}
