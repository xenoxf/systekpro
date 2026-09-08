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

export const ordenesService = {
  async list(estado?: OrdenEstado): Promise<OrdenServicio[]> {
    const qs = estado ? `?estado=${estado}` : ""
    const res = await api.get<OrdenServicio[] | { data: OrdenServicio[] } | { items: OrdenServicio[] }>(`/ordenes${qs}`)
    return unwrapArrayOrdenes<OrdenServicio>(res)
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
