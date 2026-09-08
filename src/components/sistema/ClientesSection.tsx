import React, { useEffect, useState } from "react"
import { IconUsersGroup, IconPencil, IconTrash, IconPlus, IconEye, IconMail, IconPhone } from "@tabler/icons-react"
import { clientesService, type Cliente, type CreateClienteDto } from "@/services/clientes"
import { isApiError } from "@/services/api"
import { getSession } from "@/services/auth"
import { canDelete } from "@/services/permissions"
import { toast } from "@/components/starwind/toast"
import { Drawer, ConfirmDialog, EmptyState, Spinner, formatDate } from "./ui"
import styles from "@/styles/SistemaUI.module.css"

interface FormState {
  nombre_cliente: string
  apellido_cliente: string
  correo_cliente: string
  telefono: string
  dir: string
  tipo_cliente: string
}

export default function ClientesSection() {
  const [currentUser] = useState(() => getSession()?.user ?? null)
  const allowDelete = canDelete(currentUser)
  const [items, setItems] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [detail, setDetail] = useState<Cliente | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState<FormState>({ nombre_cliente: "", apellido_cliente: "", correo_cliente: "", telefono: "", dir: "", tipo_cliente: "" })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<Cliente | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function load(nextPage = page) {
    setLoading(true)
    try {
      const res = await clientesService.list({ page: nextPage, limit })
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

  async function openDetail(row: Cliente) {
    const id = row.id_cliente ?? row.id
    setDetail(row)
    setDetailLoading(true)
    try {
      const full = await clientesService.get(id)
      setDetail(full)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDetailLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre_cliente: "", apellido_cliente: "", correo_cliente: "", telefono: "", dir: "", tipo_cliente: "" })
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(row: Cliente) {
    setEditing(row)
    setForm({
      nombre_cliente: row.nombre_cliente,
      apellido_cliente: row.apellido_cliente,
      correo_cliente: row.correo_cliente ?? "",
      telefono: row.telefono ?? "",
      dir: row.dir ?? "",
      tipo_cliente: row.tipo_cliente ?? "",
    })
    setFormError(null)
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const nombre = form.nombre_cliente.trim()
    const apellido = form.apellido_cliente.trim()
    if (nombre.length < 2 || nombre.length > 80) { setFormError("Nombre debe tener entre 2 y 80 caracteres."); return }
    if (apellido.length < 2 || apellido.length > 80) { setFormError("Apellido debe tener entre 2 y 80 caracteres."); return }
    if (form.correo_cliente && form.correo_cliente.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo_cliente.trim())) {
      setFormError("Correo electrónico no válido."); return
    }
    const dto: CreateClienteDto = {
      nombre_cliente: nombre,
      apellido_cliente: apellido,
      correo_cliente: form.correo_cliente.trim() || null,
      telefono: form.telefono.trim() || null,
      dir: form.dir.trim() || null,
      tipo_cliente: form.tipo_cliente.trim() || null,
    }
    setSubmitting(true)
    try {
      if (editing) {
        const id = editing.id_cliente ?? editing.id
        await clientesService.update(id, dto)
        toast.success("Cliente actualizado")
      } else {
        await clientesService.create(dto)
        toast.success("Cliente creado")
      }
      setFormOpen(false)
      await load(page)
    } catch (err) {
      if (isApiError(err)) {
        if (err.statusCode === 409 || err.statusCode === 400) setFormError(err.messages.join("\n"))
        else toast.error(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      const id = deleting.id_cliente ?? deleting.id
      await clientesService.remove(id)
      toast.success("Cliente eliminado")
      setDeleting(null)
      if (detail && (detail.id_cliente ?? detail.id) === id) setDetail(null)
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

  function initials(c: Cliente) {
    return `${c.nombre_cliente[0] ?? ""}${c.apellido_cliente[0] ?? ""}`.toUpperCase()
  }

  return (
    <div className={styles['sys-section']}>
      <div className={styles['sys-section-toolbar']} style={{ alignItems: "flex-end" }}>
        <div className={styles['sys-panel-heading']} style={{ minWidth: 0 }}>
          <h2 className={styles['sys-panel-title']} style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Clientes</h2>
          {!loading && (
            <p className={styles['sys-panel-sub']} style={{ fontSize: "0.8125rem" }}>
              {total === 0 ? "Sin clientes aún" : `${total} ${total === 1 ? "cliente" : "clientes"} · página ${page} de ${totalPages}`}
            </p>
          )}
        </div>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={openCreate}>
          <IconPlus size={16} aria-hidden="true" />
          Nuevo cliente
        </button>
      </div>

      {loading ? (
        <Spinner label="Cargando clientes..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay clientes registrados"
          description="Registra tu primer cliente para vincular fichas técnicas y órdenes."
          icon={<IconUsersGroup size={22} aria-hidden="true" />}
          action={
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={openCreate}>
              <IconPlus size={16} aria-hidden="true" />
              Nuevo cliente
            </button>
          }
        />
      ) : (
        <>
          <div className={styles['sys-table-wrap']}>
            <table className={styles['sys-table']}>
              <thead>
                <tr>
                  <th scope="col">Cliente</th>
                  <th scope="col">Contacto</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Registro</th>
                  <th scope="col" style={{ width: "10rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id_cliente ?? c.id}>
                    <td data-label="Cliente">
                      <div className={styles['sys-cell-with-avatar']}>
                        <span className={styles['sys-cell-avatar']} aria-hidden="true">{initials(c)}</span>
                        <span className={styles['sys-cell-stack']}>
                          <span className={styles['sys-cell-main']}>{c.nombre_cliente} {c.apellido_cliente}</span>
                          <span className={styles['sys-cell-sub']}>{c.dir || "Sin dirección"}</span>
                        </span>
                      </div>
                    </td>
                    <td data-label="Contacto">
                      <span className={styles['sys-cell-stack']} style={{ gap: "0.15rem" }}>
                        {c.correo_cliente ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem" }}>
                            <IconMail size={13} aria-hidden="true" style={{ opacity: 0.7 }} /> {c.correo_cliente}
                          </span>
                        ) : <span className={styles['sys-cell-sub']}>Sin correo</span>}
                        {c.telefono ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem" }}>
                            <IconPhone size={13} aria-hidden="true" style={{ opacity: 0.7 }} /> {c.telefono}
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td data-label="Tipo"><span className={styles['sys-badge']}>{c.tipo_cliente || "—"}</span></td>
                    <td data-label="Registro" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>{formatDate(c.createdAt)}</td>
                    <td data-label="Acciones">
                      <div className={styles['sys-row-actions']}>
                        <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`} title="Ver" onClick={() => openDetail(c)} aria-label={`Ver ${c.nombre_cliente}`}>
                          <IconEye size={16} aria-hidden="true" />
                        </button>
                        <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`} title="Editar" onClick={() => openEdit(c)} aria-label={`Editar ${c.nombre_cliente}`}>
                          <IconPencil size={16} aria-hidden="true" />
                        </button>
                        {allowDelete && (
                          <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--danger']}`} title="Eliminar (solo admin)" onClick={() => setDeleting(c)} aria-label={`Eliminar ${c.nombre_cliente}`}>
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

      <Drawer open={detail !== null} title={detail ? `${detail.nombre_cliente} ${detail.apellido_cliente}` : "Detalle"} onClose={() => setDetail(null)}>
        {detailLoading || !detail ? <Spinner label="Cargando cliente..." /> : (
          <dl className={styles['sys-detail-grid']}>
            <div><dt>Nombre</dt><dd>{detail.nombre_cliente} {detail.apellido_cliente}</dd></div>
            <div><dt>Correo</dt><dd>{detail.correo_cliente || "—"}</dd></div>
            <div><dt>Teléfono</dt><dd>{detail.telefono || "—"}</dd></div>
            <div><dt>Dirección</dt><dd>{detail.dir || "—"}</dd></div>
            <div><dt>Tipo</dt><dd>{detail.tipo_cliente || "—"}</dd></div>
            <div><dt>Fichas asociadas</dt><dd>{Array.isArray(detail.fichasTecnicas) ? detail.fichasTecnicas.length : "—"}</dd></div>
            <div><dt>Creado</dt><dd>{formatDate(detail.createdAt)}</dd></div>
            <div><dt>Actualizado</dt><dd>{formatDate(detail.updatedAt)}</dd></div>
            <div className={styles['sys-detail-full']}><dt>ID</dt><dd><code>{detail.id_cliente ?? detail.id}</code></dd></div>
          </dl>
        )}
      </Drawer>

      <Drawer
        open={formOpen}
        title={editing ? `Editar cliente · ${editing.nombre_cliente}` : "Nuevo cliente"}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => setFormOpen(false)} disabled={submitting}>Cancelar</button>
            <button type="submit" form="cliente-form" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} disabled={submitting}>{submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear cliente"}</button>
          </>
        }
      >
        <form id="cliente-form" className={styles['sys-form']} onSubmit={handleSubmit}>
          <div className={styles['sys-form-grid']}>
            <label className={styles['sys-field']}>
              <span>Nombre *</span>
              <input className={styles['sys-input']} value={form.nombre_cliente} required minLength={2} maxLength={80} onChange={(e) => setForm((f) => ({ ...f, nombre_cliente: e.target.value }))} placeholder="Ej: Carlos" />
            </label>
            <label className={styles['sys-field']}>
              <span>Apellido *</span>
              <input className={styles['sys-input']} value={form.apellido_cliente} required minLength={2} maxLength={80} onChange={(e) => setForm((f) => ({ ...f, apellido_cliente: e.target.value }))} placeholder="Ej: Gómez" />
            </label>
            <label className={styles['sys-field']}>
              <span>Correo</span>
              <input className={styles['sys-input']} type="email" value={form.correo_cliente} maxLength={120} onChange={(e) => setForm((f) => ({ ...f, correo_cliente: e.target.value }))} placeholder="carlos@example.com" />
            </label>
            <label className={styles['sys-field']}>
              <span>Teléfono</span>
              <input className={styles['sys-input']} value={form.telefono} maxLength={30} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} placeholder="3001234567" />
            </label>
            <label className={`${styles['sys-field']} ${styles['sys-field--full']}`}>
              <span>Dirección</span>
              <input className={styles['sys-input']} value={form.dir} maxLength={150} onChange={(e) => setForm((f) => ({ ...f, dir: e.target.value }))} placeholder="Calle 10 #5-25" />
            </label>
            <label className={styles['sys-field']}>
              <span>Tipo de cliente</span>
              <input className={styles['sys-input']} value={form.tipo_cliente} maxLength={50} onChange={(e) => setForm((f) => ({ ...f, tipo_cliente: e.target.value }))} placeholder="Ej: Premium, Corporativo" />
            </label>
          </div>
          {formError && <pre className={`${styles['sys-error']} ${styles['sys-error--list']}`}>{formError}</pre>}
        </form>
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar cliente"
        message={`¿Seguro que deseas eliminar al cliente "${deleting ? `${deleting.nombre_cliente} ${deleting.apellido_cliente}` : ""}"?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
