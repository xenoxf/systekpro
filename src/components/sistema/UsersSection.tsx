import React, { useEffect, useState } from "react"
import { IconEye, IconPencil, IconTrash } from "@tabler/icons-react"
import { usersService, isValidUuid, type Usuario, type UpdateUsuarioDto } from "@/services/users"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import { Modal, ConfirmDialog, EmptyState, Spinner, formatDate } from "./ui"

interface FormState {
  name: string
  password: string
  role: Usuario["role"]
}

export default function UsersSection() {
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  const [detail, setDetail] = useState<Usuario | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [form, setForm] = useState<FormState>({ name: "", password: "", role: "mantenimiento" })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleting, setDeleting] = useState<Usuario | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function loadUsers() {
    setLoading(true)
    try {
      setUsers(await usersService.list())
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

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

  function openEdit(user: Usuario) {
    setEditing(user)
    setForm({ name: user.name, password: "", role: user.role })
    setFormError(null)
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setFormError(null)

    const dto: UpdateUsuarioDto = {}
    if (form.name !== editing.name) dto.name = form.name
    if (form.password) dto.password = form.password
    if (form.role !== editing.role) dto.role = form.role

    if (Object.keys(dto).length === 0) {
      setFormOpen(false)
      return
    }

    setSubmitting(true)
    try {
      await usersService.update(editing.id, dto)
      toast.success("Usuario actualizado correctamente")
      setFormOpen(false)
      await loadUsers()
    } catch (err) {
      if (isApiError(err)) {
        if (err.statusCode === 409) setFormError("Ya existe un usuario con ese nombre.")
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
      await usersService.remove(deleting.id)
      toast.success("Usuario eliminado correctamente")
      setDeleting(null)
      await loadUsers()
    } catch (err) {
      if (isApiError(err)) toast.error(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="sys-section">
      <div className="sys-section-toolbar">
        <p className="sys-section-hint">
          Gestión de usuarios del sistema. Los usuarios se crean internamente por el backend.
        </p>
      </div>

      {loading ? (
        <Spinner label="Cargando usuarios..." />
      ) : users.length === 0 ? (
        <EmptyState title="No hay usuarios registrados" />
      ) : (
        <div className="sys-table-wrap">
          <table className="sys-table">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Rol</th>
                <th scope="col">Creado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Nombre">{user.name}</td>
                  <td data-label="Rol">
                    <span className={`sys-badge ${user.role === "admin" ? "sys-badge--primary" : ""}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Creado">{formatDate(user.createdAt)}</td>
                  <td data-label="Acciones">
                    <div className="sys-row-actions">
                      <button
                        type="button"
                        className="sys-icon-btn"
                        title="Ver detalle"
                        aria-label={`Ver detalle del usuario ${user.name}`}
                        onClick={() => openDetail(user)}
                      >
                        <IconEye size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sys-icon-btn"
                        title="Editar"
                        aria-label={`Editar al usuario ${user.name}`}
                        onClick={() => openEdit(user)}
                      >
                        <IconPencil size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sys-icon-btn sys-icon-btn--danger"
                        title="Eliminar"
                        aria-label={`Eliminar al usuario ${user.name}`}
                        onClick={() => setDeleting(user)}
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

      <Modal open={detail !== null} title="Detalle de usuario" onClose={() => setDetail(null)}>
        {detailLoading || !detail ? (
          <Spinner label="Cargando usuario..." />
        ) : (
          <dl className="sys-detail-grid">
            <div><dt>Nombre</dt><dd>{detail.name}</dd></div>
            <div>
              <dt>Rol</dt>
              <dd>
                <span className={`sys-badge ${detail.role === "admin" ? "sys-badge--primary" : ""}`}>
                  {detail.role}
                </span>
              </dd>
            </div>
            <div><dt>Creado</dt><dd>{formatDate(detail.createdAt)}</dd></div>
            <div><dt>Actualizado</dt><dd>{formatDate(detail.updatedAt)}</dd></div>
            <div className="sys-detail-full"><dt>ID</dt><dd><code>{detail.id}</code></dd></div>
          </dl>
        )}
      </Modal>

      <Modal open={formOpen} title={editing ? `Editar usuario · ${editing.name}` : "Editar usuario"} onClose={() => setFormOpen(false)}>
        <form className="sys-form" onSubmit={handleSubmit}>
          <label className="sys-field">
            <span>Nombre de usuario *</span>
            <input
              className="sys-input"
              value={form.name}
              minLength={3}
              maxLength={50}
              required
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="sys-field">
            <span>Nueva contraseña (opcional)</span>
            <input
              className="sys-input"
              type="password"
              value={form.password}
              autoComplete="new-password"
              placeholder="Mínimo 5 caracteres, 1 mayúscula, 1 número y 1 símbolo"
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </label>
          <label className="sys-field">
            <span>Rol *</span>
            <select
              className="sys-select"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as FormState["role"] }))}
            >
              <option value="mantenimiento">Mantenimiento</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {formError && <pre className="sys-error sys-error--list">{formError}</pre>}

          <div className="sys-form-actions">
            <button type="button" className="sys-btn sys-btn--ghost" onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="sys-btn sys-btn--primary" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Modal>

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
