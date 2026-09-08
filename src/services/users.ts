import { api } from "./api"
import type { AuthRole } from "./auth"

export interface Usuario {
  id: string
  name: string
  role: AuthRole
  departamentoId?: string | null
  departamento?: { id_departamento: string; nombre_departamento: string } | null
  createdAt: string
  updatedAt: string
}

export interface CreateUsuarioDto {
  name: string
  password: string
  role?: AuthRole
  departamentoId?: string | null
}

export type UpdateUsuarioDto = Partial<Pick<Usuario, "name" | "role">> & {
  password?: string
  departamentoId?: string | null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isValidUuid = (value: string): boolean => UUID_RE.test(value)

function unwrapArrayUsers<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
    if (Array.isArray(obj.users)) return obj.users as T[]
  }
  return []
}

export const usersService = {
  async list(): Promise<Usuario[]> {
    const res = await api.get<Usuario[] | { data: Usuario[] } | { items: Usuario[] }>("/users")
    return unwrapArrayUsers<Usuario>(res)
  },

  create(data: CreateUsuarioDto): Promise<Usuario> {
    return api.post<Usuario>("/users", data)
  },

  get(id: string): Promise<Usuario> {
    return api.get<Usuario>(`/users/${id}`)
  },

  update(id: string, data: UpdateUsuarioDto): Promise<Usuario> {
    return api.patch<Usuario>(`/users/${id}`, data)
  },

  remove(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/users/${id}`)
  },
}
