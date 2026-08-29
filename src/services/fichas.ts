import { api } from "./api"

export type TipoEquipo = "cpu" | "portatil" | "escritorio" | "server" | "todo_en_uno"

export const TIPOS_EQUIPO: { value: TipoEquipo; label: string }[] = [
  { value: "cpu", label: "CPU / Torre" },
  { value: "portatil", label: "Portátil" },
  { value: "escritorio", label: "Escritorio" },
  { value: "server", label: "Servidor" },
  { value: "todo_en_uno", label: "Todo en uno" },
]

export interface FichaTecnica {
  id: string
  nombreCliente: string
  telefonoCliente?: string | null
  direccionCliente?: string | null
  correoCliente?: string | null
  servicio?: string | null
  tipoEquipo?: TipoEquipo | null
  nombreResponsable?: string | null
  marcaEquipo?: string | null
  modeloEquipo?: string | null
  serialEquipo?: string | null
  referencia?: string | null
  tiempoGarantiaMeses?: number | null
  fechaAdquisicion?: string | null
  tipoMonitor?: string | null
  tamanoPantallaPulgadas?: number | null
  procesadorMarca?: string | null
  procesadorModelo?: string | null
  procesadorBits?: string | null
  nucleosCpu?: number | null
  velocidadProcesador?: string | null
  memoriaRamGb?: number | null
  cantidadDiscosDuros?: number | null
  tecnologiaDisco1?: string | null
  capacidadDisco1Gb?: number | null
  tecnologiaDisco2?: string | null
  capacidadDisco2Gb?: number | null
  lectorDvdCd?: boolean | null
  tarjetaVideoIntegrada?: boolean | null
  tarjetaVideoIndependiente?: boolean | null
  conectoresVga?: number | null
  puertosHdmi?: number | null
  puertosUsb?: number | null
  puertosPci?: number | null
  puertosPciExpress?: number | null
  tarjetaEthernet?: boolean | null
  tarjetaRedInalambrica?: boolean | null
  marcaMouse?: string | null
  serialMouse?: string | null
  tipoConectorMouse?: string | null
  observaciones?: string | null
  fechaRealizacion?: string | null
  createdAt: string
  updatedAt: string
}

export interface GarantiaResponse {
  tieneGarantia: boolean
  enGarantia: boolean
  venceEl: string | null
  diasRestantes: number | null
}

export type CreateFichaDto = Omit<FichaTecnica, "id" | "createdAt" | "updatedAt">
export type UpdateFichaDto = Partial<CreateFichaDto>

export interface FichasFilter {
  serial?: string
  tipoEquipo?: TipoEquipo
}

export const fichasService = {
  list(filters?: FichasFilter): Promise<FichaTecnica[]> {
    const params = new URLSearchParams()
    if (filters?.serial) params.set("serial", filters.serial)
    if (filters?.tipoEquipo) params.set("tipoEquipo", filters.tipoEquipo)
    const qs = params.toString()
    return api.get<FichaTecnica[]>(`/ficha-tecnica${qs ? `?${qs}` : ""}`)
  },

  get(id: string): Promise<FichaTecnica> {
    return api.get<FichaTecnica>(`/ficha-tecnica/${id}`)
  },

  garantia(id: string): Promise<GarantiaResponse> {
    return api.get<GarantiaResponse>(`/ficha-tecnica/${id}/garantia`)
  },

  create(data: CreateFichaDto): Promise<FichaTecnica> {
    return api.post<FichaTecnica>("/ficha-tecnica", data)
  },

  update(id: string, data: UpdateFichaDto): Promise<FichaTecnica> {
    return api.patch<FichaTecnica>(`/ficha-tecnica/${id}`, data)
  },

  remove(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/ficha-tecnica/${id}`)
  },
}
