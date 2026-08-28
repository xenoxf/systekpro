import React, { type FormEvent, useState } from "react"
import { authService, setSession } from "@/services/auth"
import { isApiError } from "@/services/api"
import { IconArrowLeft, IconEye, IconEyeOff } from "@tabler/icons-react"

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
    <div className="container-auth">
      <a href="/" className="back" aria-label="Volver al inicio">
        <IconArrowLeft size={36} aria-hidden="true" />
      </a>
      <div className="auth">
        <h1>Iniciar sesión</h1>
        <div className="container-form">
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
            <button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
