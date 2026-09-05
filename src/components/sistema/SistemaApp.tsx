import React, { useCallback, useEffect, useState } from "react"
import "@/styles/sistema/index.css"
import { IconFileText, IconUsers, IconTool, IconLogout, IconShieldCheck, IconMenu2 } from "@tabler/icons-react"
import { clearSession, getSession, type AuthUser } from "@/services/auth"
import { canAccessSection, type PanelSection } from "@/services/permissions"
import FichasSection from "./FichasSection"
import OrdenesSection from "./OrdenesSection"
import UsersSection from "./UsersSection"

const USERS_HASH = "#usuarios"
const ORDENES_HASH = "#ordenes"

function viewFromHash(): PanelSection {
  if (typeof window === "undefined") return "fichas"
  if (window.location.hash === USERS_HASH) return "usuarios"
  if (window.location.hash === ORDENES_HASH) return "ordenes"
  return "fichas"
}

export default function SistemaApp() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [view, setView] = useState<PanelSection>("fichas")
  const [checking, setChecking] = useState(true)
  const [navOpen, setNavOpen] = useState(false)

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
      setNavOpen(false)
      if (!canAccessSection(user, next)) {
        history.replaceState(null, "", window.location.pathname)
        setView("fichas")
        return
      }
      if (next === "usuarios") {
        window.location.hash = USERS_HASH.slice(1)
      } else if (next === "ordenes") {
        window.location.hash = ORDENES_HASH.slice(1)
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

  const sectionTitle =
    view === "fichas"
      ? "Fichas técnicas"
      : view === "ordenes"
        ? "Órdenes de servicio"
        : "Usuarios"

  return (
    <div className="sys-shell">
      <div
        className={`sys-sidebar-overlay ${navOpen ? "is-open" : ""}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sys-sidebar ${navOpen ? "is-open" : ""}`} aria-label="Panel de navegación">
        <div className="sys-brand">
          <span className="sys-brand-logo" aria-hidden="true">
            <IconShieldCheck size={18} />
          </span>
          <div>
            <strong>Sistek · Panel</strong>
            <span>Sistema de gestión</span>
          </div>
        </div>

        <nav className="sys-nav" role="tablist" aria-label="Secciones del panel">
          <p className="sys-nav-label" aria-hidden="true">Gestión</p>
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
          <button
            type="button"
            id="tab-ordenes"
            role="tab"
            aria-selected={view === "ordenes"}
            aria-controls="panel-seccion"
            className={`sys-nav-item ${view === "ordenes" ? "sys-nav-item--active" : ""}`}
            onClick={() => selectView("ordenes")}
          >
            <IconTool size={18} aria-hidden="true" />
            <span>Órdenes</span>
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
            <div className="sys-user-info" title={user?.name}>
              <span
                aria-hidden="true"
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  background: "hsl(var(--primary) / 0.12)",
                  color: "hsl(var(--primary))",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  border: "1px solid hsl(var(--primary) / 0.15)",
                }}
              >
                {user?.name?.slice(0, 2).toUpperCase() ?? "US"}
              </span>
              <strong>{user?.name}</strong>
            </div>
            <button type="button" className="sys-btn sys-btn--ghost" onClick={handleLogout} style={{ minHeight: "32px", padding: "0 0.625rem", fontSize: "0.75rem", borderRadius: "999px" }}>
              <IconLogout size={14} aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>
      </aside>

      <div className="sys-content">
        <header className="sys-topbar">
          <div className="sys-topbar-inner">
            <button
              type="button"
              className="sys-menu-btn"
              onClick={() => setNavOpen(true)}
              aria-label="Abrir navegación"
            >
              <IconMenu2 size={20} aria-hidden="true" />
            </button>
            <div style={{ minWidth: 0 }}>
              <p className="sys-topbar-eyebrow">Sistek Pro · Panel</p>
              <h1 className="sys-topbar-title">{sectionTitle}</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <span className="sys-badge" style={{ fontSize: "0.6875rem" }}>{user?.name}</span>
          </div>
        </header>

        <main className="sys-main">
          <div
            id="panel-seccion"
            role="tabpanel"
            aria-labelledby={view === "fichas" ? "tab-fichas" : "tab-usuarios"}
          >
            {view === "ordenes" ? (
              <OrdenesSection />
            ) : view === "fichas" || !canAccessSection(user, "usuarios") ? (
              <FichasSection />
            ) : (
              <UsersSection />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
