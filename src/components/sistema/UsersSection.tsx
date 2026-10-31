import React, { useEffect, useState } from "react"
import { IconEye, IconPencil, IconPlus, IconTrash, IconUsers, IconSearch, IconX } from "@tabler/icons-react"
import { usersService, isValidUuid, type Usuario, type UpdateUsuarioDto, type CreateUsuarioDto } from "@/services/users"
import { departamentosService, type Departamento } from "@/services/departamentos"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import { claveDeNombre, departamentoLabel } from "@/data/servicios"
import { Drawer, ConfirmDialog, EmptyState, Spinner, formatDate } from "./ui"
import styles from "@/styles/UsersSection.module.css"

interface FormState {
  name: string
  password: string
  role: Usuario["role"]
  departamentoId: string
}

//role vacío = "rol según el departamento elegido": lo resuelve el backend.
const EMPTY_FORM: FormState = { name: "", password: "", role: "", departamentoId: "" }

interface RolOpcion {
  value: string
  label: string
}

function departamentoLabelDe(user: Usuario): string {
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

  // Los roles disponibles salen de los departamentos creados: el rol define
  // qué formularios recibirá ese usuario (ver LeadsSection).
  const rolOpciones: RolOpcion[] = useMemo(() => {
    const opciones = departamentos
      .map((d) => {
        const value = claveDeNombre(d.nombre_departamento)
        return value ? { value, label: departamentoLabel(value) } : null
      })
      .filter((op): op is RolOpcion => op !== null && op.value !== "admin")

    // El rol actual puede venir de un departamento ya eliminado: se conserva
    // para que el select no quede en blanco.
    if (editing?.role && editing.role !== "admin" && !opciones.some((op) => op.value === editing.role)) {
      opciones.push({ value: editing.role, label: `${departamentoLabel(editing.role)} (sin departamento)` })
    }

    return [...opciones, { value: "gerente", label: "Gerente (ve todos los departamentos)" }]
  }, [departamentos, editing])

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
    } finally {
      setDetailLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    // Sin rol explícito, el backend toma la clave del departamento elegido.
    setForm({ name: "", password: "", role: "", departamentoId: "" })
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
        if (form.role && form.role !== editing.role) dto.role = form.role
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
          // Sin rol explícito, el backend toma la clave del departamento elegido.
          role: form.role || undefined,
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

  return (
    <div className={styles['sys-section']}>
      <div className={styles['sys-section-toolbar']} style={{ alignItems: "flex-end" }}>
        <div className={styles['sys-panel-heading']} style={{ minWidth: 0 }}>
          <h2 className={styles['sys-panel-title']} style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Usuarios</h2>
          {!loading && (
            <p className={styles['sys-panel-sub']} style={{ fontSize: "0.8125rem" }}>
              Solo el admin gestiona usuarios: crea la cuenta, define su contraseña y elige el rol.
              Los roles disponibles son los departamentos creados; el rol decide qué formularios
              recibe ese usuario.
            </p>
          )}
        </div>
      </div>

      <div className={styles['sys-filter-bar']} role="search" aria-label="Buscar usuarios">
        <div className={styles['sys-search']} style={{ flex: "1 1 14rem", maxWidth: "28rem" }}>
          <IconSearch size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar usuarios por nombre, email, teléfono, rol, ID"
            placeholder="Buscar por nombre, email, teléfono, rol, ID…"
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
      ) : users.length === 0 ? (
        <EmptyState
          title="No hay usuarios registrados"
          description={
            debouncedSearch
              ? `sin resultados para "${debouncedSearch}"`
              : "Aún no hay usuarios registrados. Agrega uno desde el formulario."
          }
          icon={<IconInbox size={22} aria-hidden="true" />}
        />
      ) : (
        <>
          <div className={styles['sys-table-wrap']}>
            <table className={styles['sys-table']}>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Departamento</th>
                  <th scope="col">Fecha de creación</th>
                  <th scope="col" style={{ width: "8rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
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
                        <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--outlined']}`} title="Ver detalle" onClick={() => openDetail(user)} aria-label={`Ver ${user.nombre}`}>
                          <IconEye size={16} aria-hidden="true" />
                        </button>
                        {user.role !== "admin" && (
                          <button type="button" className={`${styles['sys-icon-btn']} ${styles['sys-icon-btn--danger']}`} title="Eliminar usuario" onClick={() => setDeleting(user)} aria-label={`Eliminar ${user.nombre}`}>
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
          {true && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>Página 1 de 1 · {users} registros</span>
            </div>
          )}
        </>
      )

      <Drawer open={detail !== null} title={detail ? `Formulario · ${detail.nombre}` : "Detalle"} onClose={() => setDetail(null)}>
        {detailLoading || !detail ? <Spinner label="Cargando formulario..." /> : (
          <dl className={styles['sys-detail-grid']}>
            <div><dt>Nombre</dt><dd>{detail.nombre}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${detail.email}`} style={{ color: "hsl(var(--primary))" }}>{detail.email}</a></dd></div>
            <div><dt>Teléfono</dt><dd><a href={`tel:${detail.numero}`} style={{ color: "hsl(var(--primary))" }}>{detail.numero}</a></dd></div>
            <div><dt>Rol</dt><dd><span className={styles['sys-badge']}>{detail.role}</span></dd></div>
            <div><dt>Departamento</dt><dd><span className={styles['sys-badge']}>{departamentoLabel(detail)}</span></dd></div>
            <div className={styles['sys-detail-full']}><dt>Mensaje</dt><dd style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{detail.message}</dd></div>
            <div><dt>Creado</dt><dd>{formatDate(detail.createdAt)}</dd></div>
            <div><dt>Actualizado</dt><dd>{formatDate(detail.updatedAt)}</dd></div>
            <div className={styles['sys-detail-full']}><dt>ID</dt><dd><code>{detail.id}</code></dd></div>
          </dl>
        )}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar usuario"
        message={`¿Seguro que deseas eliminar el usuario "${deleting?.nombre ?? ""}"? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <div className={styles['sys-section-footer']}>
        <button className={styles['sys-btn']} onClick={() => openCreate()}>Agregar usuario</button>
      </div>
    </div>
  )
}
