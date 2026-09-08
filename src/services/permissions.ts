import type { AuthRole, AuthUser } from "./auth"

export type PanelSection = "fichas" | "ordenes" | "usuarios" | "departamentos" | "clientes" | "empleados"

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
  if (section === "departamentos" || section === "empleados") return isAdminOrGerente(user)
  // fichas, ordenes, clientes -> cualquier autenticado
  return true
}

// Solo admin puede eliminar (backend: DELETE @Roles(admin)) y gestionar usuarios.
// Gerente: ver + crear + editar fichas, ordenes, departamentos, empleados, clientes.
export function canDelete(user: AuthUser | null | undefined): boolean {
  return isAdmin(user)
}

export function canManageUsers(user: AuthUser | null | undefined): boolean {
  return isAdmin(user)
}
