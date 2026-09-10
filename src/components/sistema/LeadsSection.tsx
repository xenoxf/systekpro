import React, { useEffect, useState } from "react"
import { IconMail, IconPhone, IconTrash, IconEye, IconInbox, IconMessage } from "@tabler/icons-react"
import { leadsService, type Lead } from "@/services/leads"
import { isApiError } from "@/services/api"
import { getSession } from "@/services/auth"
import { canDelete } from "@/services/permissions"
import { toast } from "@/components/starwind/toast"
import { Drawer, ConfirmDialog, EmptyState, Spinner, formatDate } from "./ui"
import styles from "@/styles/SistemaUI.module.css"

function servicioLabel(s: string): string {
  const map: Record<string, string> = {
    mantenimiento: "Mantenimiento",
    redes: "Instalación de redes",
    cableado: "Cableado estructurado",
    configuracion: "Config. routers/switches",
    soporte: "Soporte técnico",
    wifi: "Redes inalámbricas",
    otro: "Otro",
  }
  return map[s] ?? s
}

export default function LeadsSection() {
  const [currentUser] = useState(() => getSession()?.user ?? null)
  const allowDelete = canDelete(currentUser)

  const [items, setItems] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [detail, setDetail] = useState<Lead | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [deleting, setDeleting] = useState<Lead | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function load(nextPage = page) {
    setLoading(true)
    try {
      const res = await leadsService.list({ page: nextPage, limit })
      setItems(res.data)
      setTotal(res.meta.total)
      setTotalPages(res.meta.totalPages || 1)
      setPage(res.meta.page)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [])

  async function openDetail(row: Lead) {
    setDetail(row)
    setDetailLoading(true)
    try {
      const full = await leadsService.get(row.id)
      setDetail(full)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await leadsService.remove(deleting.id)
      toast.success("Lead eliminado")
      setDeleting(null)
      if (detail && detail.id === deleting.id) setDetail(null)
      const nextTotal = total - 1
      const nextPages = Math.max(1, Math.ceil(nextTotal / limit))
      const nextPage = page > nextPages ? nextPages : page
      await load(nextPage)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className={styles['sys-section']}>
      <div className={styles['sys-section-toolbar']} style={{ alignItems: "flex-end" }}>
        <div className={styles['sys-panel-heading']} style={{ minWidth: 0 }}>
          <h2 className={styles['sys-panel-title']} style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Formularios recibidos</h2>
          {!loading && (
            <p className={styles['sys-panel-sub']} style={{ fontSize: "0.8125rem" }}>
              {total === 0 ? "Sin formularios aún" : `${total} ${total === 1 ? "formulario" : "formularios"} · página ${page} de ${totalPages}`}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <Spinner label="Cargando formularios..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay formularios recibidos"
          description="Los mensajes enviados desde el formulario público de contacto aparecerán aquí."
          icon={<IconInbox size={22} aria-hidden="true" />}
        />
      ) : (
        <>
          <div className={styles['sys-table-wrap']}>
            <table className={styles['sys-table']}>
              <thead>
                <tr>
                  <th scope="col">Contacto</th>
                  <th scope="col">Servicio</th>
                  <th scope="col">Mensaje</th>
                  <th scope="col">Fecha</th>
                  <th scope="col" style={{ width: "8rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr key={lead.id}>
                    <td data-label="Contacto">
                      <span className={styles['sys-cell-stack']}>
                        <span className={styles['sys-cell-main']} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                          <IconMessage size={14} aria-hidden="true" style={{ opacity: 0.7 }} /> {lead.nombre}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
                          <IconMail size={13} aria-hidden="true" style={{ opacity: 0.7 }} /> {lead.email}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
                          <IconPhone size={13} aria-hidden="true" style={{ opacity: 0.7 }} /> {lead.numero}
                        </span>
                      </span>
                    </td>
                    <td data-label="Servicio"><span className={styles['sys-badge']}>{servicioLabel(lead.servicio)}</span></td>
                    <td data-label="Mensaje" style={{ maxWidth: "22rem" }}>
                      <span style={{ display: "block", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={lead.message}>
                        {lead.message}
                      </span>
                    </td>
                    <td data-label="Fecha" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>{formatDate(lead.createdAt)}</td>
                    <td data-label="Acciones">
                      <div className={styles['sys-row-actions']}>
                        <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`} title="Ver detalle" onClick={() => openDetail(lead)} aria-label={`Ver ${lead.nombre}`}>
                          <IconEye size={16} aria-hidden="true" />
                        </button>
                        {allowDelete && (
                          <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--danger']}`} title="Eliminar (solo admin)" onClick={() => setDeleting(lead)} aria-label={`Eliminar ${lead.nombre}`}>
                            <IconTrash size={16} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>Página {page} de {totalPages} · {total} registros</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} disabled={page <= 1} onClick={() => load(page - 1)}>Anterior</button>
                <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} disabled={page >= totalPages} onClick={() => load(page + 1)}>Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}

      <Drawer open={detail !== null} title={detail ? `Formulario · ${detail.nombre}` : "Detalle"} onClose={() => setDetail(null)}>
        {detailLoading || !detail ? <Spinner label="Cargando formulario..." /> : (
          <dl className={styles['sys-detail-grid']}>
            <div><dt>Nombre</dt><dd>{detail.nombre}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${detail.email}`} style={{ color: "hsl(var(--primary))" }}>{detail.email}</a></dd></div>
            <div><dt>Teléfono</dt><dd><a href={`tel:${detail.numero}`} style={{ color: "hsl(var(--primary))" }}>{detail.numero}</a></dd></div>
            <div><dt>Servicio</dt><dd><span className={styles['sys-badge']}>{servicioLabel(detail.servicio)}</span></dd></div>
            <div className={styles['sys-detail-full']}><dt>Mensaje</dt><dd style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{detail.message}</dd></div>
            <div><dt>Recibido</dt><dd>{formatDate(detail.createdAt)}</dd></div>
            <div><dt>Actualizado</dt><dd>{formatDate(detail.updatedAt)}</dd></div>
            <div className={styles['sys-detail-full']}><dt>ID</dt><dd><code>{detail.id}</code></dd></div>
          </dl>
        )}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar formulario"
        message={`¿Seguro que deseas eliminar el formulario de "${deleting?.nombre ?? ""}"? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
