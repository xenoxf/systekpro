import React, { useCallback, useEffect, useState, lazy, Suspense } from "react"
import styles from "@/styles/SistemaApp.module.css"
import {
  IconFileText,
  IconUsers,
  IconTool,
  IconLogout,
  IconShieldCheck,
  IconMenu2,
  IconBuilding,
  IconUsersGroup,
  IconBriefcase,
  IconInbox,
} from "@tabler/icons-react"
import { clearSession, getSession, type AuthUser } from "@/services/auth"
import { canAccessSection, getDefaultSection, type PanelSection } from "@/services/permissions"

// Lazy-load pesado: evita que /sistema cargue todas las secciones a la vez.
// Cada sección se code-split en chunk separado y solo se descarga al navegar.
const FichasSection = lazy(() => import("./FichasSection"))
const OrdenesSection = lazy(() => import("./OrdenesSection"))
const UsersSection = lazy(() => import("./UsersSection"))
const DepartamentosSection = lazy(() => import("./DepartamentosSection"))
const ClientesSection = lazy(() => import("./ClientesSection"))
const EmpleadosSection = lazy(() => import("./EmpleadosSection"))
const LeadsSection = lazy(() => import("./LeadsSection"))

function SectionFallback() {
  return (
    <div className={styles['sys-loading']} style={{ padding: "2rem", justifyContent: "center" }}>
      <span className={styles['sys-spinner']} aria-hidden="true" style={{ width: "1.25rem", height: "1.25rem", borderWidth: "2px" }} />
      <span>Cargando sección...</span>
    </div>
  )
}

class SectionErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; msg?: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(err: unknown) {
    return { hasError: true, msg: err instanceof Error ? err.message : String(err) }
  }
  componentDidCatch(error: unknown) {
    console.error("[SistemaApp] Section error:", error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className={styles['sys-panel']} style={{ padding: "1.25rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No se pudo cargar esta sección</p>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            Ocurrió un error al renderizar. Intenta recargar la página.
          </p>
          {this.state.msg && <code style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>{this.state.msg}</code>}
          <div style={{ marginTop: "0.75rem" }}>
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} onClick={() => window.location.reload()}>
              Recargar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const USERS_HASH = "#usuarios"
const ORDENES_HASH = "#ordenes"
const DEPARTAMENTOS_HASH = "#departamentos"
const CLIENTES_HASH = "#clientes"
const EMPLEADOS_HASH = "#empleados"
const LEADS_HASH = "#leads"

function viewFromHash(): PanelSection {
  if (typeof window === "undefined") return "fichas"
  const hash = window.location.hash
  if (hash === USERS_HASH) return "usuarios"
  if (hash === ORDENES_HASH) return "ordenes"
  if (hash === DEPARTAMENTOS_HASH) return "departamentos"
  if (hash === CLIENTES_HASH) return "clientes"
  if (hash === EMPLEADOS_HASH) return "empleados"
  if (hash === LEADS_HASH) return "leads"
  return "fichas"
}

const SECTION_HASH: Record<PanelSection, string | null> = {
  fichas: null,
  ordenes: ORDENES_HASH,
  usuarios: USERS_HASH,
  departamentos: DEPARTAMENTOS_HASH,
  clientes: CLIENTES_HASH,
  empleados: EMPLEADOS_HASH,
  leads: LEADS_HASH,
}

const SECTION_TAB_ID: Record<PanelSection, string> = {
  fichas: "tab-fichas",
  ordenes: "tab-ordenes",
  usuarios: "tab-usuarios",
  departamentos: "tab-departamentos",
  clientes: "tab-clientes",
  empleados: "tab-empleados",
  leads: "tab-leads",
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
        const fallback = getDefaultSection(user)
        if (next !== fallback) history.replaceState(null, "", window.location.pathname)
        setView(fallback)
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
        setView(getDefaultSection(user))
        return
      }
      const hash = SECTION_HASH[next]
      if (hash) {
        window.location.hash = hash.slice(1)
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
      <div className={styles['sys-container']}>
        <p className={`${styles['sys-loading']} ${styles['sys-loading--page']}`}>Verificando sesión...</p>
      </div>
    )
  }

  if (!user && !checking) {
    clearSession()
    window.location.replace("/auth")
    return
  }

  const sectionTitle =
    view === "fichas"
      ? "Fichas técnicas"
      : view === "ordenes"
        ? "Órdenes de servicio"
        : view === "departamentos"
          ? "Departamentos"
          : view === "clientes"
            ? "Clientes"
            : view === "empleados"
              ? "Empleados"
              : view === "leads"
                ? "Formularios"
                : "Usuarios"

  return (
    <div className={styles['sys-shell']}>
      <div
        className={`${styles['sys-sidebar-overlay']} ${navOpen ? styles['is-open'] : ""}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`${styles['sys-sidebar']} ${navOpen ? styles['is-open'] : ""}`} aria-label="Panel de navegación">
        <div className={styles['sys-brand']}>
          <span className={styles['sys-brand-logo']} aria-hidden="true">
            <IconShieldCheck size={18} />
          </span>
          <div>
            <span>Sistema de gestión</span>
          </div>
        </div>

        <nav className={styles['sys-nav']} role="tablist" aria-label="Secciones del panel">
          <p className={styles['sys-nav-label']} aria-hidden="true">Gestión</p>
          {canAccessSection(user, "fichas") && (
            <button
              type="button"
              id="tab-fichas"
              role="tab"
              aria-selected={view === "fichas"}
              aria-controls="panel-seccion"
              className={`${styles['sys-nav-item']} ${view === "fichas" ? styles['sys-nav-item--active'] : ""}`}
              onClick={() => selectView("fichas")}
            >
              <IconFileText size={18} aria-hidden="true" />
              <span>Fichas técnicas</span>
            </button>
          )}
          {canAccessSection(user, "ordenes") && (
            <button
              type="button"
              id="tab-ordenes"
              role="tab"
              aria-selected={view === "ordenes"}
              aria-controls="panel-seccion"
              className={`${styles['sys-nav-item']} ${view === "ordenes" ? styles['sys-nav-item--active'] : ""}`}
              onClick={() => selectView("ordenes")}
            >
              <IconTool size={18} aria-hidden="true" />
              <span>Órdenes</span>
            </button>
          )}
          {canAccessSection(user, "clientes") && (
            <button
              type="button"
              id="tab-clientes"
              role="tab"
              aria-selected={view === "clientes"}
              aria-controls="panel-seccion"
              className={`${styles['sys-nav-item']} ${view === "clientes" ? styles['sys-nav-item--active'] : ""}`}
              onClick={() => selectView("clientes")}
            >
              <IconUsersGroup size={18} aria-hidden="true" />
              <span>Clientes</span>
            </button>
          )}

          {canAccessSection(user, "leads") && (
            <button
              type="button"
              id="tab-leads"
              role="tab"
              aria-selected={view === "leads"}
              aria-controls="panel-seccion"
              className={`${styles['sys-nav-item']} ${view === "leads" ? styles['sys-nav-item--active'] : ""}`}
              onClick={() => selectView("leads")}
            >
              <IconInbox size={18} aria-hidden="true" />
              <span>Formularios</span>
            </button>
          )}

          <p className={styles['sys-nav-label']} aria-hidden="true" style={{ marginTop: "0.875rem" }}>Organización</p>
          {canAccessSection(user, "departamentos") && (
            <button
              type="button"
              id="tab-departamentos"
              role="tab"
              aria-selected={view === "departamentos"}
              aria-controls="panel-seccion"
              className={`${styles['sys-nav-item']} ${view === "departamentos" ? styles['sys-nav-item--active'] : ""}`}
              onClick={() => selectView("departamentos")}
            >
              <IconBuilding size={18} aria-hidden="true" />
              <span>Departamentos</span>
            </button>
          )}
          {canAccessSection(user, "empleados") && (
            <button
              type="button"
              id="tab-empleados"
              role="tab"
              aria-selected={view === "empleados"}
              aria-controls="panel-seccion"
              className={`${styles['sys-nav-item']} ${view === "empleados" ? styles['sys-nav-item--active'] : ""}`}
              onClick={() => selectView("empleados")}
            >
              <IconBriefcase size={18} aria-hidden="true" />
              <span>Empleados</span>
            </button>
          )}

          {canAccessSection(user, "usuarios") && (
            <>
              <p className={styles['sys-nav-label']} aria-hidden="true" style={{ marginTop: "0.875rem" }}>Administración</p>
              <button
                type="button"
                id="tab-usuarios"
                role="tab"
                aria-selected={view === "usuarios"}
                aria-controls="panel-seccion"
                className={`${styles['sys-nav-item']} ${view === "usuarios" ? styles['sys-nav-item--active'] : ""}`}
                onClick={() => selectView("usuarios")}
              >
                <IconUsers size={18} aria-hidden="true" />
                <span>Usuarios</span>
              </button>
            </>
          )}
        </nav>

        <div className={styles['sys-sidebar-footer']}>
          <div className={styles['sys-user']}>
            <div className={styles['sys-user-info']} title={user?.name}>
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
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={handleLogout} style={{ minHeight: "32px", padding: "0 0.625rem", fontSize: "0.75rem", borderRadius: "999px" }}>
              <IconLogout size={14} aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>
      </aside>

      <div className={styles['sys-content']}>
        <header className={styles['sys-topbar']}>
          <div className={styles['sys-topbar-inner']}>
            <button
              type="button"
              className={styles['sys-menu-btn']}
              onClick={() => setNavOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={navOpen}
              aria-controls="sys-sidebar"
            >
              <IconMenu2 size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className={styles['sys-main']}>
          <div
            id="panel-seccion"
            role="tabpanel"
            aria-labelledby={SECTION_TAB_ID[view] ?? "tab-fichas"}
          >
            <SectionErrorBoundary>
              <Suspense fallback={<SectionFallback />}>
                {view === "ordenes" ? (
                  <OrdenesSection />
                ) : view === "departamentos" ? (
                  <DepartamentosSection />
                ) : view === "clientes" ? (
                  <ClientesSection />
                ) : view === "empleados" ? (
                  <EmpleadosSection />
                ) : view === "usuarios" ? (
                  <UsersSection />
                ) : view === "leads" ? (
                  <LeadsSection />
                ) : (
                  <FichasSection />
                )}
              </Suspense>
            </SectionErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
