import React, { type FormEvent, useState } from "react"
import { authService, setSession } from "@/services/auth"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import styles from "@/styles/Auth.module.css"
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
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const username = name.trim()
    const pass = password

    if (!username) {
      toast.error("Ingresa tu nombre de usuario")
      return
    }
    if (!pass) {
      toast.error("Ingresa tu contraseña")
      return
    }

    setLoading(true)
    try {
      const response = await authService.login(username, pass)
      setSession(response)
      toast.success("Sesión iniciada correctamente")
      window.location.href = "/sistema"
    } catch (err) {
      if (isApiError(err) && err.statusCode === 401) toast.error("Credenciales inválidas")
      else if (isApiError(err)) toast.error(err.message)
      else toast.error("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (

      <main className={styles['auth-main']}>
        <a href="/" className={styles['auth-back']} aria-label="Volver al inicio">
          <IconArrowLeft size={20} aria-hidden="true" />
        </a>
        <div className={styles['auth-card']}>
          <div className={styles['auth-brand']}>
            <h2>Iniciar sesión</h2>
            <p className={styles['auth-subtitle']}>Accede al panel de administración</p>
          </div>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles['container-inputs']}>
              <label htmlFor="username" className="sr-only">Nombre de usuario</label>
              <input
                id="username"
                className={styles['input-name']}
                type="text"
                placeholder="nombre de usuario"
                autoComplete="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label htmlFor="password" className="sr-only">Contraseña</label>
              <div className={styles['input-password']}>
                <input
                  id="password"
                  className={styles['input-name']}
                  type={showPassword ? "text" : "password"}
                  placeholder="contraseña..."
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles['toggle-password']}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <IconEyeOff size={20} aria-hidden="true" /> : <IconEye size={20} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={`btn-primary ${styles['auth-submit']}`}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </main>
  )
}
