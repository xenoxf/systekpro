import React from "react"
import styles from "@/styles/SistemaUI.module.css"

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className={styles['sys-empty']}>
      {icon && (
        <div className={styles['sys-empty-icon']} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={styles['sys-empty-title']}>{title}</p>
      {description && <p className={styles['sys-empty-desc']}>{description}</p>}
      {action && <div className={styles['sys-empty-action']}>{action}</div>}
    </div>
  )
}
