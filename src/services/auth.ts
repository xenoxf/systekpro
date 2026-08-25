import { api } from "./api"

export type AuthRole = "admin" | "mantenimiento"

export interface AuthUser {
  id: string
  name: string
  role: AuthRole
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export const SESSION_KEY = "sistek.session"

export const authService = {
  login(name: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/login", { name, password }, false)
  },
}

export function getSession(): AuthResponse | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthResponse
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function setSession(session: AuthResponse): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
