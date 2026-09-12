import type { AuthRole, AuthUser } from "./auth"

export type PanelSection = "fichas" | "ordenes" | "usuarios" | "departamentos" | "clientes" | "empleados" | "leads"

export const ADMIN_ROLE: AuthRole = "admin"
export const GERENTE_ROLE: AuthRole = "gerente"
export const MARKETING_ROLE: AuthRole = "marketing"

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === ADMIN_ROLE
}

export function isGerente(user: AuthUser | null | undefined): boolean {
  return user?.role === GERENTE_ROLE
}

export function isMarketing(user: AuthUser | null | undefined): boolean {
  return user?.role === MARKETING_ROLE
}

export function isAdminOrGerente(user: AuthUser | null | undefined): boolean {
  return user?.role === ADMIN_ROLE || user?.role === GERENTE_ROLE
}

export function isAdminOrMarketing(user: AuthUser | null | undefined): boolean {
  return user?.role === ADMIN_ROLE || user?.role === MARKETING_ROLE
}

export function isAdminOrGerenteOrMarketing(user: AuthUser | null | undefined): boolean {
  return user?.role === ADMIN_ROLE || user?.role === MARKETING_ROLE || user?.role === GERENTE_ROLE
}

export function canAccessSection(
  user: AuthUser | null | undefined,
  section: PanelSection,
): boolean {
  if (section === "usuarios") return isAdmin(user)
  if (section === "departamentos" || section === "empleados") return isAdminOrGerente(user)
  if (section === "leads") return isAdminOrGerenteOrMarketing(user)
  // fichas, ordenes, clientes -> admin, gerente, mantenimiento. Marketing solo ve leads.
  if (section === "fichas" || section === "ordenes" || section === "clientes") {
    return isAdmin(user) || isGerente(user) || user?.role === "mantenimiento"
  }
  return true
}

export function getDefaultSection(user: AuthUser | null | undefined): PanelSection {
  if (isMarketing(user) && !isAdmin(user)) return "leads"
  return "fichas"
}

// Solo admin puede eliminar (backend: DELETE @Roles(admin)) y gestionar usuarios.
// Gerente: ver + crear + editar fichas, ordenes, departamentos, empleados, clientes.
export function canDelete(user: AuthUser | null | undefined): boolean {
  return isAdmin(user)
}

export function canManageUsers(user: AuthUser | null | undefined): boolean {
  return isAdmin(user)
}
