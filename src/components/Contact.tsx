import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconClock,
  IconSend
} from '@tabler/icons-react'

import styles from '../styles/contact.module.css'
import React from 'react'
import { useForm } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'

type FormData = {
  nombre: string
  email: string
  numero: string
  servicio: string
  message: string
}

function Contact() {

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    },
    reset
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      toast.success('Tu mensaje fue enviado con éxito')
      reset()
    } catch (error) {
      toast.error('No se pudo enviar el mensaje')
      console.error(error)
    }
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
          },
          success: {
            style: {
              borderColor: '#22c55e',
            },
          },
          error: {
            style: {
              borderColor: '#ef4444',
            },
          },
        }}
      />
      <section id={styles.contacto}>

      <div className={styles.container}>

        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>
            Contacto
          </span>

          <h2 className={styles.sectionTitle}>
            Hablemos de tu
            <span className={styles.gradientText}>
              {' '}proyecto
            </span>
          </h2>

          <p className={styles.sectionDesc}>
            Cuéntanos qué necesitas y te enviaremos una propuesta personalizada.
          </p>
        </div>

        <div className={styles.contactGrid}>

          <form
            className={styles.contactFormm}
            onSubmit={handleSubmit(onSubmit)}
          >

            <div className={styles.formmRow}>

              {/* Nombre */}

              <div className={styles.formmGroup}>

                <label
                  htmlFor="name"
                  className={styles.formmLabel}
                >
                  Nombre completo
                </label>

                <input
                  type="text"
                  id="name"

                  className={styles.formmInput}

                  placeholder="Tu nombre"

                  autoComplete="name"

                  {...register('nombre', {
                    required: 'El nombre es obligatorio',

                    minLength: {
                      value: 3,
                      message: 'Mínimo 3 caracteres'
                    }
                  })}
                />

                {
                  errors.nombre && (
                    <span className={styles.error}>
                      {errors.nombre.message}
                    </span>
                  )
                }

              </div>

              {/* Email */}

              <div className={styles.formmGroup}>

                <label
                  htmlFor="email"
                  className={styles.formmLabel}
                >
                  Correo electrónico
                </label>

                <input
                  type="email"
                  id="email"

                  className={styles.formmInput}

                  placeholder="tu@correo.com"

                  autoComplete="email"

                  {...register('email', {
                    required: 'El correo es obligatorio',

                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Correo inválido'
                    }
                  })}
                />

                {
                  errors.email && (
                    <span className={styles.error}>
                      {errors.email.message}
                    </span>
                  )
                }

              </div>

            </div>

            {/* Teléfono */}

            <div className={styles.formmGroup}>

              <label
                htmlFor="phone"
                className={styles.formmLabel}
              >
                Teléfono
              </label>

              <input
                type="tel"
                id="phone"

                className={styles.formmInput}

                placeholder="+57 300 123 4567"

                autoComplete="tel"

                {...register('numero', {
                  required: 'El teléfono es obligatorio',

                  minLength: {
                    value: 7,
                    message: 'Número demasiado corto'
                  }
                })}
              />

              {
                errors.numero && (
                  <span className={styles.error}>
                    {errors.numero.message}
                  </span>
                )
              }

            </div>

            {/* Servicio */}

            <div className={styles.formmGroup}>

              <label
                htmlFor="service"
                className={styles.formmLabel}
              >
                Servicio de interés
              </label>

              <select
                id="service"

                className={styles.formmSelect}

                {...register('servicio', {
                  required: 'Selecciona un servicio'
                })}
              >

                <option value="">
                  Selecciona un servicio
                </option>

                <option value="mantenimiento">
                  Mantenimiento de equipos
                </option>

                <option value="redes">
                  Instalación de redes
                </option>

                <option value="cableado">
                  Cableado estructurado
                </option>

                <option value="configuracion">
                  Configuración de routers/switches
                </option>

                <option value="soporte">
                  Soporte técnico
                </option>

                <option value="wifi">
                  Redes inalámbricas
                </option>

                <option value="otro">
                  Otro
                </option>

              </select>

              {
                errors.servicio && (
                  <span className={styles.error}>
                    {errors.servicio.message}
                  </span>
                )
              }

            </div>

            {/* Mensaje */}

            <div className={styles.formmGroup}>

              <label
                htmlFor="message"
                className={styles.formmLabel}
              >
                Mensaje
              </label>

              <textarea
                id="message"

                rows={4}

                className={styles.formmTextarea}

                placeholder="Cuéntanos sobre tu proyecto..."

                {...register('message', {
                  required: 'El mensaje es obligatorio',

                  minLength: {
                    value: 10,
                    message: 'El mensaje es demasiado corto'
                  }
                })}
              />

              {
                errors.message && (
                  <span className={styles.error}>
                    {errors.message.message}
                  </span>
                )
              }

            </div>

            {/* Botón */}

            <button
              type="submit"

              disabled={isSubmitting}

              className={styles.formmBtn}
            >

              {
                isSubmitting
                  ? 'Enviando...'
                  : 'Enviar mensaje'
              }

              <IconSend />

            </button>

          </form>

          {/* Información */}

          <div className={styles.contactInfo}>

            <div className={styles.contactInfoList}>

              <div className={styles.contactInfoItem}>

                <div className={`${styles.contactInfoIcon} ${styles.primary}`}>
                  <IconPhone />
                </div>

                <div>
                  <h3 className={styles.contactInfoLabel}>
                    Teléfono
                  </h3>

                  <p className={styles.contactInfoValue}>
                    +57 123 4513541
                  </p>

                  <p className={styles.contactInfoValue}>
                    +57 123 4513541
                  </p>
                </div>

              </div>

              <div className={styles.contactInfoItem}>

                <div className={`${styles.contactInfoIcon} ${styles.accent}`}>
                  <IconMail />
                </div>

                <div>
                  <h3 className={styles.contactInfoLabel}>
                    Correo electrónico
                  </h3>

                  <p className={styles.contactInfoValue}>
                    contacto@sistek.com.co
                  </p>

                  <p className={styles.contactInfoValue}>
                    soporte@sistek.com.co
                  </p>
                </div>

              </div>

              <div className={styles.contactInfoItem}>

                <div className={`${styles.contactInfoIcon} ${styles.primary}`}>
                  <IconMapPin />
                </div>

                <div>
                  <h3 className={styles.contactInfoLabel}>
                    Ubicación
                  </h3>

                  <p className={styles.contactInfoValue}>
                    Calle 41, Cra 31 #00
                  </p>

                  <p className={styles.contactInfoValue}>
                    Cali, Valle del Cauca
                  </p>
                </div>

              </div>

              <div className={styles.contactInfoItem}>

                <div className={`${styles.contactInfoIcon} ${styles.accent}`}>
                  <IconClock />
                </div>

                <div>
                  <h3 className={styles.contactInfoLabel}>
                    Horario
                  </h3>

                  <p className={styles.contactInfoValue}>
                    Lun - Vie: 8:00 - 18:00
                  </p>

                  <p className={styles.contactInfoValue}>
                    Sáb: 9:00 - 13:00
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
    </>
  )
}

export default Contact
