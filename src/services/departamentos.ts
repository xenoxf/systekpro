import { api } from "./api"

export interface Departamento {
  id_departamento: string
  id: string
  nombre_departamento: string
  descripcion: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDepartamentoDto {
  nombre_departamento: string
  descripcion?: string | null
}

export type UpdateDepartamentoDto = Partial<CreateDepartamentoDto>

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedDepartamentos {
  data: Departamento[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

function unwrapPaginated(value: unknown): PaginatedDepartamentos | null {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data) && obj.meta && typeof obj.meta === "object") {
      return value as PaginatedDepartamentos
    }
  }
  return null
}

function unwrapArrayDepartamento(value: unknown): Departamento[] {
  if (Array.isArray(value)) return value as Departamento[]
  const paginated = unwrapPaginated(value)
  if (paginated) return paginated.data
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.items)) return obj.items as Departamento[]
    if (Array.isArray(obj.result)) return obj.result as Departamento[]
  }
  return []
}

export const departamentosService = {
  async list(params?: PaginationParams): Promise<PaginatedDepartamentos> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    const suffix = qs.toString() ? `?${qs.toString()}` : ""
    const res = await api.get<Departamento[] | PaginatedDepartamentos>(`/departamentos${suffix}`)
    const paginated = unwrapPaginated(res)
    if (paginated) return paginated
    const data = unwrapArrayDepartamento(res)
    return { data, meta: { total: data.length, page: 1, limit: data.length || 20, totalPages: 1 } }
  },

  async listAll(): Promise<Departamento[]> {
    // helper for selects: intenta traer todo con limit alto
    try {
      const res = await api.get<Departamento[] | PaginatedDepartamentos>(`/departamentos?limit=100`)
      return unwrapArrayDepartamento(res)
    } catch {
      return []
    }
  },

  get(id: string): Promise<Departamento> {
    return api.get<Departamento>(`/departamentos/${id}`)
  },

  create(data: CreateDepartamentoDto): Promise<Departamento> {
    return api.post<Departamento>("/departamentos", data)
  },

  update(id: string, data: UpdateDepartamentoDto): Promise<Departamento> {
    return api.patch<Departamento>(`/departamentos/${id}`, data)
  },

  remove(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/departamentos/${id}`)
  },
}
