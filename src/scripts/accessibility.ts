const STORAGE_KEY = "sistek.a11y"

interface A11yState {
  scale: number
  contrast: boolean
  grayscale: boolean
  links: boolean
  legible: boolean
  motionOff: boolean
  hideImages: boolean
  highlightImages: boolean
  showAlt: boolean
}

const DEFAULT_STATE: A11yState = {
  scale: 0,
  contrast: false,
  grayscale: false,
  links: false,
  legible: false,
  motionOff: false,
  hideImages: false,
  highlightImages: false,
  showAlt: false
}

const SCALE_CLASSES = ["a11y-scale--2", "a11y-scale--1", "a11y-scale-1", "a11y-scale-2", "a11y-scale-3"]
const TOGGLE_KEYS = ["contrast", "grayscale", "links", "legible", "motionOff", "hideImages", "highlightImages", "showAlt"] as const

function loadState(): A11yState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Partial<A11yState>
    let scale = Number(parsed.scale)
    if (!Number.isFinite(scale)) scale = 0
    scale = Math.min(3, Math.max(-2, Math.round(scale)))
    return {
      scale,
      contrast: parsed.contrast === true,
      grayscale: parsed.grayscale === true,
      links: parsed.links === true,
      legible: parsed.legible === true,
      motionOff: parsed.motionOff === true,
      hideImages: parsed.hideImages === true,
      highlightImages: parsed.highlightImages === true,
      showAlt: parsed.showAlt === true
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

let saveTimer: number | undefined

function saveState(state: A11yState) {
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, 200)
}

function syncImageAlt(enabled: boolean) {
  if (!enabled) {
    document.querySelectorAll("img.a11y-alt-shown").forEach(img => {
      const label = img.nextElementSibling as HTMLElement | null
      if (label && label.classList.contains("a11y-alt-label")) label.remove()
      img.classList.remove("a11y-alt-shown")
    })
    return
  }
  document.querySelectorAll("img").forEach(img => {
    if (img.classList.contains("a11y-alt-shown")) return
    const alt = img.getAttribute("alt")
    if (alt && alt.trim()) {
      const label = document.createElement("span")
      label.className = "a11y-alt-label"
      label.textContent = alt
      img.classList.add("a11y-alt-shown")
      img.insertAdjacentElement("afterend", label)
    }
  })
}

function applyState(state: A11yState) {
  const root = document.documentElement
  SCALE_CLASSES.forEach(cls => root.classList.remove(cls))
  if (state.scale !== 0) root.classList.add(`a11y-scale-${state.scale}`)
  root.classList.toggle("a11y-contrast", state.contrast)
  root.classList.toggle("a11y-grayscale", state.grayscale)
  root.classList.toggle("a11y-links", state.links)
  root.classList.toggle("a11y-legible", state.legible)
  root.classList.toggle("a11y-motion-off", state.motionOff)
  root.classList.toggle("a11y-hide-images", state.hideImages)
  root.classList.toggle("a11y-highlight-images", state.highlightImages)
  root.classList.toggle("a11y-show-alt", state.showAlt)
  syncImageAlt(state.showAlt)
}

const ICON_LAUNCHER =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="7.2" r="1.15" fill="currentColor" stroke="none"/><path d="M7.5 10h9"/><path d="M10 10v6.5"/><path d="M14 10v6.5"/><path d="M8.6 13.2l-1.8 4.4"/><path d="M15.4 13.2l1.8 4.4"/></svg>'
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
const ICON_MINUS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>'
const ICON_PLUS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
const ICON_RESET =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10a8 8 0 1 1 2 6"/><path d="M4 5v5h5"/></svg>'
const ICON_CONTRAST =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>'
const ICON_GRAYSCALE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.7 12 3.5 12 3.5z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/></svg>'
const ICON_LINKS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.6 5.23"/><path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07l1.42-1.42"/></svg>'
const ICON_LEGIBLE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7V5h12v2M10 5v14M7.5 19h5"/><path d="M17 12h5m0 0-2-2m2 2-2 2"/></svg>'
const ICON_MOTION =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4.5" height="16" rx="1.5"/><rect x="14.5" y="4" width="4.5" height="16" rx="1.5"/></svg>'
const ICON_HIDE_IMAGES =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c4.5 0 8 3 10 5a13.3 13.3 0 0 1-3 3.3"/><path d="M6.2 6.2C3.9 7.6 2 9.4 2 10c2 2 5.5 5 10 5 1.2 0 2.3-.2 3.3-.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
const ICON_HIGHLIGHT_IMAGES =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M8 18l1.5-5h5L16 18"/></svg>'
const ICON_SHOW_ALT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h7"/></svg>'

interface ToggleOption {
  key: (typeof TOGGLE_KEYS)[number]
  label: string
  hint: string
  icon: string
}

const TOGGLE_OPTIONS: ToggleOption[] = [
  { key: "contrast", label: "Contraste alto", hint: "Aumenta el contraste de colores", icon: ICON_CONTRAST },
  { key: "grayscale", label: "Escala de grises", hint: "Elimina los colores de la página", icon: ICON_GRAYSCALE },
  { key: "links", label: "Subrayar enlaces", hint: "Resalta visualmente todos los enlaces", icon: ICON_LINKS },
  { key: "legible", label: "Tipografía legible", hint: "Más espacio entre letras y líneas", icon: ICON_LEGIBLE },
  { key: "motionOff", label: "Pausar animaciones", hint: "Detiene movimientos y transiciones", icon: ICON_MOTION },
  { key: "hideImages", label: "Ocultar imágenes", hint: "Elimina las imágenes de la página", icon: ICON_HIDE_IMAGES },
  { key: "highlightImages", label: "Resaltar imágenes", hint: "Marca las imágenes con un borde", icon: ICON_HIGHLIGHT_IMAGES },
  { key: "showAlt", label: "Mostrar texto alternativo", hint: "Muestra la descripción de cada imagen", icon: ICON_SHOW_ALT }
]

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attrs?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v))
  return node
}

export function initAccessibility() {
  if (document.getElementById("a11y-launcher")) return

  let state = loadState()
  applyState(state)

  const launcher = el("button", "a11y-launcher", {
    id: "a11y-launcher",
    type: "button",
    "aria-expanded": "false",
    "aria-controls": "a11y-panel",
    "aria-haspopup": "dialog",
    title: "Opciones de accesibilidad"
  })
  launcher.innerHTML = ICON_LAUNCHER

  const panel = el("div", "a11y-panel", {
    id: "a11y-panel",
    role: "dialog",
    "aria-modal": "false",
    "aria-label": "Herramientas de accesibilidad",
    hidden: ""
  })

  const header = el("div", "a11y-header")
  const heading = el("strong")
  heading.textContent = "Accesibilidad"
  const closeBtn = el("button", "a11y-close", { type: "button", "aria-label": "Cerrar herramientas de accesibilidad" })
  closeBtn.innerHTML = ICON_CLOSE
  header.append(heading, closeBtn)

  const scaleRow = el("div", "a11y-row a11y-row-scale")
  const scaleLabel = el("span", "a11y-option-text")
  const scaleTitle = el("strong")
  scaleTitle.textContent = "Tamaño del texto"
  const scaleValue = el("small")
  scaleLabel.append(scaleTitle, scaleValue)

  const scaleControls = el("div", "a11y-scale-controls")
  const decreaseBtn = el("button", "a11y-icon-btn", { type: "button", "aria-label": "Reducir tamaño del texto" })
  decreaseBtn.innerHTML = ICON_MINUS
  const resetScaleBtn = el("button", "a11y-icon-btn", { type: "button", "aria-label": "Restablecer tamaño del texto" })
  resetScaleBtn.textContent = "A"
  const increaseBtn = el("button", "a11y-icon-btn", { type: "button", "aria-label": "Aumentar tamaño del texto" })
  increaseBtn.innerHTML = ICON_PLUS
  scaleControls.append(decreaseBtn, resetScaleBtn, increaseBtn)
  scaleRow.append(scaleLabel, scaleControls)

  const optionsList = el("div", "a11y-options")
  const optionButtons = new Map<string, HTMLButtonElement>()

  TOGGLE_OPTIONS.forEach(option => {
    const btn = el("button", "a11y-option", { type: "button", "aria-pressed": "false" })
    const iconWrap = el("span", "a11y-option-icon")
    iconWrap.innerHTML = option.icon
    const text = el("span", "a11y-option-text")
    const title = el("strong")
    title.textContent = option.label
    const hint = el("small")
    hint.textContent = option.hint
    text.append(title, hint)
    btn.append(iconWrap, text)
    btn.addEventListener("click", () => {
      state[option.key] = !state[option.key]
      update()
    })
    optionButtons.set(option.key, btn)
    optionsList.appendChild(btn)
  })

  const footerRow = el("div", "a11y-footer")
  const resetBtn = el("button", "a11y-reset", { type: "button" })
  resetBtn.innerHTML = `${ICON_RESET}<span>Restablecer todo</span>`
  footerRow.appendChild(resetBtn)

  panel.append(header, scaleRow, optionsList, footerRow)
  document.body.append(launcher, panel)

  function syncScaleUI() {
    const percent = state.scale === 0 ? "Normal" : `${Math.round(100 * Math.pow(1.125, state.scale))}%`
    scaleValue.textContent = percent
    decreaseBtn.disabled = state.scale <= -2
    increaseBtn.disabled = state.scale >= 3
    resetScaleBtn.disabled = state.scale === 0
  }

  function update() {
    applyState(state)
    saveState(state)
    syncScaleUI()
    optionButtons.forEach((btn, key) => {
      btn.setAttribute("aria-pressed", String(Boolean(state[key as keyof A11yState])))
      btn.classList.toggle("is-active", Boolean(state[key as keyof A11yState]))
    })
  }

  function open() {
    panel.hidden = false
    launcher.setAttribute("aria-expanded", "true")
    ;(decreaseBtn.disabled ? (resetScaleBtn as HTMLButtonElement) : decreaseBtn).focus()
  }

  function close(returnFocus = true) {
    panel.hidden = true
    launcher.setAttribute("aria-expanded", "false")
    if (returnFocus) launcher.focus()
  }

  const isOpen = () => !panel.hidden

  launcher.addEventListener("click", () => (isOpen() ? close() : open()))
  closeBtn.addEventListener("click", () => close())
  decreaseBtn.addEventListener("click", () => {
    state.scale = Math.max(-2, state.scale - 1)
    update()
  })
  increaseBtn.addEventListener("click", () => {
    state.scale = Math.min(3, state.scale + 1)
    update()
  })
  resetScaleBtn.addEventListener("click", () => {
    state.scale = 0
    update()
  })
  resetBtn.addEventListener("click", () => {
    state = { ...DEFAULT_STATE }
    update()
  })

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && isOpen()) close()
  })

  document.addEventListener("click", event => {
    if (!isOpen()) return
    const target = event.target as Node | null
    if (target && !panel.contains(target) && target !== launcher && !launcher.contains(target)) close(false)
  })

  update()
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAccessibility)
} else {
  initAccessibility()
}
