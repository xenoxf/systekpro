import React, { useId } from "react"
import { IconX } from "@tabler/icons-react"

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="sys-loading">
      <span className="sys-spinner" />
      {label && <span>{label}</span>}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="sys-empty">
      <p className="sys-empty-title">{title}</p>
      {description && <p className="sys-empty-desc">{description}</p>}
    </div>
  )
}

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: "md" | "lg"
}

export function Modal({ open, title, onClose, children, size = "md" }: ModalProps) {
  const titleId = useId()
  if (!open) return null
  return (
    <div className="sys-modal-overlay" onMouseDown={onClose}>
      <div
        className={`sys-modal ${size === "lg" ? "sys-modal--lg" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sys-modal-head">
          <h3 id={titleId}>{title}</h3>
          <button type="button" className="sys-icon-btn" onClick={onClose} aria-label="Cerrar">
            <IconX size={18} />
          </button>
        </div>
        <div className="sys-modal-body">{children}</div>
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="sys-confirm-message">{message}</p>
      <div className="sys-form-actions">
        <button type="button" className="sys-btn sys-btn--ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className="sys-btn sys-btn--danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Procesando..." : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function formatDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })
}
