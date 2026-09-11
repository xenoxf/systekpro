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

function unwrapPaginatedUsers(value: unknown): { data: Usuario[]; meta: { total: number; page: number; limit: number; totalPages: number } } | null {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data) && obj.meta && typeof obj.meta === "object") {
      return value as { data: Usuario[]; meta: { total: number; page: number; limit: number; totalPages: number } }
    }
  }
  return null
}

export const usersService = {
  async list(params?: { search?: string; page?: number; limit?: number }): Promise<Usuario[]> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    if (params?.search?.trim()) qs.set("search", params.search.trim())
    const suffix = qs.toString() ? `?${qs.toString()}` : ""
    const res = await api.get<Usuario[] | { data: Usuario[]; meta: any } | { items: Usuario[] }>(`/users${suffix}`)
    const pag = unwrapPaginatedUsers(res)
    if (pag) return pag.data
    return unwrapArrayUsers<Usuario>(res)
  },

  async listPaginated(params?: { search?: string; page?: number; limit?: number }): Promise<{ data: Usuario[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    if (params?.search?.trim()) qs.set("search", params.search.trim())
    const suffix = qs.toString() ? `?${qs.toString()}` : ""
    const res = await api.get<{ data: Usuario[]; meta: any } | Usuario[]>(`/users${suffix}`)
    const pag = unwrapPaginatedUsers(res)
    if (pag) return pag
    const data = unwrapArrayUsers<Usuario>(res)
    return { data, meta: { total: data.length, page: 1, limit: data.length || 20, totalPages: 1 } }
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
