import { api } from "./api"

export interface DepartamentoRef {
  id_departamento: string
  id: string
  nombre_departamento: string
  descripcion?: string | null
}

export interface Empleado {
  id_empleado: string
  id: string
  nombre_empleado: string
  apellido_empleado: string
  correo_empleado: string
  cargo: string
  departamento: DepartamentoRef | null
  id_departamento: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmpleadoDto {
  nombre_empleado: string
  apellido_empleado: string
  correo_empleado: string
  cargo: string
  id_departamento: string
}

export type UpdateEmpleadoDto = Partial<CreateEmpleadoDto>

export interface PaginationParams {
  page?: number
  limit?: number
  departamentoId?: string
  search?: string
}

export interface PaginatedEmpleados {
  data: Empleado[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

function unwrapPaginated(value: unknown): PaginatedEmpleados | null {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data) && obj.meta && typeof obj.meta === "object") {
      return value as PaginatedEmpleados
    }
  }
  return null
}

function unwrapArray(value: unknown): Empleado[] {
  if (Array.isArray(value)) return value as Empleado[]
  const pag = unwrapPaginated(value)
  if (pag) return pag.data
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.items)) return obj.items as Empleado[]
    if (Array.isArray(obj.result)) return obj.result as Empleado[]
    if (Array.isArray(obj.empleados)) return obj.empleados as Empleado[]
  }
  return []
}

export const empleadosService = {
  async list(params?: PaginationParams): Promise<PaginatedEmpleados> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    if (params?.departamentoId) qs.set("departamentoId", params.departamentoId)
    if (params?.search?.trim()) qs.set("search", params.search.trim())
    const suffix = qs.toString() ? `?${qs.toString()}` : ""
    const res = await api.get<Empleado[] | PaginatedEmpleados>(`/empleados${suffix}`)
    const pag = unwrapPaginated(res)
    if (pag) return pag
    const data = unwrapArray(res)
    return { data, meta: { total: data.length, page: 1, limit: data.length || 20, totalPages: 1 } }
  },

  get(id: string): Promise<Empleado> {
    return api.get<Empleado>(`/empleados/${id}`)
  },

  create(data: CreateEmpleadoDto): Promise<Empleado> {
    return api.post<Empleado>("/empleados", data)
  },

  update(id: string, data: UpdateEmpleadoDto): Promise<Empleado> {
    return api.patch<Empleado>(`/empleados/${id}`, data)
  },

  remove(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/empleados/${id}`)
  },
}
