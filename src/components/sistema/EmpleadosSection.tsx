import React, { useEffect, useMemo, useState } from "react"
import { IconBriefcase, IconPencil, IconTrash, IconPlus, IconEye } from "@tabler/icons-react"
import { empleadosService, type Empleado, type CreateEmpleadoDto } from "@/services/empleados"
import { departamentosService, type Departamento } from "@/services/departamentos"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import { Drawer, ConfirmDialog, EmptyState, Spinner, formatDate } from "./ui"
import styles from "@/styles/SistemaUI.module.css"

interface FormState {
  nombre_empleado: string
  apellido_empleado: string
  correo_empleado: string
  cargo: string
  id_departamento: string
}

export default function EmpleadosSection() {
  const [items, setItems] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [filtroDep, setFiltroDep] = useState<string>("")

  const [detail, setDetail] = useState<Empleado | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Empleado | null>(null)
  const [form, setForm] = useState<FormState>({ nombre_empleado: "", apellido_empleado: "", correo_empleado: "", cargo: "", id_departamento: "" })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<Empleado | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function loadDepartamentos() {
    try {
      const list = await departamentosService.listAll()
      setDepartamentos(list)
    } catch {
      setDepartamentos([])
    }
  }

  async function load(nextPage = page, depId = filtroDep) {
    setLoading(true)
    try {
      const res = await empleadosService.list({ page: nextPage, limit, departamentoId: depId || undefined })
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
    loadDepartamentos()
    load(1, "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    load(1, filtroDep)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroDep])

  const depMap = useMemo(() => {
    const m = new Map<string, string>()
    departamentos.forEach((d) => m.set(d.id_departamento ?? d.id, d.nombre_departamento))
    return m
  }, [departamentos])

  async function openDetail(row: Empleado) {
    const id = row.id_empleado ?? row.id
    setDetail(row)
    setDetailLoading(true)
    try {
      const full = await empleadosService.get(id)
      setDetail(full)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDetailLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre_empleado: "", apellido_empleado: "", correo_empleado: "", cargo: "", id_departamento: departamentos[0] ? (departamentos[0].id_departamento ?? departamentos[0].id) : "" })
    setFormError(null)
    if (departamentos.length === 0) loadDepartamentos()
    setFormOpen(true)
  }

  function openEdit(row: Empleado) {
    setEditing(row)
    setForm({
      nombre_empleado: row.nombre_empleado,
      apellido_empleado: row.apellido_empleado,
      correo_empleado: row.correo_empleado,
      cargo: row.cargo,
      id_departamento: row.id_departamento ?? row.departamento?.id_departamento ?? row.departamento?.id ?? "",
    })
    setFormError(null)
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (form.nombre_empleado.trim().length < 2 || form.nombre_empleado.trim().length > 80) { setFormError("Nombre debe tener 2-80 caracteres."); return }
    if (form.apellido_empleado.trim().length < 2 || form.apellido_empleado.trim().length > 80) { setFormError("Apellido debe tener 2-80 caracteres."); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo_empleado.trim())) { setFormError("Correo electrónico no válido."); return }
    if (form.cargo.trim().length < 2 || form.cargo.trim().length > 80) { setFormError("Cargo debe tener 2-80 caracteres."); return }
    if (!form.id_departamento) { setFormError("Selecciona un departamento."); return }

    const dto: CreateEmpleadoDto = {
      nombre_empleado: form.nombre_empleado.trim(),
      apellido_empleado: form.apellido_empleado.trim(),
      correo_empleado: form.correo_empleado.trim().toLowerCase(),
      cargo: form.cargo.trim(),
      id_departamento: form.id_departamento,
    }
    setSubmitting(true)
    try {
      if (editing) {
        const id = editing.id_empleado ?? editing.id
        await empleadosService.update(id, dto)
        toast.success("Empleado actualizado")
      } else {
        await empleadosService.create(dto)
        toast.success("Empleado creado")
      }
      setFormOpen(false)
      await load(page, filtroDep)
    } catch (err) {
      if (isApiError(err)) {
        if (err.statusCode === 409 || err.statusCode === 400 || err.statusCode === 404) setFormError(err.messages.join("\n"))
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
      const id = deleting.id_empleado ?? deleting.id
      await empleadosService.remove(id)
      toast.success("Empleado eliminado")
      setDeleting(null)
      if (detail && (detail.id_empleado ?? detail.id) === id) setDetail(null)
      const nextTotal = total - 1
      const nextPages = Math.max(1, Math.ceil(nextTotal / limit))
      const nextPage = page > nextPages ? nextPages : page
      await load(nextPage, filtroDep)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  function initials(emp: Empleado) {
    return `${emp.nombre_empleado[0] ?? ""}${emp.apellido_empleado[0] ?? ""}`.toUpperCase()
  }

  return (
    <div className={styles['sys-section']}>
      <div className={styles['sys-section-toolbar']} style={{ alignItems: "flex-end" }}>
        <div className={styles['sys-panel-heading']} style={{ minWidth: 0 }}>
          <h2 className={styles['sys-panel-title']} style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Empleados</h2>
          {!loading && (
            <p className={styles['sys-panel-sub']} style={{ fontSize: "0.8125rem" }}>
              {total === 0 ? "Sin empleados aún" : `${total} ${total === 1 ? "empleado" : "empleados"} · página ${page} de ${totalPages}`}
              {filtroDep ? ` · filtrado por ${depMap.get(filtroDep) ?? filtroDep}` : ""}
            </p>
          )}
        </div>
        <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={openCreate}>
          <IconPlus size={16} aria-hidden="true" />
          Nuevo empleado
        </button>
      </div>

      <div className={styles['sys-filter-bar']}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "hsl(var(--muted-foreground))" }}>
          <IconBriefcase size={16} aria-hidden="true" />
          Departamento:
        </label>
        <select
          className={styles['sys-select']}
          value={filtroDep}
          onChange={(e) => setFiltroDep(e.target.value)}
          style={{ minWidth: "14rem", maxWidth: "22rem" }}
        >
          <option value="">Todos los departamentos</option>
          {departamentos.map((d) => (
            <option key={d.id_departamento ?? d.id} value={d.id_departamento ?? d.id}>
              {d.nombre_departamento}
            </option>
          ))}
        </select>
        {filtroDep && (
          <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => setFiltroDep("")}>Limpiar filtro</button>
        )}
      </div>

      {loading ? (
        <Spinner label="Cargando empleados..." />
      ) : items.length === 0 ? (
        <EmptyState
          title={filtroDep ? "Sin empleados en este departamento" : "No hay empleados registrados"}
          description={filtroDep ? "No se encontraron empleados para el departamento seleccionado." : "Registra tu primer empleado asignándolo a un departamento."}
          icon={<IconBriefcase size={22} aria-hidden="true" />}
          action={
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={openCreate}>
              <IconPlus size={16} aria-hidden="true" />
              Nuevo empleado
            </button>
          }
        />
      ) : (
        <>
          <div className={styles['sys-table-wrap']}>
            <table className={styles['sys-table']}>
              <thead>
                <tr>
                  <th scope="col">Empleado</th>
                  <th scope="col">Cargo</th>
                  <th scope="col">Departamento</th>
                  <th scope="col">Correo</th>
                  <th scope="col" style={{ width: "10rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((emp) => {
                  const depName = emp.departamento?.nombre_departamento ?? depMap.get(emp.id_departamento) ?? "—"
                  return (
                    <tr key={emp.id_empleado ?? emp.id}>
                      <td data-label="Empleado">
                        <div className={styles['sys-cell-with-avatar']}>
                          <span className={styles['sys-cell-avatar']} aria-hidden="true">{initials(emp)}</span>
                          <span className={styles['sys-cell-stack']}>
                            <span className={styles['sys-cell-main']}>{emp.nombre_empleado} {emp.apellido_empleado}</span>
                            <span className={styles['sys-cell-sub']}>{formatDate(emp.createdAt)}</span>
                          </span>
                        </div>
                      </td>
                      <td data-label="Cargo"><span className={styles['sys-badge']}>{emp.cargo}</span></td>
                      <td data-label="Departamento">
                        <span className={`${styles['sys-badge']} ${styles['sys-badge--primary']}`}>{depName}</span>
                      </td>
                      <td data-label="Correo" style={{ fontSize: "0.8125rem", wordBreak: "break-all" }}>{emp.correo_empleado}</td>
                      <td data-label="Acciones">
                        <div className={styles['sys-row-actions']}>
                          <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`} title="Ver" onClick={() => openDetail(emp)}><IconEye size={16} aria-hidden="true" /></button>
                          <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`} title="Editar" onClick={() => openEdit(emp)}><IconPencil size={16} aria-hidden="true" /></button>
                          <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--danger']}`} title="Eliminar" onClick={() => setDeleting(emp)}><IconTrash size={16} aria-hidden="true" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>Página {page} de {totalPages} · {total} registros</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} disabled={page <= 1} onClick={() => load(page - 1, filtroDep)}>Anterior</button>
                <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} disabled={page >= totalPages} onClick={() => load(page + 1, filtroDep)}>Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}

      <Drawer open={detail !== null} title={detail ? `${detail.nombre_empleado} ${detail.apellido_empleado}` : "Detalle"} onClose={() => setDetail(null)}>
        {detailLoading || !detail ? <Spinner label="Cargando empleado..." /> : (
          <dl className={styles['sys-detail-grid']}>
            <div><dt>Nombre</dt><dd>{detail.nombre_empleado} {detail.apellido_empleado}</dd></div>
            <div><dt>Correo</dt><dd>{detail.correo_empleado}</dd></div>
            <div><dt>Cargo</dt><dd>{detail.cargo}</dd></div>
            <div><dt>Departamento</dt><dd>{detail.departamento?.nombre_departamento ?? depMap.get(detail.id_departamento) ?? detail.id_departamento}</dd></div>
            <div><dt>Creado</dt><dd>{formatDate(detail.createdAt)}</dd></div>
            <div><dt>Actualizado</dt><dd>{formatDate(detail.updatedAt)}</dd></div>
            <div className={styles['sys-detail-full']}><dt>ID</dt><dd><code>{detail.id_empleado ?? detail.id}</code></dd></div>
          </dl>
        )}
      </Drawer>

      <Drawer
        open={formOpen}
        title={editing ? `Editar empleado · ${editing.nombre_empleado}` : "Nuevo empleado"}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => setFormOpen(false)} disabled={submitting}>Cancelar</button>
            <button type="submit" form="empleado-form" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} disabled={submitting}>{submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear empleado"}</button>
          </>
        }
      >
        <form id="empleado-form" className={styles['sys-form']} onSubmit={handleSubmit}>
          <div className={styles['sys-form-grid']}>
            <label className={styles['sys-field']}>
              <span>Nombre *</span>
              <input className={styles['sys-input']} value={form.nombre_empleado} required minLength={2} maxLength={80} onChange={(e) => setForm((f) => ({ ...f, nombre_empleado: e.target.value }))} placeholder="Ej: Ana" />
            </label>
            <label className={styles['sys-field']}>
              <span>Apellido *</span>
              <input className={styles['sys-input']} value={form.apellido_empleado} required minLength={2} maxLength={80} onChange={(e) => setForm((f) => ({ ...f, apellido_empleado: e.target.value }))} placeholder="Ej: Torres" />
            </label>
            <label className={styles['sys-field']}>
              <span>Correo *</span>
              <input className={styles['sys-input']} type="email" value={form.correo_empleado} required maxLength={120} onChange={(e) => setForm((f) => ({ ...f, correo_empleado: e.target.value }))} placeholder="ana.torres@empresa.com" />
            </label>
            <label className={styles['sys-field']}>
              <span>Cargo *</span>
              <input className={styles['sys-input']} value={form.cargo} required minLength={2} maxLength={80} onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))} placeholder="Ej: Técnico, Soporte" />
            </label>
            <label className={`${styles['sys-field']} ${styles['sys-field--full']}`}>
              <span>Departamento *</span>
              <select
                className={styles['sys-select']}
                value={form.id_departamento}
                required
                onChange={(e) => setForm((f) => ({ ...f, id_departamento: e.target.value }))}
              >
                <option value="">Selecciona un departamento</option>
                {departamentos.map((d) => (
                  <option key={d.id_departamento ?? d.id} value={d.id_departamento ?? d.id}>{d.nombre_departamento}</option>
                ))}
              </select>
              {departamentos.length === 0 && (
                <small style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
                  No hay departamentos. Crea uno primero en la sección Departamentos.
                </small>
              )}
            </label>
          </div>
          {formError && <pre className={`${styles['sys-error']} ${styles['sys-error--list']}`}>{formError}</pre>}
        </form>
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar empleado"
        message={`¿Seguro que deseas eliminar al empleado "${deleting ? `${deleting.nombre_empleado} ${deleting.apellido_empleado}` : ""}"?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
