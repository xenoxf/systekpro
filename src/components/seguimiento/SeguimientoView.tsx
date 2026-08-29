import React, { useEffect, useState } from "react"
import { ordenesService, estadoLabel, type SeguimientoPublico, type OrdenEstado } from "@/services/ordenes"
import { isApiError } from "@/services/api"
import { Spinner } from "@/components/sistema/ui"

function estadoClase(estado: OrdenEstado): string {
  const map: Record<OrdenEstado, string> = {
    recibido: "seg-estado--info",
    diagnostico: "seg-estado--info",
    reparacion: "seg-estado--warn",
    esperando_repuestos: "seg-estado--warn",
    terminado: "seg-estado--ok",
    entregado: "seg-estado--ok",
    cancelado: "seg-estado--off",
  }
  return map[estado] ?? "seg-estado--info"
}

export default function SeguimientoView() {
  const [codigo, setCodigo] = useState<string>("")
  const [data, setData] = useState<SeguimientoPublico | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get("c") ?? ""
    setCodigo(c)
    if (!c) return
    cargar(c)
  }, [])

  async function cargar(c: string) {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      setData(await ordenesService.seguimiento(c))
    } catch (err) {
      if (isApiError(err)) setError(err.message)
      else setError("No se pudo cargar el seguimiento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="seg-container">
      <header className="seg-head">
        <span className="seg-brand">SISTEK</span>
        <h1>Seguimiento de mantenimiento</h1>
        <p className="seg-sub">
          Consulta el estado de tus equipos en tiempo real con el código de tu orden.
        </p>
      </header>

      {codigo && (
        <p className="seg-codigo">
          Orden <code>{codigo}</code>
        </p>
      )}

      {loading && <Spinner label="Cargando seguimiento..." />}

      {!loading && error && <div className="seg-error">{error}</div>}

      {!loading && !error && !data && !codigo && (
        <div className="seg-error">No se encontró un código de seguimiento en el enlace.</div>
      )}

      {!loading && data && (
        <div className="seg-card">
          {data.estado === "cancelado" ? (
            <div className="seg-status">
              <span className={`seg-estado ${estadoClase(data.estado)}`}>
                {estadoLabel(data.estado)}
              </span>
            </div>
          ) : (
            <ol className="seg-stepper">
              {(["recibido", "diagnostico", "reparacion", "terminado", "entregado"] as const).map(
                (step, i) => {
                  const order = ["recibido", "diagnostico", "reparacion", "terminado", "entregado"]
                  const current = order.indexOf(data.estado as (typeof order)[number])
                  const estadoReal = data.estado === "esperando_repuestos" ? "reparacion" : data.estado
                  const currentReal = order.indexOf(estadoReal as (typeof order)[number])
                  const done = i < currentReal
                  const active = i === currentReal
                  return (
                    <li
                      key={step}
                      className={`seg-step ${done ? "is-done" : ""} ${active ? "is-current" : ""}`}
                    >
                      <span className="seg-step-dot">{done ? "✓" : i + 1}</span>
                      <span className="seg-step-label">{estadoLabel(step)}</span>
                    </li>
                  )
                },
              )}
            </ol>
          )}

          <div className="seg-fechas">
            <span>Ingreso: {new Date(data.fechaIngreso).toLocaleDateString("es-CO")}</span>
            {data.fechaEntregaEstimada && (
              <span>
                Entrega estimada: {new Date(data.fechaEntregaEstimada).toLocaleDateString("es-CO")}
              </span>
            )}
            {data.fechaEntregaReal && (
              <span>Entregado: {new Date(data.fechaEntregaReal).toLocaleDateString("es-CO")}</span>
            )}
          </div>

          <section className="seg-section">
            <h2>Cliente(s)</h2>
            <p>{data.clientes.join(", ") || "—"}</p>
          </section>

          <section className="seg-section">
            <h2>Equipos</h2>
            <table className="seg-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Marca / Modelo</th>
                  <th>Serial</th>
                </tr>
              </thead>
              <tbody>
                {data.equipos.map((eq, i) => (
                  <tr key={`${eq.serial}-${i}`}>
                    <td>{eq.tipo}</td>
                    <td>
                      {eq.marca} {eq.modelo}
                    </td>
                    <td>
                      <code>{eq.serial}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="seg-section">
            <h2>Historial</h2>
            {data.eventos.length === 0 ? (
              <p className="seg-muted">Sin eventos registrados todavía.</p>
            ) : (
              <ol className="seg-timeline">
                {data.eventos.map((ev, i) => (
                  <li key={i}>
                    <div className="seg-ev-titulo">{ev.titulo}</div>
                    {ev.descripcion && <div className="seg-ev-desc">{ev.descripcion}</div>}
                    <time className="seg-ev-fecha">
                      {new Date(ev.fecha).toLocaleString("es-CO")}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
