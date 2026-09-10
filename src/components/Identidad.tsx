import { useEffect, useRef, useState, useLayoutEffect } from "react"
import { IconX, IconArrowRight } from "@tabler/icons-react"
import styles from "@/styles/Identidad.module.css"

type IdentidadItem = {
  id: string
  title: string
  body: string
}

const ITEMS: IdentidadItem[] = [
  {
    id: "mision",
    title: "Misión",
    body: "Garantizar la continuidad y eficiencia tecnológica de pequeñas y medianas empresas, instituciones educativas y particulares en Cali, brindando soporte técnico integral, mantenimiento especializado y soluciones digitales con un servicio cercano y responsable.",
  },
  {
    id: "vision",
    title: "Visión",
    body: "Para el año 2030, ser la empresa de tecnología de referencia en Cali, destacada por la calidad de nuestros servicios y por transformar la experiencia técnica de nuestros clientes a través de un seguimiento digital personalizado e innovador.",
  },
  {
    id: "objetivo-general",
    title: "Objetivo General",
    body: "Consolidar a SISTEK PRO como un proveedor confiable de soluciones tecnológicas integrales en la ciudad de Cali, ofreciendo servicios de infraestructura, mantenimiento informático y desarrollo digital que optimicen la productividad y continuidad operativa de pequeñas y medianas empresas, instituciones educativas y particulares.",
  },
  {
    id: "objetivo-1",
    title: "Objetivo Específico 1",
    body: "Alcanzar un índice de resolución del 90% en solicitudes de soporte preventivo y correctivo en un tiempo máximo de 24 horas, durante el primer año de operación.",
  },
  {
    id: "objetivo-2",
    title: "Objetivo Específico 2",
    body: "Implementar un canal de soporte remoto que reduzca el tiempo de respuesta inicial a menos de 2 horas para clientes con contrato de asistencia durante los primeros 6 meses.",
  },
  {
    id: "objetivo-3",
    title: "Objetivo Específico 3",
    body: "Ejecutar la instalación de redes Ethernet y la entrega de al menos 10 proyectos digitales (sitios web o soluciones a medida) en el primer año, garantizando un 95% de conformidad del cliente.",
  },
  {
    id: "objetivo-4",
    title: "Objetivo Específico 4",
    body: "Desplegar el sistema digital de historial de servicios y recomendación para el 100% de la cartera de clientes atendidos, logrando una tasa de satisfacción (NPS) superior al 85% antes de finalizar el año.",
  },
]

export default function Identidad() {
  const [active, setActive] = useState<IdentidadItem | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const [panelOrigin, setPanelOrigin] = useState<{ x: number; y: number } | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const lastTriggerRef = useRef<HTMLElement | null>(null)

  const openFrom = (item: IdentidadItem, rect: DOMRect, trigger: HTMLElement) => {
    lastTriggerRef.current = trigger
    setOriginRect(rect)
    setActive(item)
    setIsClosing(false)
    setPanelOrigin(null)
  }

  const requestClose = () => {
    if (!active || isClosing) return
    setIsClosing(true)
    window.setTimeout(() => {
      setActive(null)
      setIsClosing(false)
      setOriginRect(null)
      setPanelOrigin(null)
      lastTriggerRef.current?.focus()
    }, 200)
  }

  // Calcular origen real dentro del panel para la animación "sale del card"
  useLayoutEffect(() => {
    if (!active || !originRect || !panelRef.current) return
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel || !originRect) return
      const pr = panel.getBoundingClientRect()
      const cx = originRect.left + originRect.width / 2
      const cy = originRect.top + originRect.height / 2
      const ox = cx - pr.left
      const oy = cy - pr.top
      // clamp dentro del panel
      const clampedX = Math.max(0, Math.min(pr.width, ox))
      const clampedY = Math.max(0, Math.min(pr.height, oy))
      setPanelOrigin({ x: clampedX, y: clampedY })
    })
    return () => cancelAnimationFrame(raf)
  }, [active, originRect])

  // focus, esc, bloqueo scroll
  useEffect(() => {
    if (!active) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose()
    }
    document.addEventListener("keydown", handleKey)

    // bloquear scroll
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // focus al botón cerrar
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 30)

    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
    }
  }, [active])

  return (
    <section id="identidad" className={styles.identidad} aria-labelledby="identidad-heading">
      <div className={styles.identidadInner}>
        <div className={styles.identidadHeader}>
          <h2 id="identidad-heading" className={styles.identidadTitle}>
            Identidad
          </h2>
        </div>

        <div className={styles.identidadGrid} role="list">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              className={styles.identidadCard}
              aria-haspopup="dialog"
              aria-expanded={active?.id === item.id}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                openFrom(item, rect, e.currentTarget)
              }}
            >
              <span className={styles.identidadCardTitle}>{item.title}</span>
              <span className={styles.identidadCardArrow} aria-hidden="true">
                <IconArrowRight />
              </span>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          className={`${styles.identidadOverlay} ${isClosing ? styles.identidadOverlayClosing : ""}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) requestClose()
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="identidad-modal-title"
            className={`${styles.identidadPanel} ${isClosing ? styles.identidadPanelClosing : ""}`}
            style={
              panelOrigin
                ? ({ ["--ox" as string]: `${panelOrigin.x}px`, ["--oy" as string]: `${panelOrigin.y}px` } as React.CSSProperties)
                : undefined
            }
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.identidadPanelHeader}>
              <h3 id="identidad-modal-title" className={styles.identidadPanelTitle}>
                {active.title}
              </h3>
              <button
                ref={closeBtnRef}
                type="button"
                className={styles.identidadClose}
                aria-label="Cerrar"
                onClick={requestClose}
              >
                <IconX aria-hidden="true" />
              </button>
            </div>
            <p className={styles.identidadPanelBody}>{active.body}</p>
          </div>
        </div>
      )}
    </section>
  )
}
