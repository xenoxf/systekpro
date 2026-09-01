import React from "react"

export interface SpinnerProps {
  label?: string
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <div className="sys-loading">
      <span className="sys-spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  )
}
