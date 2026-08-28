import React, { useCallback, useEffect, useState } from "react"
import { IconFileText, IconUsers, IconLogout, IconShieldCheck } from "@tabler/icons-react"
import { clearSession, getSession, type AuthUser } from "@/services/auth"
import { canAccessSection, type PanelSection } from "@/services/permissions"
import FichasSection from "./FichasSection"
import UsersSection from "./UsersSection"

const USERS_HASH = "#usuarios"

function viewFromHash(): PanelSection {
  if (typeof window === "undefined") return "fichas"
  return window.location.hash === USERS_HASH ? "usuarios" : "fichas"
}

export default function SistemaApp() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [view, setView] = useState<PanelSection>("fichas")
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session?.user) {
      clearSession()
      window.location.replace("/auth")
      return
    }
    setUser(session.user)
    setChecking(false)
  }, [])

  useEffect(() => {
    function syncFromHash() {
      const next = viewFromHash()
      if (!canAccessSection(user, next)) {
        history.replaceState(null, "", window.location.pathname)
        setView("fichas")
        return
      }
      setView(next)
    }
    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    return () => window.removeEventListener("hashchange", syncFromHash)
  }, [user])

  const selectView = useCallback(
    (next: PanelSection) => {
      if (!canAccessSection(user, next)) {
        history.replaceState(null, "", window.location.pathname)
        setView("fichas")
        return
      }
      if (next === "usuarios") {
        window.location.hash = USERS_HASH.slice(1)
      } else {
        history.replaceState(null, "", window.location.pathname)
        setView("fichas")
      }
    },
    [user],
  )

  function handleLogout() {
    clearSession()
    window.location.replace("/auth")
  }

  if (!user && checking) {
    return (
      <div className="sys-container">
        <p className="sys-loading sys-loading--page">Verificando sesión...</p>
      </div>
    )
  }

  const sectionTitle = view === "fichas" ? "Fichas técnicas" : "Usuarios"

  return (
    <div className="sys-shell">
      <aside className="sys-sidebar" aria-label="Panel de navegación">
        <div className="sys-brand">
          <span className="sys-brand-logo" aria-hidden="true">
            <IconShieldCheck size={22} />
          </span>
          <div>
            <strong>Sistek · Panel</strong>
            <span>Sistema de gestión</span>
          </div>
        </div>

        <nav className="sys-nav" role="tablist" aria-label="Secciones del panel">
          <button
            type="button"
            id="tab-fichas"
            role="tab"
            aria-selected={view === "fichas"}
            aria-controls="panel-seccion"
            className={`sys-nav-item ${view === "fichas" ? "sys-nav-item--active" : ""}`}
            onClick={() => selectView("fichas")}
          >
            <IconFileText size={18} aria-hidden="true" />
            <span>Fichas técnicas</span>
          </button>
          {canAccessSection(user, "usuarios") && (
            <button
              type="button"
              id="tab-usuarios"
              role="tab"
              aria-selected={view === "usuarios"}
              aria-controls="panel-seccion"
              className={`sys-nav-item ${view === "usuarios" ? "sys-nav-item--active" : ""}`}
              onClick={() => selectView("usuarios")}
            >
              <IconUsers size={18} aria-hidden="true" />
              <span>Usuarios</span>
            </button>
          )}
        </nav>

        <div className="sys-sidebar-footer">
          <div className="sys-user">
            <div className="sys-user-info">
              <strong>{user.name}</strong>
              <span className={`sys-badge ${user.role === "admin" ? "sys-badge--primary" : ""}`}>{user.role}</span>
            </div>
            <button type="button" className="sys-btn sys-btn--ghost" onClick={handleLogout}>
              <IconLogout size={16} />
              Salir
            </button>
          </div>
        </div>
      </aside>

      <div className="sys-content">
        <header className="sys-topbar">
          <div>
            <p className="sys-topbar-eyebrow">Sección actual</p>
            <h1 className="sys-topbar-title">{sectionTitle}</h1>
          </div>
        </header>

        <main className="sys-main">
          <div
            id="panel-seccion"
            role="tabpanel"
            aria-labelledby={view === "fichas" ? "tab-fichas" : "tab-usuarios"}
          >
            {view === "fichas" || !canAccessSection(user, "usuarios") ? <FichasSection /> : <UsersSection />}
          </div>
        </main>
      </div>
    </div>
  )
}
