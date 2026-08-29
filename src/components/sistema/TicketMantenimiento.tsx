import React from "react"
import { QRCodeSVG } from "qrcode.react"
import { IconPrinter } from "@tabler/icons-react"
import { type SeguimientoPublico, estadoLabel } from "@/services/ordenes"
import { formatDate } from "./ui"

function estadoClase(estado: string): string {
  const map: Record<string, string> = {
    recibido: "ticket-estado--info",
    diagnostico: "ticket-estado--info",
    reparacion: "ticket-estado--warn",
    esperando_repuestos: "ticket-estado--warn",
    terminado: "ticket-estado--ok",
    entregado: "ticket-estado--ok",
    cancelado: "ticket-estado--off",
  }
  return map[estado] ?? "ticket-estado--info"
}

export default function TicketMantenimiento({
  seguimiento,
}: {
  seguimiento: SeguimientoPublico
}) {
  return (
    <div className="ticket-wrap">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .ticket-sheet, .ticket-sheet * { visibility: visible !important; }
          .ticket-sheet {
            position: absolute;
            inset: 0;
            margin: 0;
            width: 100%;
            box-shadow: none !important;
          }
          .ticket-no-print { display: none !important; }
        }
      `}</style>

      <div className="ticket-sheet">
        <header className="ticket-head">
          <div>
            <strong className="ticket-brand">SISTEK</strong>
            <span className="ticket-brand-sub">Seguimiento de mantenimiento</span>
          </div>
          <span className={`ticket-estado ${estadoClase(seguimiento.estado)}`}>
            {estadoLabel(seguimiento.estado)}
          </span>
        </header>

        <div className="ticket-meta">
          <div>
            <span className="ticket-label">Código</span>
            <strong className="ticket-codigo">{seguimiento.codigo}</strong>
          </div>
          <div>
            <span className="ticket-label">Ingreso</span>
            <span>{formatDate(seguimiento.fechaIngreso)}</span>
          </div>
          <div>
            <span className="ticket-label">Entrega estimada</span>
            <span>{formatDate(seguimiento.fechaEntregaEstimada)}</span>
          </div>
        </div>

        <div className="ticket-block">
          <span className="ticket-label">Cliente(s)</span>
          <p className="ticket-clientes">{seguimiento.clientes.join(", ") || "—"}</p>
        </div>

        <div className="ticket-block">
          <span className="ticket-label">Equipos en esta orden</span>
          <table className="ticket-equipos">
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

        <div className="ticket-qr">
          {seguimiento.trackingUrl ? (
            <>
              <QRCodeSVG
                value={seguimiento.trackingUrl}
                size={168}
                level="M"
                marginSize={2}
                aria-label={`Código QR de seguimiento para ${seguimiento.codigo}`}
              />
              <p className="ticket-qr-help">
                Escanea para ver el estado de tu mantenimiento
              </p>
            </>
          ) : (
            <p className="ticket-qr-help">Enlace de seguimiento no disponible</p>
          )}
          {seguimiento.trackingUrl && (
            <p className="ticket-url">{seguimiento.trackingUrl}</p>
          )}
        </div>
      </div>

      <div className="ticket-no-print ticket-actions">
        <button type="button" className="sys-btn sys-btn--primary" onClick={() => window.print()}>
          <IconPrinter size={16} />
          Imprimir ticket
        </button>
      </div>
    </div>
  )
}
