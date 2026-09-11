import React, { useEffect, useMemo, useState } from "react"
import { IconPlus, IconQrcode, IconLink, IconTool, IconSearch, IconX, IconAdjustmentsHorizontal } from "@tabler/icons-react"
import {
  ordenesService,
  estadoLabel,
  ORDEN_ESTADOS,
  type OrdenServicio,
  type SeguimientoPublico,
  type OrdenEstado,
} from "@/services/ordenes"
import { fichasService, type FichaTecnica } from "@/services/fichas"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import { Drawer, Spinner, EmptyState, formatDate, FormPanel } from "./ui"
import TicketMantenimiento from "./TicketMantenimiento"
import styles from "@/styles/OrdenesSection.module.css"

type OrdenPanel = "none" | "crear" | "asociar"

function estadoClase(estado: OrdenEstado): string {
  const map: Record<OrdenEstado, string> = {
    recibido: "sys-badge--primary",
    diagnostico: "sys-badge--primary",
    pendiente_de_autorizacion: "sys-badge--warn",
    en_mantenimiento: "sys-badge--warn",
    en_pruebas: "sys-badge--warn",
    listo: "sys-badge--ok",
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
  const safeFichas = Array.isArray(fichas) ? fichas : []
  if (safeFichas.length === 0) {
    return <p className={styles['sys-empty-inline']}>No hay fichas técnicas disponibles.</p>
  }
  return (
    <div className={styles['sys-checklist']}>
      {safeFichas.map((f) => (
        <label key={f.id} className={styles['sys-check']}>
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

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<OrdenEstado | "">("")

  async function loadOrdenes(searchTerm?: string, estadoTerm?: string) {
    setLoading(true)
    try {
      const s = searchTerm !== undefined ? searchTerm : debouncedSearch
      const e = estadoTerm !== undefined ? estadoTerm : filtroEstado
      const data = await ordenesService.list({ search: s || undefined, estado: (e as OrdenEstado) || undefined })
      setOrdenes(Array.isArray(data) ? data : [])
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
      setOrdenes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrdenes("", "")
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    loadOrdenes(debouncedSearch, filtroEstado)
  }, [debouncedSearch, filtroEstado])

  function cargarFichas() {
    fichasService
      .list()
      .then((data) => setFichasDisponibles(Array.isArray(data) ? data : []))
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
      await loadOrdenes(debouncedSearch, filtroEstado)
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
      await loadOrdenes(debouncedSearch, filtroEstado)
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
    const asociadas = new Set(
      Array.isArray(asociarA?.fichasTecnicas) ? asociarA.fichasTecnicas.map((f) => f.id) : []
    )
    const safeFichas = Array.isArray(fichasDisponibles) ? fichasDisponibles : []
    return safeFichas.filter((f) => !asociadas.has(f.id))
  }, [fichasDisponibles, asociarA])

  if (panel === "crear") {
    return (
      <div className={styles['sys-section']}>
        <FormPanel
          title="Nueva orden de servicio"
          subtitle="Agrupa uno o varios equipos en un solo código de seguimiento."
          onClose={cerrarPanel}
          footer={
            <>
              <button
                type="button"
                className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`}
                onClick={cerrarPanel}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`}
                onClick={handleCrear}
                disabled={guardando}
              >
                {guardando ? "Creando..." : "Crear orden y ver ticket"}
              </button>
            </>
          }
        >
          <div className={styles['sys-form-grid']}>
            <div className={`${styles['sys-field']} ${styles['sys-field--full']}`}>
              <span>Fallas reportadas *</span>
              <textarea
                className={styles['sys-textarea']}
                rows={3}
                value={falla}
                onChange={(e) => setFalla(e.target.value)}
                placeholder="Describe la falla reportada por el cliente..."
              />
            </div>
            <div className={styles['sys-field']}>
              <span>Fecha de entrega estimada</span>
              <input
                className={styles['sys-input']}
                type="date"
                value={fechaEstimada}
                onChange={(e) => setFechaEstimada(e.target.value)}
              />
            </div>
            <div className={`${styles['sys-field']} ${styles['sys-field--full']}`}>
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
            <p className={styles['sys-empty-inline']}>No se pudo cargar el seguimiento.</p>
          )}
        </Drawer>
      </div>
    )
  }

  if (panel === "asociar") {
    return (
      <div className={styles['sys-section']}>
        <FormPanel
          title={`Asociar fichas a ${asociarA?.codigo ?? ""}`}
          subtitle="Selecciona las fichas a agregar (no se duplican las ya asociadas)."
          onClose={cerrarPanel}
          footer={
            <>
              <button
                type="button"
                className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`}
                onClick={cerrarPanel}
                disabled={asociando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`}
                onClick={handleAsociar}
                disabled={asociando}
              >
                {asociando ? "Asociando..." : "Asociar fichas"}
              </button>
            </>
          }
        >
          <div className={`${styles['sys-field']} ${styles['sys-field--full']}`}>
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
            <p className={styles['sys-empty-inline']}>No se pudo cargar el seguimiento.</p>
          )}
        </Drawer>
      </div>
    )
  }

  return (
    <div className={styles['sys-section']}>
      <div className={styles['sys-section-toolbar']} style={{ alignItems: "flex-end" }}>
        <div className={styles['sys-panel-heading']} style={{ minWidth: 0 }}>
          <h2 className={styles['sys-panel-title']} style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Órdenes de servicio</h2>
          {!loading && Array.isArray(ordenes) && (
            <p className={styles['sys-panel-sub']} style={{ fontSize: "0.8125rem" }}>
              {ordenes.length === 0 ? (debouncedSearch || filtroEstado ? "Sin resultados" : "Sin órdenes aún") : `${ordenes.length} ${ordenes.length === 1 ? "orden" : "órdenes"}${debouncedSearch ? ` · filtrado por "${debouncedSearch}"` : ""}${filtroEstado ? ` · ${estadoLabel(filtroEstado as OrdenEstado)}` : ""}`}
            </p>
          )}
        </div>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={abrirCrear}>
          <IconPlus size={16} />
          Nueva orden
        </button>
      </div>

      <div className={styles['sys-filter-bar']} role="search" aria-label="Buscar órdenes">
        <div className={styles['sys-search']} style={{ flex: "1 1 14rem", maxWidth: "24rem" }}>
          <IconSearch size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar órdenes por código, falla, ID, serial o cliente"
            placeholder="Buscar por código, falla, ID, serial, cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda" className={styles['sys-icon-btn']} style={{ width: "1.75rem", height: "1.75rem" }}>
              <IconX size={14} aria-hidden="true" />
            </button>
          )}
        </div>
        <span className={styles['sys-filter-divider']} aria-hidden="true" />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <IconAdjustmentsHorizontal size={16} aria-hidden="true" style={{ color: "hsl(var(--muted-foreground))" }} />
          <select
            className={styles['sys-select']}
            aria-label="Filtrar por estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as OrdenEstado | "")}
            style={{ minWidth: "12rem", height: "40px", borderRadius: "999px", padding: "0 0.75rem" }}
          >
            <option value="">Todos los estados</option>
            {ORDEN_ESTADOS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {(search || debouncedSearch || filtroEstado) && (
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => { setSearch(""); setFiltroEstado(""); }}>Limpiar</button>
          )}
        </div>
      </div>

      {loading ? (
        <Spinner label="Cargando órdenes..." />
      ) : !Array.isArray(ordenes) || ordenes.length === 0 ? (
        <EmptyState
          title={debouncedSearch || filtroEstado ? "Sin resultados" : "Aún no hay órdenes de servicio"}
          description={debouncedSearch || filtroEstado ? `No encontramos órdenes con ese término${debouncedSearch ? ` "${debouncedSearch}"` : ""}${filtroEstado ? ` y estado ${estadoLabel(filtroEstado as OrdenEstado)}` : ""}.` : "Crea la primera orden y asocia las fichas técnicas de los equipos recibidos."}
          icon={<IconTool size={20} />}
        />
      ) : (
        <div className={styles['sys-table-wrap']}>
          <table className={styles['sys-table']}>
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
              {(Array.isArray(ordenes) ? ordenes : []).map((orden) => (
                <tr key={orden.id}>
                  <td data-label="Código">
                    <code>{orden.codigo}</code>
                  </td>
                  <td data-label="Equipos">
                    {orden.fichasTecnicas?.length ?? 0} equipo(s)
                  </td>
                  <td data-label="Estado">
                    <span className={`${styles['sys-badge']} ${estadoClase(orden.estado)}`}>
                      {estadoLabel(orden.estado)}
                    </span>
                  </td>
                  <td data-label="Ingreso">{formatDate(orden.fechaIngreso)}</td>
                  <td data-label="Acciones">
                    <div className={styles['sys-row-actions']}>
                      <button
                        type="button"
                        className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`}
                        title="Ver ticket / QR"
                        aria-label={`Ver ticket de la orden ${orden.codigo}`}
                        onClick={() => verTicket(orden.codigo)}
                      >
                        <IconQrcode size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`}
                        title="Asociar fichas"
                        aria-label={`Asociar fichas a la orden ${orden.codigo}`}
                        onClick={() => abrirAsociar(orden)}
                      >
                        <IconLink size={16} aria-hidden="true" />
                      </button>
                      <select
                        className={`${styles['sys-select']} ${styles['sys-select--sm']}`}
                        aria-label={`Cambiar estado de la orden ${orden.codigo}`}
                        value={orden.estado}
                        onChange={(e) => cambiarEstado(orden, e.target.value as OrdenEstado)}
                      >
                        <option value="recibido">Recibido</option>
                        <option value="diagnostico">Diagnóstico</option>
                        <option value="pendiente_de_autorizacion">Pendiente de autorización</option>
                        <option value="en_mantenimiento">En mantenimiento</option>
                        <option value="en_pruebas">En pruebas</option>
                        <option value="listo">Listo</option>
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
          <p className={styles['sys-empty-inline']}>No se pudo cargar el seguimiento.</p>
        )}
      </Drawer>
    </div>
  )
}
