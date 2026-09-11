import React, { useEffect, useState } from "react"
import { IconEye, IconPencil, IconPlus, IconTrash, IconUsers, IconSearch, IconX } from "@tabler/icons-react"
import { usersService, isValidUuid, type Usuario, type UpdateUsuarioDto, type CreateUsuarioDto } from "@/services/users"
import { departamentosService, type Departamento } from "@/services/departamentos"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import { Drawer, ConfirmDialog, EmptyState, Spinner, formatDate } from "./ui"
import styles from "@/styles/UsersSection.module.css"

interface FormState {
  name: string
  password: string
  role: Usuario["role"]
  departamentoId: string
}

const EMPTY_FORM: FormState = { name: "", password: "", role: "mantenimiento", departamentoId: "" }

function departamentoLabel(user: Usuario): string {
  return user.departamento?.nombre_departamento ?? "—"
}

function departamentoIdOf(user: Usuario): string {
  return user.departamentoId ?? user.departamento?.id_departamento ?? ""
}

export default function UsersSection() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])

  const [detail, setDetail] = useState<Usuario | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<Usuario | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const isCreating = editing === null && formOpen

  async function loadUsers(searchTerm?: string) {
    setLoading(true)
    try {
      const term = searchTerm !== undefined ? searchTerm : debouncedSearch
      const data = await usersService.list(term ? { search: term } : undefined)
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function loadDepartamentos() {
    try {
      setDepartamentos(await departamentosService.listAll())
    } catch {
      setDepartamentos([])
    }
  }

  useEffect(() => {
    loadUsers("")
    loadDepartamentos()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    loadUsers(debouncedSearch)
  }, [debouncedSearch])

  async function openDetail(user: Usuario) {
    if (!isValidUuid(user.id)) {
      toast.error("Identificador de usuario inválido")
      return
    }
    setDetail(user)
    setDetailLoading(true)
    try {
      setDetail(await usersService.get(user.id))
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setFormError(null)
    if (departamentos.length === 0) loadDepartamentos()
    setFormOpen(true)
  }

  function openEdit(user: Usuario) {
    setEditing(user)
    setForm({ name: user.name, password: "", role: user.role, departamentoId: departamentoIdOf(user) })
    setFormError(null)
    if (departamentos.length === 0) loadDepartamentos()
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const name = form.name.trim()
    if (name.length < 3 || name.length > 50) {
      setFormError("El nombre debe tener entre 3 y 50 caracteres.")
      return
    }

    // Crear: contraseña obligatoria. Editar: opcional (solo si se quiere cambiar).
    if (isCreating || form.password) {
      if (!form.password || form.password.length < 5 || form.password.length > 50) {
        setFormError("La contraseña debe tener entre 5 y 50 caracteres.")
        return
      }
    }

    if (form.role === "admin" && editing?.role !== "admin") {
      setFormError("No se permite crear usuarios con rol admin. Solo puede existir un admin.")
      return
    }

    const departamentoId = form.departamentoId || null

    setSubmitting(true)
    try {
      if (editing) {
        const dto: UpdateUsuarioDto = {}
        if (name !== editing.name) dto.name = name
        if (form.password) dto.password = form.password
        if (form.role !== editing.role) dto.role = form.role
        const prevDep = departamentoIdOf(editing)
        if ((departamentoId ?? "") !== prevDep) dto.departamentoId = departamentoId

        if (Object.keys(dto).length === 0) {
          setFormOpen(false)
          return
        }
        await usersService.update(editing.id, dto)
        toast.success("Usuario actualizado correctamente")
      } else {
        const dto: CreateUsuarioDto = {
          name,
          password: form.password,
          role: form.role,
          departamentoId,
        }
        await usersService.create(dto)
        toast.success(`Usuario "${name}" creado correctamente`)
      }
      setFormOpen(false)
      await loadUsers(debouncedSearch)
    } catch (err) {
      if (isApiError(err)) {
        if (err.statusCode === 409) setFormError("Ya existe un usuario con ese nombre.")
        else if (err.statusCode === 400) setFormError(err.messages.join("\n"))
        else if (err.statusCode === 403) {
          const msg = err.messages.join(" ")
          if (msg.toLowerCase().includes("admin")) setFormError(msg)
          else setFormError("No tienes permisos para esta acción (solo admin).")
        } else toast.error(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await usersService.remove(deleting.id)
      toast.success("Usuario eliminado correctamente")
      setDeleting(null)
      await loadUsers(debouncedSearch)
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className={styles['sys-section']}>
      <div className={styles['sys-section-toolbar']} style={{ alignItems: "flex-end" }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Usuarios</h2>
          <p className={styles['sys-section-hint']}>
            Solo el admin gestiona usuarios: crea la cuenta, define su contraseña, rol y departamento.
          </p>
        </div>
        <button
          type="button"
          className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`}
          onClick={openCreate}
        >
          <IconPlus size={16} aria-hidden="true" />
          Nuevo usuario
        </button>
      </div>

      <div className={styles['sys-filter-bar']} role="search" aria-label="Buscar usuarios">
        <div className={styles['sys-search']} style={{ flex: "1 1 14rem", maxWidth: "26rem" }}>
          <IconSearch size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar usuarios por nombre, rol, departamento o ID"
            placeholder="Buscar por nombre, rol, departamento, ID…"
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
        <Spinner label="Cargando usuarios..." />
      ) : !Array.isArray(users) || users.length === 0 ? (
        <EmptyState
          title="No hay usuarios registrados"
          icon={<IconUsers size={20} />}
          action={
            <button
              type="button"
              className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`}
              onClick={openCreate}
            >
              <IconPlus size={16} aria-hidden="true" />
              Crear primer usuario
            </button>
          }
        />
      ) : (
        <div className={styles['sys-table-wrap']}>
          <table className={styles['sys-table']}>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Rol</th>
                <th scope="col">Departamento</th>
                <th scope="col">Creado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(users) ? users : []).map((user) => (
                <tr key={user.id}>
                  <td data-label="Nombre">{user.name}</td>
                  <td data-label="Rol">
                    <span className={`${styles['sys-badge']} ${user.role === "admin" ? styles['sys-badge--primary'] : ""}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Departamento">{departamentoLabel(user)}</td>
                  <td data-label="Creado">{formatDate(user.createdAt)}</td>
                  <td data-label="Acciones">
                    <div className={styles['sys-row-actions']}>
                      <button
                        type="button"
                        className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`}
                        title="Ver detalle"
                        aria-label={`Ver detalle del usuario ${user.name}`}
                        onClick={() => openDetail(user)}
                      >
                        <IconEye size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`}
                        title="Editar"
                        aria-label={`Editar al usuario ${user.name}`}
                        onClick={() => openEdit(user)}
                      >
                        <IconPencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--danger']}`}
                        title="Eliminar"
                        aria-label={`Eliminar al usuario ${user.name}`}
                        onClick={() => setDeleting(user)}
                      >
                        <IconTrash size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={detail !== null} title="Detalle de usuario" onClose={() => setDetail(null)}>
        {detailLoading || !detail ? (
          <Spinner label="Cargando usuario..." />
        ) : (
          <dl className={styles['sys-detail-grid']}>
            <div><dt>Nombre</dt><dd>{detail.name}</dd></div>
            <div>
              <dt>Rol</dt>
              <dd>
                <span className={`${styles['sys-badge']} ${detail.role === "admin" ? styles['sys-badge--primary'] : ""}`}>
                  {detail.role}
                </span>
              </dd>
            </div>
            <div><dt>Departamento</dt><dd>{departamentoLabel(detail)}</dd></div>
            <div><dt>Creado</dt><dd>{formatDate(detail.createdAt)}</dd></div>
            <div><dt>Actualizado</dt><dd>{formatDate(detail.updatedAt)}</dd></div>
            <div className={styles['sys-detail-full']}><dt>ID</dt><dd><code>{detail.id}</code></dd></div>
          </dl>
        )}
      </Drawer>

      <Drawer
        open={formOpen}
        title={editing ? `Editar usuario · ${editing.name}` : "Nuevo usuario"}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" form="usuario-form" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} disabled={submitting}>
              {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
            </button>
          </>
        }
      >
        <form id="usuario-form" className={styles['sys-form']} onSubmit={handleSubmit}>
          <label className={styles['sys-field']}>
            <span>Nombre de usuario *</span>
            <input
              className={styles['sys-input']}
              value={form.name}
              minLength={3}
              maxLength={50}
              required
              placeholder="Ej: jperez"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className={styles['sys-field']}>
            <span>{editing ? "Nueva contraseña (opcional)" : "Contraseña *"} </span>
            <input
              className={styles['sys-input']}
              type="password"
              value={form.password}
              autoComplete="new-password"
              required={!editing}
              minLength={5}
              maxLength={50}
              placeholder={editing ? "Déjala vacía para no cambiarla" : "Mínimo 5 caracteres"}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </label>
          <label className={styles['sys-field']}>
            <span>Rol *</span>
            <select
              className={styles['sys-select']}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as FormState["role"] }))}
            >
              <option value="mantenimiento">Mantenimiento</option>
              <option value="gerente">Gerente</option>
              <option value="marketing">Marketing</option>
              {editing?.role === "admin" && <option value="admin">Admin (solo lectura)</option>}
            </select>
            {editing?.role === "admin" && (
              <small style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                El usuario admin no puede cambiar de rol. Solo debe existir un admin.
              </small>
            )}
          </label>
          <label className={styles['sys-field']}>
            <span>Departamento {form.role === "admin" ? "(opcional)" : ""}</span>
            <select
              className={styles['sys-select']}
              value={form.departamentoId}
              onChange={(e) => setForm((f) => ({ ...f, departamentoId: e.target.value }))}
            >
              <option value="">Sin departamento</option>
              {departamentos.map((d) => (
                <option key={d.id_departamento ?? d.id} value={d.id_departamento ?? d.id}>
                  {d.nombre_departamento}
                </option>
              ))}
            </select>
            {departamentos.length === 0 && (
              <small style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                No hay departamentos cargados. Puedes crearlo en la sección Departamentos.
              </small>
            )}
          </label>

          {formError && <pre className={`${styles['sys-error']} ${styles['sys-error--list']}`}>{formError}</pre>}
        </form>
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar usuario"
        message={`¿Seguro que deseas eliminar al usuario "${deleting?.name ?? ""}"? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
