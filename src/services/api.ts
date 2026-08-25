const API_URL: string =
  import.meta.env.PUBLIC_API_URL ?? "https://sistekpro-backend.onrender.com"
const API_KEY: string = import.meta.env.PUBLIC_API_KEY ?? ""

export const FORBIDDEN_MESSAGE = "No tienes permisos para acceder a este recurso"

export class ApiError extends Error {
  statusCode: number
  messages: string[]

  constructor(statusCode: number, messages: string[]) {
    super(messages.join(" · "))
    this.name = "ApiError"
    this.statusCode = statusCode
    this.messages = messages
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
}

function buildHeaders(auth: boolean): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  }
  if (auth) {
    const token = getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("sistek.session")
    if (!raw) return null
    return (JSON.parse(raw) as { token?: string }).token ?? null
  } catch {
    return null
  }
}

function handleUnauthorized(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("sistek.session")
  window.location.replace("/auth")
}

async function request<T>(path: string, options: RequestOptions = {}, auth = true): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...buildHeaders(auth), ...(options.headers as Record<string, string>) },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, ["No se pudo conectar con el servidor"])
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null

    if (response.status === 401 && auth && !path.startsWith("/auth/login")) {
      handleUnauthorized()
    }

    const raw = errorBody?.message ?? "Error en la solicitud"
    let messages = Array.isArray(raw) ? raw : [raw]
    if (response.status === 403) messages = [FORBIDDEN_MESSAGE]
    throw new ApiError(response.status, messages)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" })
  },
  post<T>(path: string, body?: unknown, auth = true): Promise<T> {
    return request<T>(path, { method: "POST", body }, auth)
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "PATCH", body })
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" })
  },
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
