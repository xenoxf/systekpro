/**
 * Servicios del formulario de contacto y el departamento que los atiende.
 *
 * Espejo de `sistek-b/src/leads/servicio-departamento.ts`: el backend valida
 * la lista de servicios y con ella recorta los formularios que ve cada rol.
 * Si agregas un servicio aquí, agrégalo también en el backend.
 */

/** Servicio => clave del departamento responsable (`null` = sin departamento). */
export const SERVICIO_DEPARTAMENTO: Record<string, string | null> = {
  mantenimiento: "mantenimiento",
  redes: "redes",
  cableado: "redes",
  configuracion: "redes",
  wifi: "redes",
  "redes-datos": "redes",
  soporte: "mantenimiento",
  remoto: "mantenimiento",
  web: "informatica",
  capacitacion: "capacitacion",
  marketing: "marketing",
  otro: null,
}

/** Etiqueta legible de cada servicio (incluye los históricos: wifi, otro). */
export const SERVICIO_LABEL: Record<string, string> = {
  mantenimiento: "Mantenimiento de equipos",
  redes: "Instalación de redes",
  cableado: "Cableado estructurado",
  configuracion: "Configuración de routers/switches",
  wifi: "Redes inalámbricas (Wi-Fi)",
  "redes-datos": "Diseño y mantenimiento de redes de datos",
  soporte: "Soporte técnico",
  remoto: "Asistencia técnica remota",
  web: "Desarrollo y mantenimiento web",
  capacitacion: "Capacitación tecnológica",
  marketing: "Marca, redes sociales y campañas",
  otro: "Otro",
}

/** Etiqueta legible de los departamentos (claves usadas como rol). */
export const DEPARTAMENTO_LABEL: Record<string, string> = {
  admin: "Admin",
  gerente: "Gerente",
  gerencia: "Gerencia",
  administracion: "Administración",
  marketing: "Marketing",
  mantenimiento: "Mantenimiento",
  redes: "Redes",
  informatica: "Informática",
  capacitacion: "Capacitación",
  ventas: "Ventas",
  soporte: "Soporte",
}

/** Servicios que ofrece el formulario público (mismo orden que en el select). */
const SERVICIOS_CONTACTO: string[] = [
  "mantenimiento",
  "redes",
  "cableado",
  "configuracion",
  "soporte",
  "remoto",
  "redes-datos",
  "web",
  "capacitacion",
  "marketing",
  "otro",
]

export interface ServicioOpcion {
  value: string
  label: string
}

export const opcionesServicio: ServicioOpcion[] = SERVICIOS_CONTACTO.map(
  (value) => ({ value, label: SERVICIO_LABEL[value] ?? value }),
)

/** Departamento responsable de un servicio del formulario. */
export function departamentoDelServicio(servicio: string): string | null {
  return SERVICIO_DEPARTAMENTO[servicio] ?? null
}

export function servicioLabel(servicio?: string | null): string {
  if (!servicio) return "—"
  return SERVICIO_LABEL[servicio] ?? servicio
}

/**
 * Etiqueta legible de una clave de departamento o rol
 * (`informatica` -> `Informática`). Si no está en el catálogo, se decapita la
 * clave: `desarrollo-web` -> `Desarrollo web`.
 */
export function departamentoLabel(clave?: string | null): string {
  if (!clave) return "—"
  const known = DEPARTAMENTO_LABEL[clave]
  if (known) return known
  return nombreLegible(clave)
}

/** Convierte una clave en texto legible: `mi-departamento` -> `Mi departamento`. */
export function nombreLegible(clave: string): string {
  const texto = clave.replace(/[-_]+/g, " ").trim()
  if (!texto) return "—"
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Normaliza un nombre a clave, igual que el backend (`Informática` -> `informatica`). */
export function claveDeNombre(nombre?: string | null): string {
  if (!nombre) return ""
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
