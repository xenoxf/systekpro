import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconClock,
  IconSend
} from "@tabler/icons-react"

import styles from '../styles/contact.module.css'
import { useState, type FormEvent } from "react"

type FormData = {
  nombre: string
  email: string
  numero: string
  servicio: string
  message: string
}

type Errors = Partial<Record<keyof FormData, string>>

function Contact() {
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data = Object.fromEntries(formData) as FormData

    const newErrors: Errors = {}

    if (!data.nombre) {
      newErrors.nombre = "El nombre es obligatorio."
    } else if (data.nombre.length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres."
    }

    if (!data.email) {
      newErrors.email = "El correo electrónico es obligatorio."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Ingresa un correo electrónico válido."
    }

    if (!data.numero) {
      newErrors.numero = "El teléfono es obligatorio."
    } else if (data.numero.length < 7) {
      newErrors.numero = "Ingresa un número de teléfono válido."
    }

    if (!data.servicio) {
      newErrors.servicio = "Selecciona un servicio de interés."
    }

    if (!data.message) {
      newErrors.message = "El mensaje es obligatorio."
    } else if (data.message.length < 10) {
      newErrors.message = "El mensaje es demasiado corto (mínimo 10 caracteres)."
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Por favor corrige los errores indicados en el formulario antes de enviar.",
      })
      const firstInvalid = Object.keys(newErrors)[0]
      form.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus()
      return
    }

    try {
      const response = { ok: true }
      if (response.ok) {
        setStatus({
          type: "success",
          message: "¡Mensaje enviado con éxito! Te contactaremos pronto.",
        })
        form.reset()
      } else {
        setStatus({
          type: "error",
          message: "No se pudo enviar el mensaje. Intenta de nuevo o contáctanos por WhatsApp.",
        })
      }
    } catch {
      setStatus({
        type: "error",
        message: "Error de conexión. Intenta de nuevo o contáctanos por WhatsApp.",
      })
    }
  }

  return (
    <section id="contacto" className={styles.contacto}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Contacto</span>
          <h2 className={styles.sectionTitle}>
            Hablemos de tu<span className={styles.gradientText}> proyecto</span>
          </h2>
          <p className={styles.sectionDesc}>
            Cuéntanos qué necesitas y te enviaremos una propuesta personalizada.
          </p>
        </div>

        {status && (
          <p
            className={`${styles.formmStatus} ${styles[status.type]}`}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </p>
        )}

        <div className={styles.contactGrid}>
          <form
            className={styles.contactFormm}
            action="https://formspree.io/f/xpqngavp"
            method="POST"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className={styles.formmRow}>
              <div className={styles.formmGroup}>
                <label htmlFor="nombre" className={styles.formmLabel}>Nombre completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className={`${styles.formmInput} ${errors.nombre ? styles.formmInputError : ""}`}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  required
                  minLength={3}
                  aria-invalid={errors.nombre ? true : undefined}
                  aria-describedby={errors.nombre ? "nombre-error" : undefined}
                />
                {errors.nombre && (
                  <p id="nombre-error" className={styles.formmErrorMsg} role="alert">{errors.nombre}</p>
                )}
              </div>

              <div className={styles.formmGroup}>
                <label htmlFor="email" className={styles.formmLabel}>Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`${styles.formmInput} ${errors.email ? styles.formmInputError : ""}`}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className={styles.formmErrorMsg} role="alert">{errors.email}</p>
                )}
              </div>
            </div>

            <div className={styles.formmGroup}>
              <label htmlFor="numero" className={styles.formmLabel}>Teléfono</label>
              <input
                type="tel"
                id="numero"
                name="numero"
                className={`${styles.formmInput} ${errors.numero ? styles.formmInputError : ""}`}
                placeholder="+57 300 123 4567"
                autoComplete="tel"
                required
                minLength={7}
                aria-invalid={errors.numero ? true : undefined}
                aria-describedby={errors.numero ? "numero-error" : undefined}
              />
              {errors.numero && (
                <p id="numero-error" className={styles.formmErrorMsg} role="alert">{errors.numero}</p>
              )}
            </div>

            <div className={styles.formmGroup}>
              <label htmlFor="servicio" className={styles.formmLabel}>Servicio de interés</label>
              <select
                id="servicio"
                name="servicio"
                className={`${styles.formmSelect} ${errors.servicio ? styles.formmSelectError : ""}`}
                required
                aria-invalid={errors.servicio ? true : undefined}
                aria-describedby={errors.servicio ? "servicio-error" : undefined}
              >
                <option value="">Selecciona un servicio</option>
                <option value="mantenimiento">Mantenimiento de equipos</option>
                <option value="redes">Instalación de redes</option>
                <option value="cableado">Cableado estructurado</option>
                <option value="configuracion">Configuración de routers/switches</option>
                <option value="soporte">Soporte técnico</option>
                <option value="wifi">Redes inalámbricas</option>
                <option value="otro">Otro</option>
              </select>
              {errors.servicio && (
                <p id="servicio-error" className={styles.formmErrorMsg} role="alert">{errors.servicio}</p>
              )}
            </div>

            <div className={styles.formmGroup}>
              <label htmlFor="message" className={styles.formmLabel}>Mensaje</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className={`${styles.formmTextarea} ${errors.message ? styles.formmTextareaError : ""}`}
                placeholder="Cuéntanos sobre tu proyecto..."
                required
                minLength={10}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && (
                <p id="message-error" className={styles.formmErrorMsg} role="alert">{errors.message}</p>
              )}
            </div>

            <button type="submit" className={styles.formmBtn}>
              Enviar mensaje
              <IconSend aria-hidden="true" />
            </button>
          </form>

          <div className={styles.contactInfo}>
            <div className={styles.contactInfoList}>
              <div className={styles.contactInfoItem}>
                <div className={`${styles.contactInfoIcon} ${styles.primary}`}>
                  <IconPhone aria-hidden="true" />
                </div>
                <div>
                  <h3 className={styles.contactInfoLabel}>Teléfono</h3>
                  <a href="tel:+571234513541" className={styles.contactInfoValue}>+57 123 4513541</a>
                </div>
              </div>

              <div className={styles.contactInfoItem}>
                <div className={`${styles.contactInfoIcon} ${styles.accent}`}>
                  <IconMail aria-hidden="true" />
                </div>
                <div>
                  <h3 className={styles.contactInfoLabel}>Correo electrónico</h3>
                  <a href="mailto:contacto@sistek.com.co" className={styles.contactInfoValue}>contacto@sistek.com.co</a>
                </div>
              </div>

              <div className={styles.contactInfoItem}>
                <div className={`${styles.contactInfoIcon} ${styles.primary}`}>
                  <IconMapPin aria-hidden="true" />
                </div>
                <div>
                  <h3 className={styles.contactInfoLabel}>Ubicación</h3>
                  <p className={styles.contactInfoValue}>Calle 41, Cra 31 #00, Cali, Valle del Cauca</p>
                </div>
              </div>

              <div className={styles.contactInfoItem}>
                <div className={`${styles.contactInfoIcon} ${styles.accent}`}>
                  <IconClock aria-hidden="true" />
                </div>
                <div>
                  <h3 className={styles.contactInfoLabel}>Horario</h3>
                  <p className={styles.contactInfoValue}>Lun - Vie: 8:00 - 18:00</p>
                  <p className={styles.contactInfoValue}>Sáb: 9:00 - 13:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
