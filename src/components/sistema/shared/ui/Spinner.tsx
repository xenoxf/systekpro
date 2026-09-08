import React from "react"
import styles from "@/styles/SistemaUI.module.css"

export interface SpinnerProps {
  label?: string
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <div className={styles['sys-loading']}>
      <span className={styles['sys-spinner']} aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  )
}
