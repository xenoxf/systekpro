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
    // Nota: el backend tiene ValidationPipe con forbidNonWhitelisted:true.
    // Si enviamos ?departamentoId=... junto a PaginationDto, el backend
    // responde 400 "property departamentoId should not exist" porque
    // PaginationDto solo permite page/limit. Para no romper sin tocar
    // backend, el filtro por departamento se hace client-side en el
    // componente cuando params.departamentoId está presente.
    const hasFilter = !!params?.departamentoId
    if (hasFilter) {
      // Fallback client-side: trae hasta 100 y filtra localmente.
      // Si el backend corrige la validación en el futuro, este fallback
      // seguirá funcionando.
      try {
        const qs = new URLSearchParams()
        if (params?.page) qs.set("page", String(params.page))
        if (params?.limit) qs.set("limit", String(params.limit))
        qs.set("departamentoId", params.departamentoId!)
        const suffix = qs.toString() ? `?${qs.toString()}` : ""
        const res = await api.get<Empleado[] | PaginatedEmpleados>(`/empleados${suffix}`)
        const pag = unwrapPaginated(res)
        if (pag) return pag
        const data = unwrapArray(res)
        return { data, meta: { total: data.length, page: 1, limit: data.length || 20, totalPages: 1 } }
      } catch (err) {
        // Si es 400 por forbidNonWhitelisted, cae al fallback client-side
        const msg = err instanceof Error ? err.message : ""
        const is400 = (err as { statusCode?: number })?.statusCode === 400
        const isForbiddenProp = msg.includes("departamentoId") && msg.includes("should not exist")
        if (!(is400 && isForbiddenProp)) throw err
        // Fallback: fetch sin filtro y filtra localmente (paginado local)
        const resAll = await api.get<Empleado[] | PaginatedEmpleados>(`/empleados?limit=100`)
        const all = unwrapArray(resAll) // ignora meta, trae hasta 100
        const filtered = all.filter((e) => {
          const depId = (e as Empleado).id_departamento ?? (e as Empleado).departamento?.id_departamento ?? (e as Empleado).departamento?.id
          return depId === params.departamentoId
        })
        // Paginar localmente según page/limit solicitados
        const page = params.page ?? 1
        const limit = params.limit ?? 10
        const total = filtered.length
        const totalPages = Math.max(1, Math.ceil(total / limit))
        const start = (page - 1) * limit
        const data = filtered.slice(start, start + limit)
        return { data, meta: { total, page, limit, totalPages } }
      }
    }

    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
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
