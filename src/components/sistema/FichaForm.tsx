import React from "react"
import { useForm } from "react-hook-form"
import { TIPOS_EQUIPO, type FichaTecnica, type CreateFichaDto } from "@/services/fichas"

interface Props {
  ficha?: FichaTecnica | null
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
  return dto as unknown as CreateFichaDto
}

export default function FichaForm({ ficha, submitting, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      nombreCliente: ficha?.nombreCliente ?? "",
      telefonoCliente: ficha?.telefonoCliente ?? "",
      direccionCliente: ficha?.direccionCliente ?? "",
      correoCliente: ficha?.correoCliente ?? "",
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

  return (
    <form className="sys-form" onSubmit={handleSubmit((values) => onSubmit(buildDto(values)))}>
      <fieldset>
        <legend>Cliente y servicio</legend>
        <div className="sys-form-grid">
          <label className="sys-field">
            <span>Nombre del cliente *</span>
            <input
              className="sys-input"
              aria-invalid={formState.errors.nombreCliente ? true : undefined}
              aria-describedby={formState.errors.nombreCliente ? "error-nombre-cliente" : undefined}
              {...register("nombreCliente", { required: true })}
            />
          </label>
          <label className="sys-field">
            <span>Teléfono</span>
            <input className="sys-input" type="tel" {...register("telefonoCliente")} />
          </label>
          <label className="sys-field">
            <span>Dirección</span>
            <input className="sys-input" {...register("direccionCliente")} />
          </label>
          <label className="sys-field">
            <span>Correo</span>
            <input className="sys-input" type="email" {...register("correoCliente")} />
          </label>
          <label className="sys-field sys-field--full">
            <span>Servicio</span>
            <input className="sys-input" {...register("servicio")} />
          </label>
          <label className="sys-field">
            <span>Fecha de realización</span>
            <input className="sys-input" type="date" {...register("fechaRealizacion")} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Equipo</legend>
        <div className="sys-form-grid">
          <label className="sys-field">
            <span>Tipo de equipo</span>
            <select className="sys-select" {...register("tipoEquipo")}>
              <option value="">Seleccione... (opcional)</option>
              {TIPOS_EQUIPO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sys-field">
            <span>Responsable</span>
            <input className="sys-input" {...register("nombreResponsable")} />
          </label>
          <label className="sys-field">
            <span>Marca</span>
            <input className="sys-input" {...register("marcaEquipo")} />
          </label>
          <label className="sys-field">
            <span>Modelo</span>
            <input className="sys-input" {...register("modeloEquipo")} />
          </label>
          <label className="sys-field">
            <span>Serial</span>
            <input className="sys-input" {...register("serialEquipo")} />
          </label>
          <label className="sys-field">
            <span>Referencia</span>
            <input className="sys-input" {...register("referencia")} />
          </label>
          <label className="sys-field">
            <span>Fecha de adquisición</span>
            <input className="sys-input" type="date" {...register("fechaAdquisicion")} />
          </label>
          <label className="sys-field">
            <span>Garantía (meses)</span>
            <input className="sys-input" type="number" min={0} {...register("tiempoGarantiaMeses")} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Pantalla y procesador</legend>
        <div className="sys-form-grid">
          <label className="sys-field">
            <span>Tipo de monitor</span>
            <input className="sys-input" {...register("tipoMonitor")} />
          </label>
          <label className="sys-field">
            <span>Pantalla (pulgadas)</span>
            <input className="sys-input" type="number" step="any" min={0} {...register("tamanoPantallaPulgadas")} />
          </label>
          <label className="sys-field">
            <span>Marca procesador</span>
            <input className="sys-input" {...register("procesadorMarca")} />
          </label>
          <label className="sys-field">
            <span>Modelo procesador</span>
            <input className="sys-input" {...register("procesadorModelo")} />
          </label>
          <label className="sys-field">
            <span>Bits</span>
            <input className="sys-input" placeholder="64" {...register("procesadorBits")} />
          </label>
          <label className="sys-field">
            <span>Núcleos CPU</span>
            <input className="sys-input" type="number" min={0} {...register("nucleosCpu")} />
          </label>
          <label className="sys-field">
            <span>Velocidad</span>
            <input className="sys-input" placeholder="2.4 GHz" {...register("velocidadProcesador")} />
          </label>
          <label className="sys-field">
            <span>RAM (GB)</span>
            <input className="sys-input" type="number" min={0} {...register("memoriaRamGb")} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Almacenamiento, video y puertos</legend>
        <div className="sys-form-grid">
          <label className="sys-field">
            <span>Cantidad de discos</span>
            <input className="sys-input" type="number" min={0} {...register("cantidadDiscosDuros")} />
          </label>
          <label className="sys-field">
            <span>Tecnología disco 1</span>
            <input className="sys-input" placeholder="SSD NVMe" {...register("tecnologiaDisco1")} />
          </label>
          <label className="sys-field">
            <span>Capacidad disco 1 (GB)</span>
            <input className="sys-input" type="number" min={0} {...register("capacidadDisco1Gb")} />
          </label>
          <label className="sys-field">
            <span>Tecnología disco 2</span>
            <input className="sys-input" placeholder="HDD" {...register("tecnologiaDisco2")} />
          </label>
          <label className="sys-field">
            <span>Capacidad disco 2 (GB)</span>
            <input className="sys-input" type="number" min={0} {...register("capacidadDisco2Gb")} />
          </label>
        </div>
        <div className="sys-check-row sys-form-grid">
          <label className="sys-check">
            <input type="checkbox" {...register("lectorDvdCd")} />
            <span>Lector DVD/CD</span>
          </label>
          <label className="sys-check">
            <input type="checkbox" {...register("tarjetaVideoIntegrada")} />
            <span>Video integrado</span>
          </label>
          <label className="sys-check">
            <input type="checkbox" {...register("tarjetaVideoIndependiente")} />
            <span>Video independiente</span>
          </label>
        </div>
        <div className="sys-form-grid">
          <label className="sys-field">
            <span>Conectores VGA</span>
            <input className="sys-input" type="number" min={0} {...register("conectoresVga")} />
          </label>
          <label className="sys-field">
            <span>Puertos HDMI</span>
            <input className="sys-input" type="number" min={0} {...register("puertosHdmi")} />
          </label>
          <label className="sys-field">
            <span>Puertos USB</span>
            <input className="sys-input" type="number" min={0} {...register("puertosUsb")} />
          </label>
          <label className="sys-field">
            <span>Puertos PCI</span>
            <input className="sys-input" type="number" min={0} {...register("puertosPci")} />
          </label>
          <label className="sys-field">
            <span>Puertos PCI Express</span>
            <input className="sys-input" type="number" min={0} {...register("puertosPciExpress")} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Red y periféricos</legend>
        <div className="sys-check-row sys-form-grid">
          <label className="sys-check">
            <input type="checkbox" {...register("tarjetaEthernet")} />
            <span>Tarjeta Ethernet</span>
          </label>
          <label className="sys-check">
            <input type="checkbox" {...register("tarjetaRedInalambrica")} />
            <span>Red inalámbrica</span>
          </label>
        </div>
        <div className="sys-form-grid">
          <label className="sys-field">
            <span>Marca mouse</span>
            <input className="sys-input" {...register("marcaMouse")} />
          </label>
          <label className="sys-field">
            <span>Serial mouse</span>
            <input className="sys-input" {...register("serialMouse")} />
          </label>
          <label className="sys-field">
            <span>Conector mouse</span>
            <input className="sys-input" placeholder="USB inalámbrico" {...register("tipoConectorMouse")} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Observaciones</legend>
        <textarea
          className="sys-textarea"
          rows={3}
          placeholder="Notas adicionales del equipo..."
          {...register("observaciones")}
        />
      </fieldset>

      {formState.errors.nombreCliente && (
        <p className="sys-error" id="error-nombre-cliente" role="alert">
          El nombre del cliente es obligatorio
        </p>
      )}

      <div className="sys-form-actions">
        <button type="button" className="sys-btn sys-btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="sys-btn sys-btn--primary" disabled={submitting || !formState.isDirty}>
          {submitting ? "Guardando..." : ficha ? "Guardar cambios" : "Crear ficha"}
        </button>
      </div>
    </form>
  )
}
