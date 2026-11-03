import type { AuthRole, AuthUser } from "./auth"

export type PanelSection = "fichas" | "ordenes" | "usuarios" | "departamentos" | "clientes" | "empleados" | "leads" | "basedatos"

export const ADMIN_ROLE: AuthRole = "admin"
export const GERENTE_ROLE: AuthRole = "gerente"

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === ADMIN_ROLE
}

export function isGerente(user: AuthUser | null | undefined): boolean {
  return user?.role === GERENTE_ROLE
}

export function isAdminOrGerente(user: AuthUser | null | undefined): boolean {
  return user?.role === ADMIN_ROLE || user?.role === GERENTE_ROLE
}

export function canAccessSection(
  user: AuthUser | null | undefined,
  section: PanelSection,
): boolean {
  if (section === "usuarios") return isAdmin(user)
  if (section === "basedatos") return true
  if (section === "departamentos" || section === "empleados") return isAdminOrGerente(user)
  // Formularios: todos los autenticados. El backend recorta la lista a los
  // servicios del departamento del usuario; admin y gerencia ven todos.
  if (section === "leads") return true
  // fichas, ordenes, clientes -> admin, gerente, mantenimiento. El resto de
  // departamentos (marketing, redes, informática...) trabaja con formularios.
  if (section === "fichas" || section === "ordenes" || section === "clientes") {
    return isAdmin(user) || isGerente(user) || user?.role === "mantenimiento"
  }
  return true
}

export function getDefaultSection(user: AuthUser | null | undefined): PanelSection {
  // Quien no opera fichas ni órdenes arranca en sus formularios.
  if (isAdminOrGerente(user) || user?.role === "mantenimiento") return "fichas"
  return "leads"
}

// Solo admin puede eliminar (backend: DELETE @Roles(admin)) y gestionar usuarios.
// Gerente: ver + crear + editar fichas, ordenes, departamentos, empleados, clientes.
export function canDelete(user: AuthUser | null | undefined): boolean {
  return isAdmin(user)
}

export function canManageUsers(user: AuthUser | null | undefined): boolean {
  return isAdmin(user)
}
