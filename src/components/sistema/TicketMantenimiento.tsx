import React from "react"
import { QRCodeSVG } from "qrcode.react"
import { IconPrinter } from "@tabler/icons-react"
import { type SeguimientoPublico, estadoLabel } from "@/services/ordenes"
import { formatDate } from "./ui"
import styles from "@/styles/TicketMantenimiento.module.css"

function estadoClase(estado: string): string {
  const map: Record<string, string> = {
    recibido: styles['ticket-estado--info'],
    diagnostico: styles['ticket-estado--info'],
    reparacion: styles['ticket-estado--warn'],
    esperando_repuestos: styles['ticket-estado--warn'],
    terminado: styles['ticket-estado--ok'],
    entregado: styles['ticket-estado--ok'],
    cancelado: styles['ticket-estado--off'],
  }
  return map[estado] ?? styles['ticket-estado--info']
}

export default function TicketMantenimiento({
  seguimiento,
}: {
  seguimiento: SeguimientoPublico
}) {
  return (
    <div className={styles['ticket-wrap']}>

      <div className={styles['ticket-sheet']}>
        <header className={styles['ticket-head']}>
          <div>
            <a href="/" aria-label="Sistek - Inicio">
              <img src="/logo.png" alt="Sistek logo" className="logo-light"  style={{maxHeight:'3.5rem', width:'auto', objectFit:'contain'}} />
              <img src="/logo_white.png" alt="Sistek logo" className="logo-dark"  style={{maxHeight:'3.5rem', width:'auto', objectFit:'contain'}} />
            </a>
            <span className={styles['ticket-brand-sub']}>Seguimiento de mantenimiento</span>
          </div>
          <span className={`${styles['ticket-estado']} ${estadoClase(seguimiento.estado)}`}>
            {estadoLabel(seguimiento.estado)}
          </span>
        </header>

        <div className={styles['ticket-meta']}>
          <div>
            <span className={styles['ticket-label']}>Código</span>
            <strong className={styles['ticket-codigo']}>{seguimiento.codigo}</strong>
          </div>
          <div>
            <span className={styles['ticket-label']}>Ingreso</span>
            <span>{formatDate(seguimiento.fechaIngreso)}</span>
          </div>
          <div>
            <span className={styles['ticket-label']}>Entrega estimada</span>
            <span>{formatDate(seguimiento.fechaEntregaEstimada)}</span>
          </div>
        </div>

        <div className={styles['ticket-block']}>
          <span className={styles['ticket-label']}>Cliente(s)</span>
          <p className={styles['ticket-clientes']}>{seguimiento.clientes.join(", ") || "—"}</p>
        </div>

        <div className={styles['ticket-block']}>
          <span className={styles['ticket-label']}>Equipos en esta orden</span>
          <table className={styles['ticket-equipos']}>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Marca / Modelo</th>
                <th>Serial</th>
              </tr>
            </thead>
            <tbody>
              {seguimiento.equipos.map((eq, i) => (
                <tr key={`${eq.serial}-${i}`}>
                  <td>{eq.tipo}</td>
                  <td>
                    {eq.marca} {eq.modelo}
                  </td>
                  <td><code>{eq.serial}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles['ticket-qr']}>
          {seguimiento.trackingUrl ? (
            <>
              <QRCodeSVG
                value={seguimiento.trackingUrl}
                size={168}
                level="M"
                marginSize={2}
                aria-label={`Código QR de seguimiento para ${seguimiento.codigo}`}
              />
              <p className={styles['ticket-qr-help']}>
                Escanea para ver el estado de tu mantenimiento
              </p>
            </>
          ) : (
            <p className={styles['ticket-qr-help']}>Enlace de seguimiento no disponible</p>
          )}
          {seguimiento.trackingUrl && (
            <p className={styles['ticket-url']}>{seguimiento.trackingUrl}</p>
          )}
        </div>
      </div>

      <div className={`ticket-no-print ${styles['ticket-actions']}`}>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={() => window.print()}>
          <IconPrinter size={16} />
          Imprimir ticket
        </button>
      </div>
    </div>
  )
}
