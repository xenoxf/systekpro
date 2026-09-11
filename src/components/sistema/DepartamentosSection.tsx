import React, { useEffect, useState } from "react"
import { IconBuilding, IconPencil, IconTrash, IconPlus, IconEye, IconSearch, IconX } from "@tabler/icons-react"
import { departamentosService, type Departamento, type CreateDepartamentoDto } from "@/services/departamentos"
import { isApiError } from "@/services/api"
import { getSession } from "@/services/auth"
import { canDelete } from "@/services/permissions"
import { toast } from "@/components/starwind/toast"
import { Drawer, ConfirmDialog, EmptyState, Spinner, formatDate } from "./ui"
import styles from "@/styles/SistemaUI.module.css"

interface FormState {
  nombre_departamento: string
  descripcion: string
}

export default function DepartamentosSection() {
  const [currentUser] = useState(() => getSession()?.user ?? null)
  const allowDelete = canDelete(currentUser)
  const [items, setItems] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [detail, setDetail] = useState<Departamento | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Departamento | null>(null)
  const [form, setForm] = useState<FormState>({ nombre_departamento: "", descripcion: "" })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<Departamento | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function load(nextPage = page, searchOverride?: string) {
    setLoading(true)
    try {
      const term = searchOverride !== undefined ? searchOverride : debouncedSearch
      const res = await departamentosService.list({ page: nextPage, limit, search: term || undefined })
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

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    load(1, debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  async function openDetail(row: Departamento) {
    const id = row.id_departamento ?? row.id
    setDetail(row)
    setDetailLoading(true)
    try {
      const full = await departamentosService.get(id)
      setDetail(full)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDetailLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre_departamento: "", descripcion: "" })
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(row: Departamento) {
    setEditing(row)
    setForm({ nombre_departamento: row.nombre_departamento, descripcion: row.descripcion ?? "" })
    setFormError(null)
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const nombre = form.nombre_departamento.trim()
    if (nombre.length < 2 || nombre.length > 100) {
      setFormError("El nombre debe tener entre 2 y 100 caracteres.")
      return
    }
    if (form.descripcion && form.descripcion.length > 1000) {
      setFormError("La descripción no puede superar 1000 caracteres.")
      return
    }
    const dto: CreateDepartamentoDto = {
      nombre_departamento: nombre,
      descripcion: form.descripcion.trim() || null,
    }
    setSubmitting(true)
    try {
      if (editing) {
        const id = editing.id_departamento ?? editing.id
        await departamentosService.update(id, dto)
        toast.success("Departamento actualizado")
      } else {
        await departamentosService.create(dto)
        toast.success("Departamento creado")
      }
      setFormOpen(false)
      await load(page, debouncedSearch)
    } catch (err) {
      if (isApiError(err)) {
        if (err.statusCode === 409) setFormError(err.messages.join("\n"))
        else if (err.statusCode === 400) setFormError(err.messages.join("\n"))
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
      const id = deleting.id_departamento ?? deleting.id
      await departamentosService.remove(id)
      toast.success("Departamento eliminado")
      setDeleting(null)
      if (detail && (detail.id_departamento ?? detail.id) === id) setDetail(null)
      // if last item on page, go to prev page
      const nextTotal = total - 1
      const nextPages = Math.max(1, Math.ceil(nextTotal / limit))
      const nextPage = page > nextPages ? nextPages : page
      await load(nextPage, debouncedSearch)
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
          <h2 className={styles['sys-panel-title']} style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Departamentos</h2>
          {!loading && (
            <p className={styles['sys-panel-sub']} style={{ fontSize: "0.8125rem" }}>
              {total === 0 ? (debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : "Sin departamentos aún") : `${total} ${total === 1 ? "departamento" : "departamentos"}${debouncedSearch ? ` · filtrado por "${debouncedSearch}"` : ""} · página ${page} de ${totalPages}`}
            </p>
          )}
        </div>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={openCreate}>
          <IconPlus size={16} aria-hidden="true" />
          Nuevo departamento
        </button>
      </div>

      <div className={styles['sys-filter-bar']} role="search" aria-label="Buscar departamentos">
        <div className={styles['sys-search']} style={{ flex: "1 1 14rem", maxWidth: "26rem" }}>
          <IconSearch size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar departamentos por nombre, descripción o ID"
            placeholder="Buscar por nombre, descripción, ID…"
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
        {debouncedSearch && <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>Filtrado por "{debouncedSearch}"</span>}
        <div style={{ marginLeft: "auto" }}>
          <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => setSearch("")} disabled={!search && !debouncedSearch}>Limpiar</button>
        </div>
      </div>

      {loading ? (
        <Spinner label="Cargando departamentos..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay departamentos registrados"
          description="Crea el primer departamento para organizar a tus empleados y usuarios."
          icon={<IconBuilding size={22} aria-hidden="true" />}
          action={
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={openCreate}>
              <IconPlus size={16} aria-hidden="true" />
              Nuevo departamento
            </button>
          }
        />
      ) : (
        <>
          <div className={styles['sys-table-wrap']}>
            <table className={styles['sys-table']}>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Creado</th>
                  <th scope="col" style={{ width: "10rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((dep) => (
                  <tr key={dep.id_departamento ?? dep.id}>
                    <td data-label="Nombre">
                      <span className={styles['sys-cell-main']}>{dep.nombre_departamento}</span>
                      <span className={styles['sys-cell-sub']} style={{ display: "none" }}>{dep.id_departamento ?? dep.id}</span>
                    </td>
                    <td data-label="Descripción" style={{ maxWidth: "22rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {dep.descripcion || "—"}
                    </td>
                    <td data-label="Creado">{formatDate(dep.createdAt)}</td>
                    <td data-label="Acciones">
                      <div className={styles['sys-row-actions']}>
                        <button
                          type="button"
                          className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`}
                          title="Ver detalle"
                          aria-label={`Ver detalle de ${dep.nombre_departamento}`}
                          onClick={() => openDetail(dep)}
                        >
                          <IconEye size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`}
                          title="Editar"
                          aria-label={`Editar ${dep.nombre_departamento}`}
                          onClick={() => openEdit(dep)}
                        >
                          <IconPencil size={16} aria-hidden="true" />
                        </button>
                        {allowDelete && (
                          <button
                            type="button"
                            className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--danger']}`}
                            title="Eliminar (solo admin)"
                            aria-label={`Eliminar ${dep.nombre_departamento}`}
                            onClick={() => setDeleting(dep)}
                          >
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
              <span style={{ fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
                Página {page} de {totalPages} · {total} registros
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`}
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`}
                  disabled={page >= totalPages}
                  onClick={() => load(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Drawer open={detail !== null} title={detail ? `Departamento · ${detail.nombre_departamento}` : "Detalle"} onClose={() => setDetail(null)}>
        {detailLoading || !detail ? (
          <Spinner label="Cargando departamento..." />
        ) : (
          <dl className={styles['sys-detail-grid']}>
            <div><dt>Nombre</dt><dd>{detail.nombre_departamento}</dd></div>
            <div className={styles['sys-detail-full']}><dt>Descripción</dt><dd>{detail.descripcion || "—"}</dd></div>
            <div><dt>Creado</dt><dd>{formatDate(detail.createdAt)}</dd></div>
            <div><dt>Actualizado</dt><dd>{formatDate(detail.updatedAt)}</dd></div>
            <div className={styles['sys-detail-full']}><dt>ID</dt><dd><code>{detail.id_departamento ?? detail.id}</code></dd></div>
          </dl>
        )}
      </Drawer>

      <Drawer
        open={formOpen}
        title={editing ? `Editar departamento · ${editing.nombre_departamento}` : "Nuevo departamento"}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" form="departamento-form" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} disabled={submitting}>
              {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear departamento"}
            </button>
          </>
        }
      >
        <form id="departamento-form" className={styles['sys-form']} onSubmit={handleSubmit}>
          <label className={styles['sys-field']}>
            <span>Nombre del departamento *</span>
            <input
              className={styles['sys-input']}
              value={form.nombre_departamento}
              minLength={2}
              maxLength={100}
              required
              placeholder="Ej: Mantenimiento, Ventas, Soporte"
              onChange={(e) => setForm((f) => ({ ...f, nombre_departamento: e.target.value }))}
            />
          </label>
          <label className={styles['sys-field']}>
            <span>Descripción (opcional)</span>
            <textarea
              className={styles['sys-textarea']}
              rows={3}
              maxLength={1000}
              placeholder="Describe brevemente el departamento..."
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            />
          </label>
          {formError && <pre className={`${styles['sys-error']} ${styles['sys-error--list']}`}>{formError}</pre>}
        </form>
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar departamento"
        message={`¿Seguro que deseas eliminar el departamento "${deleting?.nombre_departamento ?? ""}"? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
