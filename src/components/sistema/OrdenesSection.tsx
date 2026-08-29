import React, { useEffect, useMemo, useState } from "react"
import { IconPlus, IconQrcode, IconLink, IconTool } from "@tabler/icons-react"
import {
  ordenesService,
  estadoLabel,
  type OrdenServicio,
  type SeguimientoPublico,
  type OrdenEstado,
} from "@/services/ordenes"
import { fichasService, type FichaTecnica } from "@/services/fichas"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import { Drawer, Spinner, EmptyState, formatDate, FormPanel } from "./ui"
import TicketMantenimiento from "./TicketMantenimiento"

type OrdenPanel = "none" | "crear" | "asociar"

function estadoClase(estado: OrdenEstado): string {
  const map: Record<OrdenEstado, string> = {
    recibido: "sys-badge--primary",
    diagnostico: "sys-badge--primary",
    reparacion: "sys-badge--warn",
    esperando_repuestos: "sys-badge--warn",
    terminado: "sys-badge--ok",
    entregado: "sys-badge--ok",
    cancelado: "sys-badge--off",
  }
  return map[estado] ?? "sys-badge--primary"
}

function FichasChecklist({
  fichas,
  seleccionadas,
  onToggle,
}: {
  fichas: FichaTecnica[]
  seleccionadas: string[]
  onToggle: (id: string, checked: boolean) => void
}) {
  if (fichas.length === 0) {
    return <p className="sys-empty-inline">No hay fichas técnicas disponibles.</p>
  }
  return (
    <div className="sys-checklist">
      {fichas.map((f) => (
        <label key={f.id} className="sys-check">
          <input
            type="checkbox"
            checked={seleccionadas.includes(f.id)}
            onChange={(e) => onToggle(f.id, e.target.checked)}
          />
          <span>
            <strong>{f.nombreCliente}</strong>
            {f.marcaEquipo || f.modeloEquipo || f.serialEquipo ? (
              <>
                {" "}
                — {[f.marcaEquipo, f.modeloEquipo].filter(Boolean).join(" ")}{" "}
                <code>{f.serialEquipo}</code>
              </>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  )
}

export default function OrdenesSection() {
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([])
  const [loading, setLoading] = useState(true)

  const [panel, setPanel] = useState<OrdenPanel>("none")
  const [fichasDisponibles, setFichasDisponibles] = useState<FichaTecnica[]>([])
  const [falla, setFalla] = useState("")
  const [fechaEstimada, setFechaEstimada] = useState("")
  const [seleccionadas, setSeleccionadas] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  const [asociarA, setAsociarA] = useState<OrdenServicio | null>(null)
  const [asociando, setAsociando] = useState(false)

  const [ticket, setTicket] = useState<SeguimientoPublico | null>(null)
  const [ticketLoading, setTicketLoading] = useState(false)

  async function loadOrdenes() {
    setLoading(true)
    try {
      setOrdenes(await ordenesService.list())
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrdenes()
  }, [])

  function cargarFichas() {
    fichasService
      .list()
      .then(setFichasDisponibles)
      .catch(() => setFichasDisponibles([]))
  }

  function abrirCrear() {
    setFalla("")
    setFechaEstimada("")
    setSeleccionadas([])
    setGuardando(false)
    setPanel("crear")
    cargarFichas()
  }

  function cerrarPanel() {
    setPanel("none")
    setAsociarA(null)
  }

  async function handleCrear() {
    if (seleccionadas.length === 0) {
      toast.warning("Selecciona al menos una ficha técnica")
      return
    }
    if (falla.trim().length < 10) {
      toast.warning("Describe la falla (mínimo 10 caracteres)")
      return
    }
    setGuardando(true)
    try {
      const orden = await ordenesService.create({
        fichaTecnicaIds: seleccionadas,
        fallaReportada: falla.trim(),
        fechaEntregaEstimada: fechaEstimada || undefined,
      })
      toast.success(`Orden ${orden.codigo} creada`)
      setPanel("none")
      await loadOrdenes()
      verTicket(orden.codigo)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setGuardando(false)
    }
  }

  function abrirAsociar(orden: OrdenServicio) {
    setAsociarA(orden)
    setSeleccionadas([])
    setAsociando(false)
    setPanel("asociar")
    cargarFichas()
  }

  async function handleAsociar() {
    if (!asociarA) return
    if (seleccionadas.length === 0) {
      toast.warning("Selecciona al menos una ficha")
      return
    }
    setAsociando(true)
    try {
      await ordenesService.agregarFichas(asociarA.id, { fichaTecnicaIds: seleccionadas })
      toast.success("Fichas asociadas a la orden")
      setAsociarA(null)
      setPanel("none")
      await loadOrdenes()
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setAsociando(false)
    }
  }

  async function verTicket(codigo: string) {
    setTicketLoading(true)
    setTicket(null)
    try {
      setTicket(await ordenesService.seguimiento(codigo))
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setTicketLoading(false)
    }
  }

  async function cambiarEstado(orden: OrdenServicio, estado: OrdenEstado) {
    if (estado === orden.estado) return
    try {
      await ordenesService.cambiarEstado(orden.id, { estado })
      toast.success(`Estado actualizado a "${estadoLabel(estado)}"`)
      await loadOrdenes()
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    }
  }

  function toggleSeleccion(id: string, checked: boolean) {
    setSeleccionadas((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const fichasSeleccionables = useMemo(() => {
    const asociadas = new Set(asociarA?.fichasTecnicas?.map((f) => f.id) ?? [])
    return fichasDisponibles.filter((f) => !asociadas.has(f.id))
  }, [fichasDisponibles, asociarA])

  if (panel === "crear") {
    return (
      <div className="sys-section">
        <FormPanel
          title="Nueva orden de servicio"
          subtitle="Agrupa uno o varios equipos en un solo código de seguimiento."
          onClose={cerrarPanel}
          footer={
            <>
              <button
                type="button"
                className="sys-btn sys-btn--ghost"
                onClick={cerrarPanel}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="sys-btn sys-btn--primary"
                onClick={handleCrear}
                disabled={guardando}
              >
                {guardando ? "Creando..." : "Crear orden y ver ticket"}
              </button>
            </>
          }
        >
          <div className="sys-form-grid">
            <div className="sys-field sys-field--full">
              <span>Fallas reportadas *</span>
              <textarea
                className="sys-textarea"
                rows={3}
                value={falla}
                onChange={(e) => setFalla(e.target.value)}
                placeholder="Describe la falla reportada por el cliente..."
              />
            </div>
            <div className="sys-field">
              <span>Fecha de entrega estimada</span>
              <input
                className="sys-input"
                type="date"
                value={fechaEstimada}
                onChange={(e) => setFechaEstimada(e.target.value)}
              />
            </div>
            <div className="sys-field sys-field--full">
              <span>Fichas técnicas a incluir *</span>
              <FichasChecklist
                fichas={fichasDisponibles}
                seleccionadas={seleccionadas}
                onToggle={toggleSeleccion}
              />
            </div>
          </div>
        </FormPanel>

        <Drawer open={ticket !== null} title="Ticket de seguimiento" onClose={() => setTicket(null)} size="lg">
          {ticketLoading ? (
            <Spinner label="Cargando seguimiento..." />
          ) : ticket ? (
            <TicketMantenimiento seguimiento={ticket} />
          ) : (
            <p className="sys-empty-inline">No se pudo cargar el seguimiento.</p>
          )}
        </Drawer>
      </div>
    )
  }

  if (panel === "asociar") {
    return (
      <div className="sys-section">
        <FormPanel
          title={`Asociar fichas a ${asociarA?.codigo ?? ""}`}
          subtitle="Selecciona las fichas a agregar (no se duplican las ya asociadas)."
          onClose={cerrarPanel}
          footer={
            <>
              <button
                type="button"
                className="sys-btn sys-btn--ghost"
                onClick={cerrarPanel}
                disabled={asociando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="sys-btn sys-btn--primary"
                onClick={handleAsociar}
                disabled={asociando}
              >
                {asociando ? "Asociando..." : "Asociar fichas"}
              </button>
            </>
          }
        >
          <div className="sys-field sys-field--full">
            <span>Selecciona las fichas a agregar (no se duplican las ya asociadas)</span>
            <FichasChecklist
              fichas={fichasSeleccionables}
              seleccionadas={seleccionadas}
              onToggle={toggleSeleccion}
            />
          </div>
        </FormPanel>

        <Drawer open={ticket !== null} title="Ticket de seguimiento" onClose={() => setTicket(null)} size="lg">
          {ticketLoading ? (
            <Spinner label="Cargando seguimiento..." />
          ) : ticket ? (
            <TicketMantenimiento seguimiento={ticket} />
          ) : (
            <p className="sys-empty-inline">No se pudo cargar el seguimiento.</p>
          )}
        </Drawer>
      </div>
    )
  }

  return (
    <div className="sys-section">
      <div className="sys-section-toolbar">
        <div className="sys-search-hint">
          <IconTool size={16} aria-hidden="true" />
          <span>Las órdenes agrupan varios equipos en un solo código QR de seguimiento.</span>
        </div>
        <button type="button" className="sys-btn sys-btn--primary" onClick={abrirCrear}>
          <IconPlus size={16} />
          Nueva orden
        </button>
      </div>

      {loading ? (
        <Spinner label="Cargando órdenes..." />
      ) : ordenes.length === 0 ? (
        <EmptyState
          title="Aún no hay órdenes de servicio"
          description="Crea la primera orden y asocia las fichas técnicas de los equipos recibidos."
          icon={<IconTool size={20} />}
        />
      ) : (
        <div className="sys-table-wrap">
          <table className="sys-table">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Equipos</th>
                <th scope="col">Estado</th>
                <th scope="col">Ingreso</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td data-label="Código">
                    <code>{orden.codigo}</code>
                  </td>
                  <td data-label="Equipos">
                    {orden.fichasTecnicas?.length ?? 0} equipo(s)
                  </td>
                  <td data-label="Estado">
                    <span className={`sys-badge ${estadoClase(orden.estado)}`}>
                      {estadoLabel(orden.estado)}
                    </span>
                  </td>
                  <td data-label="Ingreso">{formatDate(orden.fechaIngreso)}</td>
                  <td data-label="Acciones">
                    <div className="sys-row-actions">
                      <button
                        type="button"
                        className="sys-icon-btn"
                        title="Ver ticket / QR"
                        aria-label={`Ver ticket de la orden ${orden.codigo}`}
                        onClick={() => verTicket(orden.codigo)}
                      >
                        <IconQrcode size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sys-icon-btn"
                        title="Asociar fichas"
                        aria-label={`Asociar fichas a la orden ${orden.codigo}`}
                        onClick={() => abrirAsociar(orden)}
                      >
                        <IconLink size={17} aria-hidden="true" />
                      </button>
                      <select
                        className="sys-select sys-select--sm"
                        aria-label={`Cambiar estado de la orden ${orden.codigo}`}
                        value={orden.estado}
                        onChange={(e) => cambiarEstado(orden, e.target.value as OrdenEstado)}
                      >
                        <option value="recibido">Recibido</option>
                        <option value="diagnostico">Diagnóstico</option>
                        <option value="reparacion">Reparación</option>
                        <option value="esperando_repuestos">Esperando repuestos</option>
                        <option value="terminado">Terminado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={ticket !== null} title="Ticket de seguimiento" onClose={() => setTicket(null)} size="lg">
        {ticketLoading ? (
          <Spinner label="Cargando seguimiento..." />
        ) : ticket ? (
          <TicketMantenimiento seguimiento={ticket} />
        ) : (
          <p className="sys-empty-inline">No se pudo cargar el seguimiento.</p>
        )}
      </Drawer>
    </div>
  )
}
