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
  IconLink,
  IconUserPlus,
} from "@tabler/icons-react"
import {
  fichasService,
  TIPOS_EQUIPO,
  type FichaTecnica,
  type GarantiaResponse,
  type CreateFichaDto,
  type TipoEquipo,
} from "@/services/fichas"
import type { Cliente } from "@/services/clientes"
import { isApiError } from "@/services/api"
import { getSession } from "@/services/auth"
import { canDelete } from "@/services/permissions"
import { toast } from "@/components/starwind/toast"
import { ConfirmDialog, EmptyState, Spinner, formatDate, FormPanel } from "./ui"
import FichaForm from "./FichaForm"
import styles from "@/styles/FichasSection.module.css"

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

function fichaClienteNombre(ficha: FichaTecnica): string {
  const c = (ficha as any).cliente as Cliente | null | undefined
  if (c) return `${c.nombre_cliente} ${c.apellido_cliente}`.trim()
  return ficha.nombreCliente
}

function fichaClienteSub(ficha: FichaTecnica): string {
  const c = (ficha as any).cliente as Cliente | null | undefined
  if (c) return c.correo_cliente || c.telefono || c.dir || "—"
  return ficha.telefonoCliente || ficha.correoCliente || "—"
}

function fichaIsLinked(ficha: FichaTecnica): boolean {
  return !!(ficha as any).id_cliente || !!(ficha as any).cliente
}

function FichasSkeleton() {
  return (
    <div className={styles['sys-table-wrap']} aria-hidden="true">
      <table className={`${styles['sys-table']} ${styles['sys-table--dense']}`}>
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
                <div className={styles['sys-cell-with-avatar']} style={{ opacity: 0.6 }}>
                  <span className={styles['sys-cell-avatar']} style={{ background: "hsl(var(--muted))", color: "transparent", borderColor: "transparent" }}>—</span>
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
  const [currentUser] = useState(() => getSession()?.user ?? null)
  const allowDelete = canDelete(currentUser)
  const [fichas, setFichas] = useState<FichaTecnica[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tipoEquipo, setTipoEquipo] = useState<TipoEquipo | "">("")
  const firstLoad = useRef(true)

  const [modo, setModo] = useState<FichaModo>("list")
  const [selected, setSelected] = useState<FichaTecnica | null>(null)
  const [garantia, setGarantia] = useState<GarantiaResponse | null>(null)
  const [garantiaLoading, setGarantiaLoading] = useState(false)

  const [editing, setEditing] = useState<FichaTecnica | null>(null)
  const [prefillCliente, setPrefillCliente] = useState<Cliente | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<FichaTecnica | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const hasFilters = Boolean(search.trim() || tipoEquipo)

  async function loadFichas(filters?: { search?: string; serial?: string; tipoEquipo?: TipoEquipo }) {
    setLoading(true)
    try {
      const data = await fichasService.list(filters)
      setFichas(Array.isArray(data) ? data : [])
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
      setFichas([])
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
      loadFichas({ search: search.trim() || undefined, tipoEquipo: tipoEquipo || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, tipoEquipo])

  // Navegación cruzada: crear ficha para cliente desde ClientesSection
  useEffect(() => {
    // 1) al montar, revisar localStorage por si viene de ClientesSection con reload/hash
    try {
      const raw = localStorage.getItem("sistek.prefillCliente")
      if (raw) {
        const c = JSON.parse(raw) as Cliente
        if (c?.id_cliente) {
          setPrefillCliente(c)
          setEditing(null)
          setModo("create")
        }
        localStorage.removeItem("sistek.prefillCliente")
      }
    } catch {}
    // 2) escuchar evento custom
    function onCreateFicha(e: Event) {
      const ce = e as CustomEvent<Cliente>
      const c = ce.detail
      if (c?.id_cliente) {
        setPrefillCliente(c)
        setEditing(null)
        setModo("create")
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
    window.addEventListener("sistek:create-ficha-for-cliente" as any, onCreateFicha)
    return () => window.removeEventListener("sistek:create-ficha-for-cliente" as any, onCreateFicha)
  }, [])

  async function openDetail(ficha: FichaTecnica) {
    setSelected(ficha)
    setModo("detail")
    setGarantia(null)
    setGarantiaLoading(true)
    try {
      // Si la ficha ya trae cliente, no hace falta fetch extra, pero garantia sí
      setGarantia(await fichasService.garantia(ficha.id))
    } catch (err) {
      if (isApiError(err) && err.statusCode !== 401) toast.warning("No se pudo consultar la garantía")
    } finally {
      setGarantiaLoading(false)
    }
  }

  function openCreate(cliente?: Cliente | null) {
    if (cliente) setPrefillCliente(cliente)
    else if (!prefillCliente) setPrefillCliente(null)
    setEditing(null)
    setModo("create")
  }

  function openEdit(ficha: FichaTecnica) {
    setEditing(ficha)
    setPrefillCliente((ficha as any).cliente ?? null)
    setSelected(null)
    setModo("edit")
  }

  function volverALista() {
    setModo("list")
    setSelected(null)
    setEditing(null)
    setPrefillCliente(null)
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
      setPrefillCliente(null)
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
      <div className={styles['sys-section']}>
        <FormPanel
          title={modo === "edit" ? "Editar ficha técnica" : "Nueva ficha técnica"}
          subtitle={prefillCliente ? `Vinculada a ${prefillCliente.nombre_cliente} ${prefillCliente.apellido_cliente} · Tel/Dirección/Correo bloqueados` : "Selecciona un cliente del buscador o deja huérfana con nombre manual. Tel/Correo/Dirección se bloquean al vincular."}
          onClose={volverALista}
        >
          <FichaForm
            key={`${editing?.id ?? "new"}-${prefillCliente?.id_cliente ?? "no-prefill"}`}
            ficha={editing}
            preselectedCliente={prefillCliente}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={volverALista}
          />
        </FormPanel>

        <ConfirmDialog
          open={deleting !== null}
          title="Eliminar ficha técnica"
          message={`¿Seguro que deseas eliminar la ficha de "${deleting ? fichaClienteNombre(deleting) : ""}"? Esta acción no se puede deshacer.`}
          loading={deleteLoading}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      </div>
    )
  }

  if (modo === "detail" && selected) {
    const linked = fichaIsLinked(selected)
    const clienteObj = (selected as any).cliente as Cliente | null | undefined
    return (
      <div className={styles['sys-section']}>
        <section className={styles['sys-panel']} aria-label="Detalle de la ficha técnica">
          <header className={styles['sys-panel-head']}>
            <div className={styles['sys-panel-heading']}>
              <p className={styles['sys-topbar-eyebrow']}>Ficha técnica {linked && <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginLeft: "0.5rem", fontSize: "0.6875rem", padding: "0.15rem 0.5rem", borderRadius: "999px", background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.18)", fontWeight: 600 }}><IconLink size={12} /> Vinculada</span>}</p>
              <h2 className={styles['sys-panel-title']}>{fichaClienteNombre(selected)}</h2>
              <p className={styles['sys-panel-sub']} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
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
                {linked && clienteObj && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span style={{ fontSize: "0.75rem", color: "hsl(var(--primary))" }}>{clienteObj.correo_cliente || clienteObj.telefono || ""}</span>
                  </>
                )}
              </p>
            </div>
            <div className={styles['sys-detail-actions']}>
              <button
                type="button"
                className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`}
                title="Editar"
                aria-label={`Editar la ficha de ${fichaClienteNombre(selected)}`}
                onClick={() => openEdit(selected)}
              >
                <IconPencil size={17} aria-hidden="true" />
              </button>
              {allowDelete && (
                <button
                  type="button"
                  className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--danger']}`}
                  title="Eliminar (solo admin)"
                  aria-label={`Eliminar la ficha de ${fichaClienteNombre(selected)}`}
                  onClick={() => setDeleting(selected)}
                >
                  <IconTrash size={17} aria-hidden="true" />
                </button>
              )}
              <span style={{ width: "1px", height: "1.5rem", background: "hsl(var(--border))", margin: "0 0.25rem" }} aria-hidden="true" />
              <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={volverALista} style={{ minHeight: "32px", padding: "0 0.875rem", fontSize: "0.8125rem" }}>
                <IconX size={14} aria-hidden="true" />
                Cerrar
              </button>
            </div>
          </header>
          <div className={styles['sys-panel-body']}>
            {garantiaLoading ? (
              <Spinner label="Consultando garantía..." />
            ) : (
              <>
                {garantia && (
                  <div className={`${styles['sys-garantia']} ${garantia.enGarantia ? styles['sys-garantia--ok'] : styles['sys-garantia--off']}`}>
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

                <div className={styles['sys-detail-group']}>
                  <h3>Cliente y servicio</h3>
                  <dl className={styles['sys-detail-grid']}>
                    <div><dt>Cliente</dt><dd>{fichaClienteNombre(selected)} {linked ? <span style={{ marginLeft: "0.375rem", fontSize: "0.6875rem", padding: "0.1rem 0.4rem", borderRadius: "999px", background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>vinculada</span> : <span style={{ marginLeft: "0.375rem", fontSize: "0.6875rem", padding: "0.1rem 0.4rem", borderRadius: "999px", background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}>huérfana</span>}</dd></div>
                    {linked && clienteObj && <div><dt>Cliente (BD)</dt><dd><code>{clienteObj.id_cliente}</code> {clienteObj.nombre_cliente} {clienteObj.apellido_cliente}</dd></div>}
                    <div><dt>Teléfono ficha</dt><dd>{selected.telefonoCliente || "—"}</dd></div>
                    {clienteObj?.telefono && <div><dt>Teléfono cliente</dt><dd>{clienteObj.telefono}</dd></div>}
                    <div><dt>Dirección ficha</dt><dd>{selected.direccionCliente || "—"}</dd></div>
                    {clienteObj?.dir && <div><dt>Dirección cliente</dt><dd>{clienteObj.dir}</dd></div>}
                    <div><dt>Correo ficha</dt><dd>{selected.correoCliente || "—"}</dd></div>
                    {clienteObj?.correo_cliente && <div><dt>Correo cliente</dt><dd>{clienteObj.correo_cliente}</dd></div>}
                    <div><dt>Servicio</dt><dd>{selected.servicio || "—"}</dd></div>
                    <div><dt>Responsable</dt><dd>{selected.nombreResponsable || "—"}</dd></div>
                  </dl>
                </div>

                <div className={styles['sys-detail-group']}>
                  <h3>Equipo</h3>
                  <dl className={styles['sys-detail-grid']}>
                    <div><dt>Tipo</dt><dd>{tipoEquipoLabel(selected.tipoEquipo)}</dd></div>
                    <div><dt>Marca / Modelo</dt><dd>{[selected.marcaEquipo, selected.modeloEquipo].filter(Boolean).join(" ") || "—"}</dd></div>
                    <div><dt>Serial</dt><dd><code>{selected.serialEquipo || "—"}</code></dd></div>
                    <div><dt>Referencia</dt><dd>{selected.referencia || "—"}</dd></div>
                    <div><dt>Adquisición</dt><dd>{formatDate(selected.fechaAdquisicion)}</dd></div>
                    <div><dt>Garantía</dt><dd>{selected.tiempoGarantiaMeses ? `${selected.tiempoGarantiaMeses} meses` : "—"}</dd></div>
                  </dl>
                </div>

                <div className={styles['sys-detail-group']}>
                  <h3>Especificaciones</h3>
                  <dl className={styles['sys-detail-grid']}>
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
                  <div className={styles['sys-detail-group']}>
                    <h3>Observaciones</h3>
                    <p className={styles['sys-detail-text']}>{selected.observaciones}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <ConfirmDialog
          open={deleting !== null}
          title="Eliminar ficha técnica"
          message={`¿Seguro que deseas eliminar la ficha de "${deleting ? fichaClienteNombre(deleting) : ""}"? Esta acción no se puede deshacer.`}
          loading={deleteLoading}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      </div>
    )
  }

  return (
    <div className={styles['sys-section']}>
      {/* Header — Material: eyebrow + title + trailing primary */}
      <div className={styles['sys-section-toolbar']} style={{ alignItems: "flex-end" }}>
        <div className={styles['sys-panel-heading']} style={{ minWidth: 0 }}>
          <h2 className={styles['sys-panel-title']} style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Fichas técnicas</h2>
          {!loading && Array.isArray(fichas) && (
            <p className={styles['sys-panel-sub']} aria-live="polite" style={{ fontSize: "0.8125rem" }}>
              {fichas.length === 0
                ? hasFilters ? "Sin resultados para los filtros" : "Sin equipos aún"
                : `${fichas.length} ${fichas.length === 1 ? "equipo" : "equipos"}${hasFilters ? " · filtrado" : ""}`}
            </p>
          )}
        </div>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={() => openCreate()}>
          <IconPlus size={16} aria-hidden="true" />
          Nueva ficha
        </button>
      </div>

      {/* Filter bar — Material search + filter */}
      <div className={styles['sys-filter-bar']} role="search" aria-label="Filtros de fichas técnicas">
        <div className={styles['sys-search']} style={{ flex: "1 1 14rem", maxWidth: "22rem" }}>
          <IconSearch size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar fichas por cliente, serial, ID o marca"
            placeholder="Buscar por cliente, serial, ID, marca…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
              className={styles['sys-icon-btn']}
              style={{ width: "1.75rem", height: "1.75rem" }}
            >
              <IconX size={14} aria-hidden="true" />
            </button>
          )}
        </div>
        <span className={styles['sys-filter-divider']} aria-hidden="true" />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <IconAdjustmentsHorizontal size={16} aria-hidden="true" style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          <select
            className={styles['sys-select']}
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
            className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`}
            onClick={() => {
              setSearch("")
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
      ) : !Array.isArray(fichas) || fichas.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Sin resultados" : "Aún no hay fichas técnicas"}
          description={
            hasFilters
              ? "No encontramos fichas con ese término o tipo. Prueba con otro nombre, serial, ID o marca."
              : "Crea la primera ficha para comenzar a registrar el equipamiento de tus clientes."
          }
          icon={<IconFileText size={22} aria-hidden="true" />}
          action={
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={() => openCreate()}>
              <IconPlus size={16} aria-hidden="true" />
              {hasFilters ? "Limpiar filtros y crear" : "Nueva ficha"}
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop: Material Data Table — primary view */}
          <div className={styles['sys-fichas-table']}>
            <div className={styles['sys-table-wrap']}>
              <table className={`${styles['sys-table']} ${styles['sys-table--dense']} ${styles['sys-table--clickable']}`} aria-label="Listado de fichas técnicas">
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
                  {(Array.isArray(fichas) ? fichas : []).map((ficha) => (
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
                      aria-label={`Ver la ficha de ${fichaClienteNombre(ficha)}, ${tipoEquipoLabel(ficha.tipoEquipo)}, serial ${ficha.serialEquipo || "sin serial"}`}
                    >
                      <td data-label="Cliente">
                        <div className={styles['sys-cell-with-avatar']}>
                          <span className={styles['sys-cell-avatar']} aria-hidden="true">{initials(fichaClienteNombre(ficha))}</span>
                          <span className={styles['sys-cell-stack']}>
                            <span className={styles['sys-cell-main']} title={fichaClienteNombre(ficha)} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                              {fichaClienteNombre(ficha)}
                              {fichaIsLinked(ficha) ? <IconLink size={12} style={{ color: "hsl(var(--primary))" }} aria-label="Vinculada a cliente" /> : null}
                            </span>
                            <span className={styles['sys-cell-sub']} title={fichaClienteSub(ficha)}>{fichaClienteSub(ficha)}</span>
                          </span>
                        </div>
                      </td>
                      <td data-label="Equipo">
                        <span className={styles['sys-cell-stack']}>
                          <span className={styles['sys-cell-main']} style={{ fontSize: "0.8125rem" }} title={[ficha.marcaEquipo, ficha.modeloEquipo].filter(Boolean).join(" ")}>
                            {[ficha.marcaEquipo, ficha.modeloEquipo].filter(Boolean).join(" ") || "—"}
                          </span>
                          <span className={styles['sys-cell-sub']}>{ficha.servicio || "Sin servicio"}</span>
                        </span>
                      </td>
                      <td data-label="Serial"><code title={ficha.serialEquipo || ""}>{ficha.serialEquipo || "—"}</code></td>
                      <td data-label="Tipo"><span className={styles['sys-badge']}>{tipoEquipoLabel(ficha.tipoEquipo)}</span></td>
                      <td data-label="Registro" style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.75rem" }}>{formatDate(ficha.fechaRealizacion ?? ficha.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar ficha técnica"
        message={`¿Seguro que deseas eliminar la ficha de "${deleting ? fichaClienteNombre(deleting) : ""}"? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
