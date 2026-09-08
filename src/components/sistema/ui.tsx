import React, { useEffect, useId } from "react"
import { IconX } from "@tabler/icons-react"
import styles from "@/styles/SistemaUI.module.css"

export function Spinner({ label }: { label?: string }) {
  return (
    <div className={styles['sys-loading']}>
      <span className={styles['sys-spinner']} />
      {label && <span>{label}</span>}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
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
    <div className={styles['sys-modal-overlay']} onMouseDown={onClose}>
      <div
        className={`${styles['sys-modal']} ${size === "lg" ? styles['sys-modal--lg'] : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles['sys-modal-head']}>
          <h3 id={titleId}>{title}</h3>
          <button type="button" className={styles['sys-icon-btn']} onClick={onClose} aria-label="Cerrar">
            <IconX size={18} />
          </button>
        </div>
        <div className={styles['sys-modal-body']}>{children}</div>
      </div>
    </div>
  )
}

interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "md" | "lg"
}

export function Drawer({ open, title, onClose, children, footer, size = "md" }: DrawerProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`${styles['sys-drawer-overlay']} ${open ? styles['is-open'] : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles['sys-drawer']} ${open ? styles['is-open'] : ""} ${styles['sys-drawer']}--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles['sys-drawer-head']}>
          <h2 id={titleId}>{title}</h2>
          <button type="button" className={styles['sys-icon-btn']} onClick={onClose} aria-label="Cerrar">
            <IconX size={18} />
          </button>
        </header>
        <div className={styles['sys-drawer-body']}>{children}</div>
        {footer && <footer className={styles['sys-drawer-foot']}>{footer}</footer>}
      </aside>
    </>
  )
}

interface FormPanelProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Panel de formulario en sesión (no es un modal). Ocupa el área de contenido
 * como si fuera una página propia, con su botón de "Salir" para volver atrás.
 */
export function FormPanel({ title, subtitle, onClose, children, footer }: FormPanelProps) {
  return (
    <section className={styles['sys-panel']} aria-label={title}>
      <header className={styles['sys-panel-head']}>
        <div className={styles['sys-panel-heading']}>
          <p className={styles['sys-topbar-eyebrow']}>Formulario</p>
          <h2 className={styles['sys-panel-title']}>{title}</h2>
          {subtitle && <p className={styles['sys-panel-sub']}>{subtitle}</p>}
        </div>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={onClose}>
          <IconX size={16} aria-hidden="true" />
          Salir
        </button>
      </header>
      <div className={styles['sys-panel-body']}>{children}</div>
      {footer && <footer className={styles['sys-panel-foot']}>{footer}</footer>}
    </section>
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
      <p className={styles['sys-confirm-message']}>{message}</p>
      <div className={styles['sys-form-actions']}>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--danger']}`} onClick={onConfirm} disabled={loading}>
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
