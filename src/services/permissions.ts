import type { AuthRole, AuthUser } from "./auth"

export type PanelSection = "fichas" | "ordenes" | "usuarios"

export const ADMIN_ROLE: AuthRole = "admin"

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === ADMIN_ROLE
}

export function canAccessSection(
  user: AuthUser | null | undefined,
  section: PanelSection,
): boolean {
  if (section === "usuarios") return isAdmin(user)
  return true
}
