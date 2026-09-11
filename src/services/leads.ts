import { api } from "./api"

export interface Lead {
  id: string
  nombre: string
  email: string
  numero: string
  servicio: string
  message: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedLeads {
  data: Lead[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

function unwrapPaginated(value: unknown): PaginatedLeads {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data) && obj.meta && typeof obj.meta === "object") {
      return value as PaginatedLeads
    }
    if (Array.isArray(value)) {
      const arr = value as Lead[]
      return { data: arr, meta: { total: arr.length, page: 1, limit: arr.length, totalPages: 1 } }
    }
  }
  if (Array.isArray(value)) {
    const arr = value as Lead[]
    return { data: arr, meta: { total: arr.length, page: 1, limit: arr.length, totalPages: 1 } }
  }
  return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } }
}

export const leadsService = {
  async list(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedLeads> {
    const search = new URLSearchParams()
    if (params?.page) search.set("page", String(params.page))
    if (params?.limit) search.set("limit", String(params.limit))
    if (params?.search?.trim()) search.set("search", params.search.trim())
    const qs = search.toString()
    const path = qs ? `/leads?${qs}` : "/leads"
    const res = await api.get<PaginatedLeads | Lead[]>(path)
    return unwrapPaginated(res)
  },

  get(id: string): Promise<Lead> {
    return api.get<Lead>(`/leads/${id}`)
  },

  remove(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/leads/${id}`)
  },
}
