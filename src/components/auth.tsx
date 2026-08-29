import React, { type FormEvent, useState } from "react"
import { authService, setSession } from "@/services/auth"
import { isApiError } from "@/services/api"
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconShieldCheck,
  IconFileText,
  IconTool,
  IconUsers,
} from "@tabler/icons-react"

export default function Auth() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await authService.login(name, password)
      setSession(response)
      window.location.href = "/sistema"
    } catch (err) {
      if (isApiError(err) && err.statusCode === 401) setError("Credenciales inválidas")
      else if (isApiError(err)) setError(err.message)
      else setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      <aside className="auth-aside">
        <div className="auth-aside-brand">
          <IconShieldCheck size={22} aria-hidden="true" />
          <span>Sistek</span> Pro
        </div>
        <div>
          <h1 className="auth-aside-title">Panel de gestión técnica</h1>
          <p className="auth-aside-sub">
            Administra fichas técnicas, órdenes de servicio y usuarios del sistema Sistek en un solo lugar.
          </p>
          <ul className="auth-aside-features">
            <li>
              <IconFileText size={18} aria-hidden="true" />
              Fichas técnicas de equipos
            </li>
            <li>
              <IconTool size={18} aria-hidden="true" />
              Órdenes de mantenimiento y código QR
            </li>
            <li>
              <IconUsers size={18} aria-hidden="true" />
              Gestión de usuarios y roles
            </li>
          </ul>
        </div>
        <p className="auth-aside-foot">Sistek · Cali, Colombia</p>
      </aside>

      <main className="auth-main">
        <a href="/" className="auth-back" aria-label="Volver al inicio">
          <IconArrowLeft size={20} aria-hidden="true" />
        </a>
        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-logo gradient-text">Sistek</span>
            <h2>Iniciar sesión</h2>
            <p className="auth-subtitle">Accede al panel de administración</p>
          </div>
          <form onSubmit={handleSubmit} className="form">
            <div>
              <label htmlFor="username" className="sr-only">Nombre de usuario</label>
              <input
                id="username"
                className="input-name"
                type="text"
                placeholder="nombre de usuario"
                autoComplete="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label htmlFor="password" className="sr-only">Contraseña</label>
              <div className="input-password">
                <input
                  id="password"
                  className="input-name"
                  type={showPassword ? "text" : "password"}
                  placeholder="contraseña..."
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <IconEyeOff size={20} aria-hidden="true" /> : <IconEye size={20} aria-hidden="true" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
