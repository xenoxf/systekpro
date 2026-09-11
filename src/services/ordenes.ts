import { api } from "./api"

export type OrdenEstado =
  | "recibido"
  | "diagnostico"
  | "pendiente_de_autorizacion"
  | "en_mantenimiento"
  | "en_pruebas"
  | "listo"
  | "entregado"
  | "cancelado"

export const ORDEN_ESTADOS: { value: OrdenEstado; label: string }[] = [
  { value: "recibido", label: "Recibido" },
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "pendiente_de_autorizacion", label: "Pendiente de autorización" },
  { value: "en_mantenimiento", label: "En mantenimiento" },
  { value: "en_pruebas", label: "En pruebas" },
  { value: "listo", label: "Listo" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
]

export function estadoLabel(estado: OrdenEstado): string {
  return ORDEN_ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

export interface EquipoTicket {
  tipo: string
  marca: string
  modelo: string
  serial: string
}

export interface EventoTicket {
  titulo: string
  descripcion: string | null
  fecha: string
}

export interface SeguimientoPublico {
  codigo: string
  estado: OrdenEstado
  fechaIngreso: string
  fechaEntregaEstimada: string | null
  fechaEntregaReal: string | null
  trackingUrl: string | null
  clientes: string[]
  equipos: EquipoTicket[]
  eventos: EventoTicket[]
}

export interface FichaResumen {
  id: string
  nombreCliente: string
  marcaEquipo: string
  modeloEquipo: string
  serialEquipo: string
  tipoEquipo: string
}

export interface OrdenServicio {
  id: string
  codigo: string
  estado: OrdenEstado
  fallaReportada: string
  fechaIngreso: string
  fechaEntregaEstimada: string | null
  fechaEntregaReal: string | null
  fichasTecnicas?: FichaResumen[]
  trackingUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateOrdenDto {
  fichaTecnicaIds: string[]
  fallaReportada: string
  fechaEntregaEstimada?: string
}

export interface AgregarFichasDto {
  fichaTecnicaIds: string[]
}

export interface CambiarEstadoDto {
  estado: OrdenEstado
  comentario?: string
}

function unwrapArrayOrdenes<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
    if (Array.isArray(obj.result)) return obj.result as T[]
    if (Array.isArray(obj.ordenes)) return obj.ordenes as T[]
  }
  return []
}

function unwrapPaginatedOrdenes(value: unknown): { data: OrdenServicio[]; meta: { total: number; page: number; limit: number; totalPages: number } } | null {
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data) && obj.meta && typeof obj.meta === "object") {
      return value as { data: OrdenServicio[]; meta: { total: number; page: number; limit: number; totalPages: number } }
    }
  }
  return null
}

export const ordenesService = {
  async list(params?: { estado?: OrdenEstado; search?: string; page?: number; limit?: number }): Promise<OrdenServicio[]> {
    // Mantiene compatibilidad con llamada antigua list(estado)
    if (typeof params === 'string') {
      const res = await api.get<OrdenServicio[] | { data: OrdenServicio[] } | { items: OrdenServicio[] }>(`/ordenes?estado=${params}`)
      return unwrapArrayOrdenes<OrdenServicio>(res)
    }
    const qs = new URLSearchParams()
    if (params?.estado) qs.set("estado", params.estado)
    if (params?.search?.trim()) qs.set("search", params.search.trim())
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    const suffix = qs.toString() ? `?${qs.toString()}` : ""
    const res = await api.get<OrdenServicio[] | { data: OrdenServicio[] } | { items: OrdenServicio[] } | { data: OrdenServicio[]; meta: any }>(`/ordenes${suffix}`)
    const pag = unwrapPaginatedOrdenes(res)
    if (pag) return pag.data
    return unwrapArrayOrdenes<OrdenServicio>(res)
  },

  async listPaginated(params?: { estado?: OrdenEstado; search?: string; page?: number; limit?: number }): Promise<{ data: OrdenServicio[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const qs = new URLSearchParams()
    if (params?.estado) qs.set("estado", params.estado)
    if (params?.search?.trim()) qs.set("search", params.search.trim())
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    const suffix = qs.toString() ? `?${qs.toString()}` : ""
    const res = await api.get<{ data: OrdenServicio[]; meta: any } | OrdenServicio[]>(`/ordenes${suffix}`)
    const pag = unwrapPaginatedOrdenes(res)
    if (pag) return pag
    const data = unwrapArrayOrdenes<OrdenServicio>(res)
    return { data, meta: { total: data.length, page: 1, limit: data.length || 20, totalPages: 1 } }
  },

  get(id: string): Promise<OrdenServicio> {
    return api.get<OrdenServicio>(`/ordenes/${id}`)
  },

  create(data: CreateOrdenDto): Promise<OrdenServicio & { trackingUrl: string | null }> {
    return api.post<OrdenServicio & { trackingUrl: string | null }>("/ordenes", data)
  },

  agregarFichas(id: string, data: AgregarFichasDto): Promise<OrdenServicio> {
    return api.patch<OrdenServicio>(`/ordenes/${id}/fichas`, data)
  },

  cambiarEstado(id: string, data: CambiarEstadoDto): Promise<OrdenServicio> {
    return api.patch<OrdenServicio>(`/ordenes/${id}/estado`, data)
  },

  seguimiento(codigo: string): Promise<SeguimientoPublico> {
    return api.get<SeguimientoPublico>(`/seguimiento/${codigo}`, false)
  },
}
