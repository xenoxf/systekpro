import { api } from "./api"

export interface Cliente {
  id_cliente: string
  id: string
  nombre_cliente: string
  apellido_cliente: string
  correo_cliente: string | null
  telefono: string | null
  dir: string | null
  tipo_cliente: string | null
  fichasTecnicas?: unknown[]
  createdAt: string
  updatedAt: string
}

export interface CreateClienteDto {
  nombre_cliente: string
  apellido_cliente: string
  correo_cliente?: string | null
  telefono?: string | null
  dir?: string | null
  tipo_cliente?: string | null
}

export type UpdateClienteDto = Partial<CreateClienteDto>

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedClientes {
  data: Cliente[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

function unwrapPaginated(value: unknown): PaginatedClientes | null {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data) && obj.meta && typeof obj.meta === "object") {
      return value as PaginatedClientes
    }
  }
  return null
}

function unwrapArray(value: unknown): Cliente[] {
  if (Array.isArray(value)) return value as Cliente[]
  const pag = unwrapPaginated(value)
  if (pag) return pag.data
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.items)) return obj.items as Cliente[]
    if (Array.isArray(obj.result)) return obj.result as Cliente[]
    if (Array.isArray(obj.clientes)) return obj.clientes as Cliente[]
  }
  return []
}

export const clientesService = {
  async list(params?: PaginationParams): Promise<PaginatedClientes> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    const suffix = qs.toString() ? `?${qs.toString()}` : ""
    const res = await api.get<Cliente[] | PaginatedClientes>(`/clientes${suffix}`)
    const pag = unwrapPaginated(res)
    if (pag) return pag
    const data = unwrapArray(res)
    return { data, meta: { total: data.length, page: 1, limit: data.length || 20, totalPages: 1 } }
  },

  get(id: string): Promise<Cliente> {
    return api.get<Cliente>(`/clientes/${id}`)
  },

  create(data: CreateClienteDto): Promise<Cliente> {
    return api.post<Cliente>("/clientes", data)
  },

  update(id: string, data: UpdateClienteDto): Promise<Cliente> {
    return api.patch<Cliente>(`/clientes/${id}`, data)
  },

  remove(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/clientes/${id}`)
  },
}
