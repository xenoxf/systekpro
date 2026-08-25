import React, { useEffect, useRef, useState } from "react"
import {
  IconSearch,
  IconEye,
  IconPencil,
  IconTrash,
  IconShieldCheck,
  IconPlus,
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
import { Modal, ConfirmDialog, EmptyState, Spinner, formatDate } from "./ui"
import FichaForm from "./FichaForm"

function tipoEquipoLabel(value: string): string {
  return TIPOS_EQUIPO.find((t) => t.value === value)?.label ?? value
}

export default function FichasSection() {
  const [fichas, setFichas] = useState<FichaTecnica[]>([])
  const [loading, setLoading] = useState(true)
  const [serial, setSerial] = useState("")
  const [tipoEquipo, setTipoEquipo] = useState<TipoEquipo | "">("")
  const [hasFilters, setHasFilters] = useState(false)
  const firstLoad = useRef(true)

  const [detail, setDetail] = useState<FichaTecnica | null>(null)
  const [garantia, setGarantia] = useState<GarantiaResponse | null>(null)
  const [garantiaLoading, setGarantiaLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FichaTecnica | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<FichaTecnica | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  useEffect(() => {
    setHasFilters(Boolean(serial.trim()) || Boolean(tipoEquipo))
  }, [serial, tipoEquipo])

  async function openDetail(ficha: FichaTecnica) {
    setDetail(ficha)
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
    setFormOpen(true)
  }

  function openEdit(ficha: FichaTecnica) {
    setEditing(ficha)
    setFormOpen(true)
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
      setFormOpen(false)
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
      await loadFichas()
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="sys-section">
      <div className="sys-section-toolbar">
        <div className="sys-search">
          <IconSearch size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Filtrar fichas por serial del equipo"
            placeholder="Filtrar por serial..."
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />
        </div>
        <select
          className="sys-select"
          aria-label="Filtrar fichas por tipo de equipo"
          value={tipoEquipo}
          onChange={(e) => setTipoEquipo(e.target.value as TipoEquipo | "")}
        >
          <option value="">Todos los tipos</option>
          {TIPOS_EQUIPO.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="sys-btn sys-btn--ghost"
          onClick={() => {
            setSerial("")
            setTipoEquipo("")
          }}
          disabled={!hasFilters}
        >
          Limpiar filtros
        </button>
        <button type="button" className="sys-btn sys-btn--primary" onClick={openCreate}>
          <IconPlus size={16} />
          Nueva ficha
        </button>
      </div>

      {loading ? (
        <Spinner label="Cargando fichas..." />
      ) : fichas.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Sin resultados" : "Aún no hay fichas técnicas"}
          description={
            hasFilters ? "Intenta con otro serial o tipo de equipo." : "Crea la primera ficha para comenzar."
          }
        />
      ) : (
        <div className="sys-table-wrap">
          <table className="sys-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Equipo</th>
                <th scope="col">Serial</th>
                <th scope="col">Servicio</th>
                <th scope="col">Fecha</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fichas.map((ficha) => (
                <tr key={ficha.id}>
                  <td data-label="Cliente">{ficha.nombreCliente}</td>
                  <td data-label="Equipo">
                    <span className="sys-cell-main">{ficha.marcaEquipo} {ficha.modeloEquipo}</span>
                    <span className="sys-cell-sub">{tipoEquipoLabel(ficha.tipoEquipo)}</span>
                  </td>
                  <td data-label="Serial"><code>{ficha.serialEquipo}</code></td>
                  <td data-label="Servicio">{ficha.servicio}</td>
                  <td data-label="Fecha">{formatDate(ficha.fechaRealizacion ?? ficha.createdAt)}</td>
                  <td data-label="Acciones">
                    <div className="sys-row-actions">
                      <button
                        type="button"
                        className="sys-icon-btn"
                        title="Ver detalle"
                        aria-label={`Ver detalle de la ficha de ${ficha.nombreCliente}`}
                        onClick={() => openDetail(ficha)}
                      >
                        <IconEye size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sys-icon-btn"
                        title="Editar"
                        aria-label={`Editar la ficha de ${ficha.nombreCliente}`}
                        onClick={() => openEdit(ficha)}
                      >
                        <IconPencil size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sys-icon-btn sys-icon-btn--danger"
                        title="Eliminar"
                        aria-label={`Eliminar la ficha de ${ficha.nombreCliente}`}
                        onClick={() => setDeleting(ficha)}
                      >
                        <IconTrash size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={detail !== null} title="Detalle de ficha técnica" onClose={() => setDetail(null)} size="lg">
        {detail && (
          <>
            {garantiaLoading ? (
              <Spinner label="Consultando garantía..." />
            ) : garantia ? (
              <div className={`sys-garantia ${garantia.enGarantia ? "sys-garantia--ok" : "sys-garantia--off"}`}>
                <IconShieldCheck size={20} />
                <div>
                  <strong>{garantia.tieneGarantia ? (garantia.enGarantia ? "En garantía" : "Garantía vencida") : "Sin garantía registrada"}</strong>
                  <span>
                    {garantia.venceEl && ` Vence el ${formatDate(garantia.venceEl)}`}
                    {garantia.diasRestantes != null &&
                      ` (${garantia.diasRestantes >= 0 ? `${garantia.diasRestantes} días restantes` : `${Math.abs(garantia.diasRestantes)} días de retraso`})`}
                  </span>
                </div>
              </div>
            ) : null}

            <dl className="sys-detail-grid">
              <div><dt>Cliente</dt><dd>{detail.nombreCliente}</dd></div>
              <div><dt>Teléfono</dt><dd>{detail.telefonoCliente}</dd></div>
              <div><dt>Dirección</dt><dd>{detail.direccionCliente || "—"}</dd></div>
              <div><dt>Correo</dt><dd>{detail.correoCliente || "—"}</dd></div>
              <div><dt>Servicio</dt><dd>{detail.servicio}</dd></div>
              <div><dt>Tipo de equipo</dt><dd>{tipoEquipoLabel(detail.tipoEquipo)}</dd></div>
              <div><dt>Responsable</dt><dd>{detail.nombreResponsable}</dd></div>
              <div><dt>Marca / Modelo</dt><dd>{detail.marcaEquipo} {detail.modeloEquipo}</dd></div>
              <div><dt>Serial</dt><dd><code>{detail.serialEquipo}</code></dd></div>
              <div><dt>Referencia</dt><dd>{detail.referencia || "—"}</dd></div>
              <div><dt>Adquisición</dt><dd>{formatDate(detail.fechaAdquisicion)}</dd></div>
              <div><dt>Garantía</dt><dd>{detail.tiempoGarantiaMeses ? `${detail.tiempoGarantiaMeses} meses` : "—"}</dd></div>
              {(detail.procesadorMarca || detail.procesadorModelo) && (
                <div><dt>Procesador</dt><dd>{[detail.procesadorMarca, detail.procesadorModelo].filter(Boolean).join(" ")}</dd></div>
              )}
              {detail.nucleosCpu != null && <div><dt>Núcleos</dt><dd>{detail.nucleosCpu}</dd></div>}
              {detail.velocidadProcesador && <div><dt>Velocidad CPU</dt><dd>{detail.velocidadProcesador}</dd></div>}
              {detail.memoriaRamGb != null && <div><dt>RAM</dt><dd>{detail.memoriaRamGb} GB</dd></div>}
              {detail.tecnologiaDisco1 && (
                <div><dt>Disco 1</dt><dd>{detail.tecnologiaDisco1}{detail.capacidadDisco1Gb ? ` · ${detail.capacidadDisco1Gb} GB` : ""}</dd></div>
              )}
              {detail.tecnologiaDisco2 && (
                <div><dt>Disco 2</dt><dd>{detail.tecnologiaDisco2}{detail.capacidadDisco2Gb ? ` · ${detail.capacidadDisco2Gb} GB` : ""}</dd></div>
              )}
              {detail.tarjetaVideoIntegrada && <div><dt>Video integrado</dt><dd>Sí</dd></div>}
              {detail.tarjetaVideoIndependiente && <div><dt>Video independiente</dt><dd>Sí</dd></div>}
              {detail.marcaMouse && <div><dt>Mouse</dt><dd>{detail.marcaMouse}</dd></div>}
              {detail.observaciones && (
                <div className="sys-detail-full"><dt>Observaciones</dt><dd>{detail.observaciones}</dd></div>
              )}
            </dl>
          </>
        )}
      </Modal>

      <Modal
        open={formOpen}
        title={editing ? "Editar ficha técnica" : "Nueva ficha técnica"}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        size="lg"
      >
        <FichaForm
          key={editing?.id ?? "new"}
          ficha={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => { setFormOpen(false); setEditing(null) }}
        />
      </Modal>

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
