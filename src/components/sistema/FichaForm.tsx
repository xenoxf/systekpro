import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { TIPOS_EQUIPO, type FichaTecnica, type CreateFichaDto } from "@/services/fichas"
import { clientesService, type Cliente, type CreateClienteDto } from "@/services/clientes"
import { isApiError } from "@/services/api"
import { toast } from "@/components/starwind/toast"
import { Modal } from "./ui"
import styles from "@/styles/FichaForm.module.css"

interface Props {
  ficha?: FichaTecnica | null
  preselectedCliente?: Cliente | null
  submitting: boolean
  onSubmit: (dto: CreateFichaDto) => void
  onCancel: () => void
}

const NUMERIC_FIELDS = [
  "tiempoGarantiaMeses",
  "tamanoPantallaPulgadas",
  "nucleosCpu",
  "memoriaRamGb",
  "cantidadDiscosDuros",
  "capacidadDisco1Gb",
  "capacidadDisco2Gb",
  "conectoresVga",
  "puertosHdmi",
  "puertosUsb",
  "puertosPci",
  "puertosPciExpress",
] as const

const BOOLEAN_FIELDS = [
  "lectorDvdCd",
  "tarjetaVideoIntegrada",
  "tarjetaVideoIndependiente",
  "tarjetaEthernet",
  "tarjetaRedInalambrica",
] as const

type FormValues = Record<string, string | boolean>

function buildDto(values: FormValues): CreateFichaDto {
  const dto: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(values)) {
    if (BOOLEAN_FIELDS.includes(key as (typeof BOOLEAN_FIELDS)[number])) {
      dto[key] = Boolean(value)
      continue
    }
    if (value === "" || value == null) continue
    if ((NUMERIC_FIELDS as readonly string[]).includes(key)) {
      const num = Number(value)
      if (!Number.isNaN(num)) dto[key] = num
      continue
    }
    dto[key] = value
  }
  // tipoEquipo vacío ya se omite arriba; si quedó como "" no se envía
  // id_cliente vacío también se omite (ya filtrado). Si hay valor se valida como UUID en backend
  return dto as unknown as CreateFichaDto
}

function clienteLabel(c: Cliente): string {
  const nombre = `${c.nombre_cliente} ${c.apellido_cliente}`.trim()
  const extra = c.correo_cliente || c.telefono || c.dir || ""
  return extra ? `${nombre} — ${extra}` : nombre
}

export default function FichaForm({ ficha, preselectedCliente, submitting, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      id_cliente: (ficha as any)?.id_cliente ?? preselectedCliente?.id_cliente ?? "",
      nombreCliente: ficha?.nombreCliente ?? (preselectedCliente ? `${preselectedCliente.nombre_cliente} ${preselectedCliente.apellido_cliente}` : ""),
      telefonoCliente: ficha?.telefonoCliente ?? preselectedCliente?.telefono ?? "",
      direccionCliente: ficha?.direccionCliente ?? preselectedCliente?.dir ?? "",
      correoCliente: ficha?.correoCliente ?? preselectedCliente?.correo_cliente ?? "",
      servicio: ficha?.servicio ?? "",
      tipoEquipo: ficha?.tipoEquipo ?? "",
      nombreResponsable: ficha?.nombreResponsable ?? "",
      marcaEquipo: ficha?.marcaEquipo ?? "",
      modeloEquipo: ficha?.modeloEquipo ?? "",
      serialEquipo: ficha?.serialEquipo ?? "",
      referencia: ficha?.referencia ?? "",
      fechaAdquisicion: ficha?.fechaAdquisicion?.slice(0, 10) ?? "",
      tiempoGarantiaMeses: ficha?.tiempoGarantiaMeses?.toString() ?? "",
      fechaRealizacion: ficha?.fechaRealizacion?.slice(0, 10) ?? "",
      tipoMonitor: ficha?.tipoMonitor ?? "",
      tamanoPantallaPulgadas: ficha?.tamanoPantallaPulgadas?.toString() ?? "",
      procesadorMarca: ficha?.procesadorMarca ?? "",
      procesadorModelo: ficha?.procesadorModelo ?? "",
      procesadorBits: ficha?.procesadorBits ?? "",
      nucleosCpu: ficha?.nucleosCpu?.toString() ?? "",
      velocidadProcesador: ficha?.velocidadProcesador ?? "",
      memoriaRamGb: ficha?.memoriaRamGb?.toString() ?? "",
      cantidadDiscosDuros: ficha?.cantidadDiscosDuros?.toString() ?? "",
      tecnologiaDisco1: ficha?.tecnologiaDisco1 ?? "",
      capacidadDisco1Gb: ficha?.capacidadDisco1Gb?.toString() ?? "",
      tecnologiaDisco2: ficha?.tecnologiaDisco2 ?? "",
      capacidadDisco2Gb: ficha?.capacidadDisco2Gb?.toString() ?? "",
      lectorDvdCd: ficha?.lectorDvdCd ?? false,
      tarjetaVideoIntegrada: ficha?.tarjetaVideoIntegrada ?? false,
      tarjetaVideoIndependiente: ficha?.tarjetaVideoIndependiente ?? false,
      conectoresVga: ficha?.conectoresVga?.toString() ?? "",
      puertosHdmi: ficha?.puertosHdmi?.toString() ?? "",
      puertosUsb: ficha?.puertosUsb?.toString() ?? "",
      puertosPci: ficha?.puertosPci?.toString() ?? "",
      puertosPciExpress: ficha?.puertosPciExpress?.toString() ?? "",
      tarjetaEthernet: ficha?.tarjetaEthernet ?? false,
      tarjetaRedInalambrica: ficha?.tarjetaRedInalambrica ?? false,
      marcaMouse: ficha?.marcaMouse ?? "",
      serialMouse: ficha?.serialMouse ?? "",
      tipoConectorMouse: ficha?.tipoConectorMouse ?? "",
      observaciones: ficha?.observaciones ?? "",
    },
  })

  const idClienteWatch = watch("id_cliente") as string | undefined
  const nombreClienteWatch = watch("nombreCliente") as string | undefined

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(() => {
    if (preselectedCliente) return preselectedCliente
    if ((ficha as any)?.cliente) return (ficha as any).cliente as Cliente
    return null
  })
  const [clienteSearch, setClienteSearch] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clientesLoading, setClientesLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)

  // Nuevo cliente modal
  const [showNuevo, setShowNuevo] = useState(false)
  const [nuevoForm, setNuevoForm] = useState<CreateClienteDto>({ nombre_cliente: "", apellido_cliente: "", correo_cliente: "", telefono: "", dir: "", tipo_cliente: "" })
  const [nuevoError, setNuevoError] = useState<string | null>(null)
  const [nuevoSubmitting, setNuevoSubmitting] = useState(false)

  // Si ficha trae id_cliente pero no el objeto cliente, fetch para mostrar seleccionado
  useEffect(() => {
    const fid = (ficha as any)?.id_cliente as string | undefined
    const hasClienteObj = (ficha as any)?.cliente
    if (fid && !hasClienteObj && !selectedCliente && !preselectedCliente) {
      clientesService.get(fid).then((c) => {
        setSelectedCliente(c)
        setValue("id_cliente", c.id_cliente)
        setValue("nombreCliente", `${c.nombre_cliente} ${c.apellido_cliente}`)
        setValue("telefonoCliente", c.telefono ?? "")
        setValue("direccionCliente", c.dir ?? "")
        setValue("correoCliente", c.correo_cliente ?? "")
      }).catch(() => {})
    }
  }, [ficha, preselectedCliente, selectedCliente, setValue])

  // Si preselectedCliente cambia (navegación desde ClientesSection), seleccionarlo
  useEffect(() => {
    if (preselectedCliente) {
      setSelectedCliente(preselectedCliente)
      setValue("id_cliente", preselectedCliente.id_cliente)
      setValue("nombreCliente", `${preselectedCliente.nombre_cliente} ${preselectedCliente.apellido_cliente}`)
      setValue("telefonoCliente", preselectedCliente.telefono ?? "")
      setValue("direccionCliente", preselectedCliente.dir ?? "")
      setValue("correoCliente", preselectedCliente.correo_cliente ?? "")
    }
  }, [preselectedCliente, setValue])

  // Búsqueda de clientes con debounce 300ms
  useEffect(() => {
    if (!dropdownOpen) return
    const term = clienteSearch.trim()
    const timer = setTimeout(async () => {
      setClientesLoading(true)
      try {
        const res = await clientesService.list({ search: term || undefined, limit: 20, page: 1 })
        setClientes(res.data)
      } catch {
        setClientes([])
      } finally {
        setClientesLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [clienteSearch, dropdownOpen])

  // Carga inicial al abrir dropdown sin término
  useEffect(() => {
    if (dropdownOpen && clientes.length === 0 && !clienteSearch.trim()) {
      setClientesLoading(true)
      clientesService.list({ limit: 20, page: 1 }).then((res) => setClientes(res.data)).catch(() => setClientes([])).finally(() => setClientesLoading(false))
    }
  }, [dropdownOpen, clientes.length, clienteSearch])

  // Cerrar dropdown al click fuera
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  function handleSelectCliente(c: Cliente) {
    setSelectedCliente(c)
    setValue("id_cliente", c.id_cliente, { shouldDirty: true })
    setValue("nombreCliente", `${c.nombre_cliente} ${c.apellido_cliente}`, { shouldDirty: true })
    setValue("telefonoCliente", c.telefono ?? "", { shouldDirty: true })
    setValue("direccionCliente", c.dir ?? "", { shouldDirty: true })
    setValue("correoCliente", c.correo_cliente ?? "", { shouldDirty: true })
    setClienteSearch("")
    setDropdownOpen(false)
  }

  function handleDesvincular() {
    setSelectedCliente(null)
    setValue("id_cliente", "", { shouldDirty: true })
    // Al desvincular, deja nombre manual pero limpia los autocompletados para que sean editables
    // No borra nombreCliente si ya tenía valor manual, solo habilita edición
    setValue("telefonoCliente", "", { shouldDirty: true })
    setValue("direccionCliente", "", { shouldDirty: true })
    setValue("correoCliente", "", { shouldDirty: true })
  }

  async function handleCrearCliente(e: React.FormEvent) {
    e.preventDefault()
    setNuevoError(null)
    const nombre = nuevoForm.nombre_cliente.trim()
    const apellido = nuevoForm.apellido_cliente.trim()
    if (nombre.length < 2 || nombre.length > 80) { setNuevoError("Nombre debe tener entre 2 y 80 caracteres."); return }
    if (apellido.length < 2 || apellido.length > 80) { setNuevoError("Apellido debe tener entre 2 y 80 caracteres."); return }
    if (nuevoForm.correo_cliente && nuevoForm.correo_cliente.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoForm.correo_cliente.trim())) {
      setNuevoError("Correo electrónico no válido."); return
    }
    const dto: CreateClienteDto = {
      nombre_cliente: nombre,
      apellido_cliente: apellido,
      correo_cliente: nuevoForm.correo_cliente?.trim() || null,
      telefono: nuevoForm.telefono?.trim() || null,
      dir: nuevoForm.dir?.trim() || null,
      tipo_cliente: nuevoForm.tipo_cliente?.trim() || null,
    }
    setNuevoSubmitting(true)
    try {
      const creado = await clientesService.create(dto)
      toast.success("Cliente creado y vinculado")
      setShowNuevo(false)
      setNuevoForm({ nombre_cliente: "", apellido_cliente: "", correo_cliente: "", telefono: "", dir: "", tipo_cliente: "" })
      handleSelectCliente(creado)
    } catch (err) {
      if (isApiError(err)) {
        if (err.statusCode === 409 || err.statusCode === 400) setNuevoError(err.messages.join("\n"))
        else toast.error(err.message)
      } else {
        setNuevoError("No se pudo crear el cliente")
      }
    } finally {
      setNuevoSubmitting(false)
    }
  }

  const isLinked = !!selectedCliente && !!idClienteWatch

  // submit wrapper: asegura que si está vinculado, nombreCliente viene del cliente y no vacío
  function onHandleSubmit(values: FormValues) {
    const dto = buildDto(values)
    // Si está vinculado, asegurar id_cliente y nombreCliente coherentes
    if (selectedCliente) {
      ;(dto as any).id_cliente = selectedCliente.id_cliente
      ;(dto as any).nombreCliente = `${selectedCliente.nombre_cliente} ${selectedCliente.apellido_cliente}`
      // Si los campos bloqueados se enviaron, override con datos del cliente para consistencia
      ;(dto as any).telefonoCliente = selectedCliente.telefono ?? undefined
      ;(dto as any).direccionCliente = selectedCliente.dir ?? undefined
      ;(dto as any).correoCliente = selectedCliente.correo_cliente ?? undefined
      // Limpiar campos vacíos para no enviar null/undefined que moleste validación
      if (!(dto as any).telefonoCliente) delete (dto as any).telefonoCliente
      if (!(dto as any).direccionCliente) delete (dto as any).direccionCliente
      if (!(dto as any).correoCliente) delete (dto as any).correoCliente
    } else {
      // Ficha huérfana: quitar id_cliente si quedó vacío
      if (!values["id_cliente"] || (values["id_cliente"] as string).trim() === "") {
        delete (dto as any).id_cliente
      }
    }
    // Corrección crítica: si tipoEquipo es "" ya fue omitido, pero si por algún motivo quedó, eliminarlo
    if ((dto as any).tipoEquipo === "") delete (dto as any).tipoEquipo
    // Validación local: si no hay cliente vinculado, nombreCliente es obligatorio
    if (!selectedCliente && !dto.nombreCliente) {
      toast.error("El nombre del cliente es obligatorio cuando no hay cliente vinculado")
      return
    }
    onSubmit(dto)
  }

  return (
    <>
      <form className={styles['sys-form']} onSubmit={handleSubmit(onHandleSubmit)}>
        <fieldset>
          <legend>Cliente y servicio</legend>

          {/* Selector de cliente vinculado */}
          <div className={styles['sys-form-grid']} style={{ marginBottom: "0.5rem" }}>
            <label className={`${styles['sys-field']} ${styles['sys-field--full']}`}>
              <span>Cliente vinculado {isLinked ? "· vinculado" : "· opcional"}</span>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <div ref={searchWrapRef} style={{ position: "relative", flex: 1, minWidth: 0 }}>
                  <input
                    className={styles['sys-input']}
                    placeholder={isLinked ? clienteLabel(selectedCliente!) : "Buscar cliente por nombre, correo o teléfono…"}
                    value={clienteSearch}
                    onChange={(e) => { setClienteSearch(e.target.value); setDropdownOpen(true) }}
                    onFocus={() => setDropdownOpen(true)}
                    disabled={!!isLinked}
                    aria-label="Buscar y seleccionar cliente"
                    autoComplete="off"
                  />
                  {dropdownOpen && !isLinked && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        right: 0,
                        zIndex: 30,
                        maxHeight: "18rem",
                        overflowY: "auto",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius-md)",
                        background: "hsl(var(--card))",
                        boxShadow: "var(--shadow-lg)",
                      }}
                    >
                      {clientesLoading ? (
                        <div style={{ padding: "0.75rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>Buscando…</div>
                      ) : clientes.length === 0 ? (
                        <div style={{ padding: "0.75rem", fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
                          {clienteSearch.trim() ? "Sin resultados" : "Escribe para buscar o selecciona de los 20 últimos"}
                        </div>
                      ) : (
                        clientes.map((c) => (
                          <button
                            key={c.id_cliente}
                            type="button"
                            onClick={() => handleSelectCliente(c)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "0.625rem 0.75rem",
                              border: "none",
                              borderBottom: "1px solid hsl(var(--border) / 0.5)",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: "0.8125rem",
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <strong style={{ display: "block", fontWeight: 600 }}>{c.nombre_cliente} {c.apellido_cliente}</strong>
                            <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.75rem" }}>{c.correo_cliente || c.telefono || c.dir || "Sin contacto"}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => setShowNuevo(true)} disabled={submitting} style={{ flexShrink: 0, height: 40 }}>
                  + Nuevo cliente
                </button>
              </div>
              {isLinked ? (
                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
                  <span style={{ fontSize: "0.8125rem", flex: 1 }}>Vinculado: <strong>{clienteLabel(selectedCliente!)}</strong> <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.75rem" }}>· {selectedCliente!.id_cliente.slice(0, 8)}</span></span>
                  <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={handleDesvincular} style={{ height: 28, padding: "0 0.625rem", fontSize: "0.75rem" }}>Desvincular</button>
                </div>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
                  Selecciona un cliente para vincular la ficha (bloquea teléfono/dirección/correo). Si no seleccionas, la ficha quedará huérfana con nombre manual.
                </span>
              )}
            </label>
          </div>

          <div className={styles['sys-form-grid']}>
            {/* id_cliente hidden */}
            <input type="hidden" {...register("id_cliente")} />
            <label className={styles['sys-field']}>
              <span>Nombre del cliente {!isLinked && "*"}</span>
              <input
                className={styles['sys-input']}
                aria-invalid={formState.errors.nombreCliente ? true : undefined}
                aria-describedby={formState.errors.nombreCliente ? "error-nombre-cliente" : undefined}
                readOnly={isLinked}
                disabled={isLinked}
                title={isLinked ? "Bloqueado: viene del cliente vinculado. Desvincula para editar." : undefined}
                style={isLinked ? { background: "hsl(var(--muted) / 0.5)" } : undefined}
                placeholder={isLinked ? "Autocompletado desde cliente" : "Ej: Juan Pérez"}
                {...register("nombreCliente", { required: !isLinked })}
              />
            </label>
            <label className={styles['sys-field']}>
              <span>Teléfono</span>
              <input
                className={styles['sys-input']}
                type="tel"
                readOnly={isLinked}
                disabled={isLinked}
                style={isLinked ? { background: "hsl(var(--muted) / 0.5)" } : undefined}
                title={isLinked ? "Bloqueado: viene del cliente vinculado" : undefined}
                {...register("telefonoCliente")}
              />
            </label>
            <label className={styles['sys-field']}>
              <span>Dirección</span>
              <input
                className={styles['sys-input']}
                readOnly={isLinked}
                disabled={isLinked}
                style={isLinked ? { background: "hsl(var(--muted) / 0.5)" } : undefined}
                {...register("direccionCliente")}
              />
            </label>
            <label className={styles['sys-field']}>
              <span>Correo</span>
              <input
                className={styles['sys-input']}
                type="email"
                readOnly={isLinked}
                disabled={isLinked}
                style={isLinked ? { background: "hsl(var(--muted) / 0.5)" } : undefined}
                {...register("correoCliente")}
              />
            </label>
            <label className={`${styles['sys-field']} ${styles['sys-field--full']}`}>
              <span>Servicio</span>
              <input className={styles['sys-input']} {...register("servicio")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Fecha de realización</span>
              <input className={styles['sys-input']} type="date" {...register("fechaRealizacion")} />
            </label>
          </div>
          {!isLinked && formState.errors.nombreCliente && (
            <p className={styles['sys-error']} id="error-nombre-cliente" role="alert" style={{ marginTop: "0.75rem" }}>
              El nombre del cliente es obligatorio cuando no hay cliente vinculado
            </p>
          )}
          {isLinked && !nombreClienteWatch && (
            <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.5rem" }}>Nombre autocompletado desde cliente vinculado.</p>
          )}
        </fieldset>

        <fieldset>
          <legend>Equipo</legend>
          <div className={styles['sys-form-grid']}>
            <label className={styles['sys-field']}>
              <span>Tipo de equipo</span>
              <select className={styles['sys-select']} {...register("tipoEquipo")}>
                <option value="">Seleccione... (opcional)</option>
                {TIPOS_EQUIPO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles['sys-field']}>
              <span>Responsable</span>
              <input className={styles['sys-input']} {...register("nombreResponsable")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Marca</span>
              <input className={styles['sys-input']} {...register("marcaEquipo")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Modelo</span>
              <input className={styles['sys-input']} {...register("modeloEquipo")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Serial</span>
              <input className={styles['sys-input']} {...register("serialEquipo")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Referencia</span>
              <input className={styles['sys-input']} {...register("referencia")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Fecha de adquisición</span>
              <input className={styles['sys-input']} type="date" {...register("fechaAdquisicion")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Garantía (meses)</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("tiempoGarantiaMeses")} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Pantalla y procesador</legend>
          <div className={styles['sys-form-grid']}>
            <label className={styles['sys-field']}>
              <span>Tipo de monitor</span>
              <input className={styles['sys-input']} {...register("tipoMonitor")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Pantalla (pulgadas)</span>
              <input className={styles['sys-input']} type="number" step="any" min={0} {...register("tamanoPantallaPulgadas")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Marca procesador</span>
              <input className={styles['sys-input']} {...register("procesadorMarca")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Modelo procesador</span>
              <input className={styles['sys-input']} {...register("procesadorModelo")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Bits</span>
              <input className={styles['sys-input']} placeholder="64" {...register("procesadorBits")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Núcleos CPU</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("nucleosCpu")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Velocidad</span>
              <input className={styles['sys-input']} placeholder="2.4 GHz" {...register("velocidadProcesador")} />
            </label>
            <label className={styles['sys-field']}>
              <span>RAM (GB)</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("memoriaRamGb")} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Almacenamiento, video y puertos</legend>
          <div className={styles['sys-form-grid']}>
            <label className={styles['sys-field']}>
              <span>Cantidad de discos</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("cantidadDiscosDuros")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Tecnología disco 1</span>
              <input className={styles['sys-input']} placeholder="SSD NVMe" {...register("tecnologiaDisco1")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Capacidad disco 1 (GB)</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("capacidadDisco1Gb")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Tecnología disco 2</span>
              <input className={styles['sys-input']} placeholder="HDD" {...register("tecnologiaDisco2")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Capacidad disco 2 (GB)</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("capacidadDisco2Gb")} />
            </label>
          </div>
          <div className={`${styles['sys-check-row']} ${styles['sys-form-grid']}`}>
            <label className={styles['sys-check']}>
              <input type="checkbox" {...register("lectorDvdCd")} />
              <span>Lector DVD/CD</span>
            </label>
            <label className={styles['sys-check']}>
              <input type="checkbox" {...register("tarjetaVideoIntegrada")} />
              <span>Video integrado</span>
            </label>
            <label className={styles['sys-check']}>
              <input type="checkbox" {...register("tarjetaVideoIndependiente")} />
              <span>Video independiente</span>
            </label>
          </div>
          <div className={styles['sys-form-grid']}>
            <label className={styles['sys-field']}>
              <span>Conectores VGA</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("conectoresVga")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Puertos HDMI</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("puertosHdmi")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Puertos USB</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("puertosUsb")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Puertos PCI</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("puertosPci")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Puertos PCI Express</span>
              <input className={styles['sys-input']} type="number" min={0} {...register("puertosPciExpress")} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Red y periféricos</legend>
          <div className={`${styles['sys-check-row']} ${styles['sys-form-grid']}`}>
            <label className={styles['sys-check']}>
              <input type="checkbox" {...register("tarjetaEthernet")} />
              <span>Tarjeta Ethernet</span>
            </label>
            <label className={styles['sys-check']}>
              <input type="checkbox" {...register("tarjetaRedInalambrica")} />
              <span>Red inalámbrica</span>
            </label>
          </div>
          <div className={styles['sys-form-grid']}>
            <label className={styles['sys-field']}>
              <span>Marca mouse</span>
              <input className={styles['sys-input']} {...register("marcaMouse")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Serial mouse</span>
              <input className={styles['sys-input']} {...register("serialMouse")} />
            </label>
            <label className={styles['sys-field']}>
              <span>Conector mouse</span>
              <input className={styles['sys-input']} placeholder="USB inalámbrico" {...register("tipoConectorMouse")} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Observaciones</legend>
          <textarea
            className={styles['sys-textarea']}
            rows={3}
            placeholder="Notas adicionales del equipo..."
            {...register("observaciones")}
          />
        </fieldset>

        <div className={styles['sys-form-actions']}>
          <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} disabled={submitting}>
            {submitting ? "Guardando..." : ficha ? "Guardar cambios" : "Crear ficha"}
          </button>
        </div>
      </form>

      <Modal open={showNuevo} title="Nuevo cliente (vincular a ficha)" onClose={() => setShowNuevo(false)} size="lg">
        <form onSubmit={handleCrearCliente} className={styles['sys-form']}>
          <div className={styles['sys-form-grid']}>
            <label className={styles['sys-field']}>
              <span>Nombre *</span>
              <input className={styles['sys-input']} value={nuevoForm.nombre_cliente} required minLength={2} maxLength={80} onChange={(e) => setNuevoForm((f) => ({ ...f, nombre_cliente: e.target.value }))} placeholder="Ej: Carlos" />
            </label>
            <label className={styles['sys-field']}>
              <span>Apellido *</span>
              <input className={styles['sys-input']} value={nuevoForm.apellido_cliente} required minLength={2} maxLength={80} onChange={(e) => setNuevoForm((f) => ({ ...f, apellido_cliente: e.target.value }))} placeholder="Ej: Gómez" />
            </label>
            <label className={styles['sys-field']}>
              <span>Correo</span>
              <input className={styles['sys-input']} type="email" value={nuevoForm.correo_cliente ?? ""} maxLength={120} onChange={(e) => setNuevoForm((f) => ({ ...f, correo_cliente: e.target.value }))} placeholder="carlos@example.com" />
            </label>
            <label className={styles['sys-field']}>
              <span>Teléfono</span>
              <input className={styles['sys-input']} value={nuevoForm.telefono ?? ""} maxLength={30} onChange={(e) => setNuevoForm((f) => ({ ...f, telefono: e.target.value }))} placeholder="3001234567" />
            </label>
            <label className={`${styles['sys-field']} ${styles['sys-field--full']}`}>
              <span>Dirección</span>
              <input className={styles['sys-input']} value={nuevoForm.dir ?? ""} maxLength={150} onChange={(e) => setNuevoForm((f) => ({ ...f, dir: e.target.value }))} placeholder="Calle 10 #5-25" />
            </label>
            <label className={styles['sys-field']}>
              <span>Tipo de cliente</span>
              <input className={styles['sys-input']} value={nuevoForm.tipo_cliente ?? ""} maxLength={50} onChange={(e) => setNuevoForm((f) => ({ ...f, tipo_cliente: e.target.value }))} placeholder="Ej: Premium, Corporativo" />
            </label>
          </div>
          {nuevoError && <pre className={`${styles['sys-error']} ${styles['sys-error--list']}`}>{nuevoError}</pre>}
          <div className={styles['sys-form-actions']}>
            <button type="button" className={`${styles['sys-btn']} ${styles['sys-btn--ghost']}`} onClick={() => setShowNuevo(false)} disabled={nuevoSubmitting}>Cancelar</button>
            <button type="submit" className={`${styles['sys-btn']} ${styles['sys-btn--primary']}`} disabled={nuevoSubmitting}>{nuevoSubmitting ? "Creando..." : "Crear y vincular"}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
