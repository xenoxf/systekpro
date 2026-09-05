import React, { useEffect, useRef, useState } from "react"
import {
  IconSearch,
  IconPencil,
  IconTrash,
  IconShieldCheck,
  IconPlus,
  IconFileText,
  IconX,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react"
import {
  fichasService,
  TIPOS_EQUIPO,
  type FichaTecnica,
  type GarantiaResponse,
  type CreateFichaDto,
  type TipoEquipo,
} from "@/services/fichas"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import { ConfirmDialog, EmptyState, Spinner, formatDate, FormPanel } from "./ui"
import FichaForm from "./FichaForm"

type FichaModo = "list" | "detail" | "create" | "edit"

function tipoEquipoLabel(value?: string | null): string {
  return (value && TIPOS_EQUIPO.find((t) => t.value === value)?.label) || "—"
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

function FichasSkeleton() {
  return (
    <div className="sys-table-wrap" aria-hidden="true">
      <table className="sys-table sys-table--dense">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Equipo</th>
            <th>Serial</th>
            <th>Tipo</th>
            <th>Registro</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              <td>
                <div className="sys-cell-with-avatar" style={{ opacity: 0.6 }}>
                  <span className="sys-cell-avatar" style={{ background: "hsl(var(--muted))", color: "transparent", borderColor: "transparent" }}>—</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ width: "7rem", height: "0.75rem", background: "hsl(var(--muted))", borderRadius: "var(--radius-sm)", display: "block" }} />
                    <span style={{ width: "5rem", height: "0.6rem", background: "hsl(var(--muted) / 0.6)", borderRadius: "var(--radius-sm)", display: "block" }} />
                  </span>
                </div>
              </td>
              <td><span style={{ width: "6rem", height: "0.75rem", background: "hsl(var(--muted) / 0.7)", borderRadius: "var(--radius-sm)", display: "inline-block" }} /></td>
              <td><span style={{ width: "5rem", height: "0.7rem", background: "hsl(var(--muted) / 0.5)", borderRadius: "var(--radius-sm)", display: "inline-block" }} /></td>
              <td><span style={{ width: "4rem", height: "0.7rem", background: "hsl(var(--muted) / 0.6)", borderRadius: "999px", display: "inline-block" }} /></td>
              <td><span style={{ width: "4.5rem", height: "0.7rem", background: "hsl(var(--muted) / 0.5)", borderRadius: "var(--radius-sm)", display: "inline-block" }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function FichasSection() {
  const [fichas, setFichas] = useState<FichaTecnica[]>([])
  const [loading, setLoading] = useState(true)
  const [serial, setSerial] = useState("")
  const [tipoEquipo, setTipoEquipo] = useState<TipoEquipo | "">("")
  const firstLoad = useRef(true)

  const [modo, setModo] = useState<FichaModo>("list")
  const [selected, setSelected] = useState<FichaTecnica | null>(null)
  const [garantia, setGarantia] = useState<GarantiaResponse | null>(null)
  const [garantiaLoading, setGarantiaLoading] = useState(false)

  const [editing, setEditing] = useState<FichaTecnica | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<FichaTecnica | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const hasFilters = Boolean(serial.trim() || tipoEquipo)

  async function loadFichas(filters?: { serial?: string; tipoEquipo?: TipoEquipo }) {
    setLoading(true)
    try {
      setFichas(await fichasService.list(filters))
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      loadFichas()
      return
    }
    const timer = setTimeout(() => {
      loadFichas({ serial: serial.trim() || undefined, tipoEquipo: tipoEquipo || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [serial, tipoEquipo])

  async function openDetail(ficha: FichaTecnica) {
    setSelected(ficha)
    setModo("detail")
    setGarantia(null)
    setGarantiaLoading(true)
    try {
      setGarantia(await fichasService.garantia(ficha.id))
    } catch (err) {
      if (isApiError(err) && err.statusCode !== 401) toast.warning("No se pudo consultar la garantía")
    } finally {
      setGarantiaLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setModo("create")
  }

  function openEdit(ficha: FichaTecnica) {
    setEditing(ficha)
    setSelected(null)
    setModo("edit")
  }

  function volverALista() {
    setModo("list")
    setSelected(null)
    setEditing(null)
  }

  async function handleSubmit(dto: CreateFichaDto) {
    setSubmitting(true)
    try {
      if (editing) {
        await fichasService.update(editing.id, dto)
        toast.success("Ficha técnica actualizada")
      } else {
        await fichasService.create(dto)
        toast.success("Ficha técnica creada")
      }
      setModo("list")
      setEditing(null)
      await loadFichas()
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await fichasService.remove(deleting.id)
      toast.success("Ficha técnica eliminada")
      setDeleting(null)
      if (selected?.id === deleting.id) setSelected(null)
      volverALista()
      await loadFichas()
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (modo === "create" || modo === "edit") {
    return (
      <div className="sys-section">
        <FormPanel
          title={modo === "edit" ? "Editar ficha técnica" : "Nueva ficha técnica"}
          subtitle="Solo el nombre del cliente es obligatorio. Los demás campos son opcionales."
          onClose={volverALista}
        >
          <FichaForm
            key={editing?.id ?? "new"}
            ficha={editing}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={volverALista}
          />
        </FormPanel>

        <ConfirmDialog
          open={deleting !== null}
          title="Eliminar ficha técnica"
          message={`¿Seguro que deseas eliminar la ficha de "${deleting?.nombreCliente ?? ""}"? Esta acción no se puede deshacer.`}
          loading={deleteLoading}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      </div>
    )
  }

  if (modo === "detail" && selected) {
    return (
      <div className="sys-section">
        <section className="sys-panel" aria-label="Detalle de la ficha técnica">
          <header className="sys-panel-head">
            <div className="sys-panel-heading">
              <p className="sys-topbar-eyebrow">Ficha técnica</p>
              <h2 className="sys-panel-title">{selected.nombreCliente}</h2>
              <p className="sys-panel-sub" style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <span>{tipoEquipoLabel(selected.tipoEquipo)}</span>
                {selected.serialEquipo && (
                  <>
                    <span aria-hidden="true">·</span>
                    <code style={{
                      fontSize: "0.75rem",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "var(--radius-sm)",
                      background: "hsl(var(--surface))",
                      border: "1px solid hsl(var(--border))",
                    }}>
                      {selected.serialEquipo}
                    </code>
                  </>
                )}
              </p>
            </div>
            <div className="sys-detail-actions">
              <button
                type="button"
                className="sys-icon-btn sys-icon-btn--outlined"
                title="Editar"
                aria-label={`Editar la ficha de ${selected.nombreCliente}`}
                onClick={() => openEdit(selected)}
              >
                <IconPencil size={17} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="sys-icon-btn sys-icon-btn--danger"
                title="Eliminar"
                aria-label={`Eliminar la ficha de ${selected.nombreCliente}`}
                onClick={() => setDeleting(selected)}
              >
                <IconTrash size={17} aria-hidden="true" />
              </button>
              <span style={{ width: "1px", height: "1.5rem", background: "hsl(var(--border))", margin: "0 0.25rem" }} aria-hidden="true" />
              <button type="button" className="sys-btn sys-btn--ghost" onClick={volverALista} style={{ minHeight: "32px", padding: "0 0.875rem", fontSize: "0.8125rem" }}>
                <IconX size={14} aria-hidden="true" />
                Cerrar
              </button>
            </div>
          </header>
          <div className="sys-panel-body">
            {garantiaLoading ? (
              <Spinner label="Consultando garantía..." />
            ) : (
              <>
                {garantia && (
                  <div className={`sys-garantia ${garantia.enGarantia ? "sys-garantia--ok" : "sys-garantia--off"}`}>
                    <IconShieldCheck size={20} aria-hidden="true" />
                    <div>
                      <strong>
                        {garantia.tieneGarantia
                          ? garantia.enGarantia
                            ? "En garantía"
                            : "Garantía vencida"
                          : "Sin garantía registrada"}
                      </strong>
                      <span>
                        {garantia.venceEl && ` Vence el ${formatDate(garantia.venceEl)}`}
                        {garantia.diasRestantes != null &&
                          ` (${garantia.diasRestantes >= 0 ? `${garantia.diasRestantes} días restantes` : `${Math.abs(garantia.diasRestantes)} días de retraso`})`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="sys-detail-group">
                  <h3>Cliente y servicio</h3>
                  <dl className="sys-detail-grid">
                    <div><dt>Cliente</dt><dd>{selected.nombreCliente}</dd></div>
                    <div><dt>Teléfono</dt><dd>{selected.telefonoCliente || "—"}</dd></div>
                    <div><dt>Dirección</dt><dd>{selected.direccionCliente || "—"}</dd></div>
                    <div><dt>Correo</dt><dd>{selected.correoCliente || "—"}</dd></div>
                    <div><dt>Servicio</dt><dd>{selected.servicio || "—"}</dd></div>
                    <div><dt>Responsable</dt><dd>{selected.nombreResponsable || "—"}</dd></div>
                  </dl>
                </div>

                <div className="sys-detail-group">
                  <h3>Equipo</h3>
                  <dl className="sys-detail-grid">
                    <div><dt>Tipo</dt><dd>{tipoEquipoLabel(selected.tipoEquipo)}</dd></div>
                    <div><dt>Marca / Modelo</dt><dd>{[selected.marcaEquipo, selected.modeloEquipo].filter(Boolean).join(" ") || "—"}</dd></div>
                    <div><dt>Serial</dt><dd><code>{selected.serialEquipo || "—"}</code></dd></div>
                    <div><dt>Referencia</dt><dd>{selected.referencia || "—"}</dd></div>
                    <div><dt>Adquisición</dt><dd>{formatDate(selected.fechaAdquisicion)}</dd></div>
                    <div><dt>Garantía</dt><dd>{selected.tiempoGarantiaMeses ? `${selected.tiempoGarantiaMeses} meses` : "—"}</dd></div>
                  </dl>
                </div>

                <div className="sys-detail-group">
                  <h3>Especificaciones</h3>
                  <dl className="sys-detail-grid">
                    {(selected.procesadorMarca || selected.procesadorModelo) && (
                      <div><dt>Procesador</dt><dd>{[selected.procesadorMarca, selected.procesadorModelo].filter(Boolean).join(" ")}</dd></div>
                    )}
                    {selected.nucleosCpu != null && <div><dt>Núcleos</dt><dd>{selected.nucleosCpu}</dd></div>}
                    {selected.velocidadProcesador && <div><dt>Velocidad CPU</dt><dd>{selected.velocidadProcesador}</dd></div>}
                    {selected.memoriaRamGb != null && <div><dt>RAM</dt><dd>{selected.memoriaRamGb} GB</dd></div>}
                    {selected.tecnologiaDisco1 && (
                      <div><dt>Disco 1</dt><dd>{selected.tecnologiaDisco1}{selected.capacidadDisco1Gb ? ` · ${selected.capacidadDisco1Gb} GB` : ""}</dd></div>
                    )}
                    {selected.tecnologiaDisco2 && (
                      <div><dt>Disco 2</dt><dd>{selected.tecnologiaDisco2}{selected.capacidadDisco2Gb ? ` · ${selected.capacidadDisco2Gb} GB` : ""}</dd></div>
                    )}
                    {selected.tarjetaVideoIntegrada && <div><dt>Video integrado</dt><dd>Sí</dd></div>}
                    {selected.tarjetaVideoIndependiente && <div><dt>Video independiente</dt><dd>Sí</dd></div>}
                    {selected.marcaMouse && <div><dt>Mouse</dt><dd>{selected.marcaMouse}</dd></div>}
                  </dl>
                </div>

                {selected.observaciones && (
                  <div className="sys-detail-group">
                    <h3>Observaciones</h3>
                    <p className="sys-detail-text">{selected.observaciones}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <ConfirmDialog
          open={deleting !== null}
          title="Eliminar ficha técnica"
          message={`¿Seguro que deseas eliminar la ficha de "${deleting?.nombreCliente ?? ""}"? Esta acción no se puede deshacer.`}
          loading={deleteLoading}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      </div>
    )
  }

  return (
    <div className="sys-section">
      {/* Header — Material: eyebrow + title + trailing primary */}
      <div className="sys-section-toolbar" style={{ alignItems: "flex-end" }}>
        <div className="sys-panel-heading" style={{ minWidth: 0 }}>
          <p className="sys-topbar-eyebrow">Inventario</p>
          <h2 className="sys-panel-title" style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Fichas técnicas</h2>
          {!loading && (
            <p className="sys-panel-sub" aria-live="polite" style={{ fontSize: "0.8125rem" }}>
              {fichas.length === 0
                ? hasFilters ? "Sin resultados para los filtros" : "Sin equipos aún"
                : `${fichas.length} ${fichas.length === 1 ? "equipo" : "equipos"}${hasFilters ? " · filtrado" : ""}`}
            </p>
          )}
        </div>
        <button type="button" className="sys-btn sys-btn--primary" onClick={openCreate}>
          <IconPlus size={16} aria-hidden="true" />
          Nueva ficha
        </button>
      </div>

      {/* Filter bar — Material search + filter */}
      <div className="sys-filter-bar" role="search" aria-label="Filtros de fichas técnicas">
        <div className="sys-search" style={{ flex: "1 1 14rem", maxWidth: "22rem" }}>
          <IconSearch size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Filtrar fichas por serial del equipo"
            placeholder="Buscar por serial…"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {serial && (
            <button
              type="button"
              onClick={() => setSerial("")}
              aria-label="Limpiar búsqueda por serial"
              className="sys-icon-btn"
              style={{ width: "1.75rem", height: "1.75rem" }}
            >
              <IconX size={14} aria-hidden="true" />
            </button>
          )}
        </div>
        <span className="sys-filter-divider" aria-hidden="true" />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <IconAdjustmentsHorizontal size={16} aria-hidden="true" style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          <select
            className="sys-select"
            aria-label="Filtrar fichas por tipo de equipo"
            value={tipoEquipo}
            onChange={(e) => setTipoEquipo(e.target.value as TipoEquipo | "")}
            style={{ minWidth: "10.5rem", height: "40px", borderRadius: "999px", padding: "0 0.75rem" }}
          >
            <option value="">Todos los tipos</option>
            {TIPOS_EQUIPO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            className="sys-btn sys-btn--ghost"
            onClick={() => {
              setSerial("")
              setTipoEquipo("")
            }}
            disabled={!hasFilters}
            aria-disabled={!hasFilters}
          >
            Limpiar
          </button>
        </div>
      </div>

      {loading ? (
        <FichasSkeleton />
      ) : fichas.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Sin resultados" : "Aún no hay fichas técnicas"}
          description={
            hasFilters
              ? "No encontramos fichas con ese serial o tipo. Prueba limpiando los filtros o con otro término."
              : "Crea la primera ficha para comenzar a registrar el equipamiento de tus clientes."
          }
          icon={<IconFileText size={22} aria-hidden="true" />}
          action={
            <button type="button" className="sys-btn sys-btn--primary" onClick={openCreate}>
              <IconPlus size={16} aria-hidden="true" />
              {hasFilters ? "Limpiar filtros y crear" : "Nueva ficha"}
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop: Material Data Table — primary view */}
          <div className="sys-fichas-table">
            <div className="sys-table-wrap">
              <table className="sys-table sys-table--dense sys-table--clickable" aria-label="Listado de fichas técnicas">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "32%" }}>Cliente</th>
                    <th scope="col" style={{ width: "26%" }}>Equipo</th>
                    <th scope="col">Serial</th>
                    <th scope="col">Tipo</th>
                    <th scope="col" style={{ width: "7rem" }}>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {fichas.map((ficha) => (
                    <tr
                      key={ficha.id}
                      onClick={() => openDetail(ficha)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          openDetail(ficha)
                        }
                      }}
                      aria-label={`Ver la ficha de ${ficha.nombreCliente}, ${tipoEquipoLabel(ficha.tipoEquipo)}, serial ${ficha.serialEquipo || "sin serial"}`}
                    >
                      <td>
                        <div className="sys-cell-with-avatar">
                          <span className="sys-cell-avatar" aria-hidden="true">{initials(ficha.nombreCliente)}</span>
                          <span className="sys-cell-stack">
                            <span className="sys-cell-main" title={ficha.nombreCliente}>{ficha.nombreCliente}</span>
                            <span className="sys-cell-sub" title={ficha.telefonoCliente || ficha.correoCliente || ""}>{ficha.telefonoCliente || ficha.correoCliente || "—"}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="sys-cell-stack">
                          <span className="sys-cell-main" style={{ fontSize: "0.8125rem" }} title={[ficha.marcaEquipo, ficha.modeloEquipo].filter(Boolean).join(" ")}>
                            {[ficha.marcaEquipo, ficha.modeloEquipo].filter(Boolean).join(" ") || "—"}
                          </span>
                          <span className="sys-cell-sub">{ficha.servicio || "Sin servicio"}</span>
                        </span>
                      </td>
                      <td><code title={ficha.serialEquipo || ""}>{ficha.serialEquipo || "—"}</code></td>
                      <td><span className="sys-badge">{tipoEquipoLabel(ficha.tipoEquipo)}</span></td>
                      <td style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.75rem" }}>{formatDate(ficha.fechaRealizacion ?? ficha.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: dense list — not giant cards */}
          <div className="sys-fichas-list" role="list" aria-label="Listado de fichas técnicas (mobile)">
            {fichas.map((ficha) => (
              <button
                key={ficha.id}
                type="button"
                className="sys-card"
                onClick={() => openDetail(ficha)}
                aria-label={`Ver la ficha de ${ficha.nombreCliente}, ${tipoEquipoLabel(ficha.tipoEquipo)}, serial ${ficha.serialEquipo || "sin serial"}`}
                role="listitem"
              >
                <span className="sys-card-avatar" aria-hidden="true">
                  {initials(ficha.nombreCliente)}
                </span>
                <span className="sys-card-body">
                  <span className="sys-card-title">{ficha.nombreCliente}</span>
                  <span className="sys-card-sub">
                    {[ficha.marcaEquipo, ficha.modeloEquipo].filter(Boolean).join(" ") || "Equipo sin especificar"}
                  </span>
                  <span className="sys-card-meta">
                    <code>{ficha.serialEquipo || "Sin serial"}</code>
                    <span>{tipoEquipoLabel(ficha.tipoEquipo)}</span>
                  </span>
                </span>
                <span className="sys-card-date">{formatDate(ficha.fechaRealizacion ?? ficha.createdAt)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar ficha técnica"
        message={`¿Seguro que deseas eliminar la ficha de "${deleting?.nombreCliente ?? ""}"? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
