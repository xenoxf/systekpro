import { api } from "./api"
import type { AuthRole } from "./auth"

export interface Usuario {
  id: string
  name: string
  role: AuthRole
  createdAt: string
  updatedAt: string
}

export type UpdateUsuarioDto = Partial<Pick<Usuario, "name" | "role">> & {
  password?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isValidUuid = (value: string): boolean => UUID_RE.test(value)

export const usersService = {
  list(): Promise<Usuario[]> {
    return api.get<Usuario[]>("/users")
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
