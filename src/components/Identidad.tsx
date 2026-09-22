import styles from "@/styles/Identidad.module.css"

const ITEMS = [
  {
    id: "mision",
    title: "Misión",
    body: "Garantizar la continuidad y eficiencia tecnológica de pequeñas y medianas empresas, instituciones educativas y particulares en Cali, brindando soporte técnico integral, mantenimiento especializado y soluciones digitales con un servicio cercano y responsable.",
  },
  {
    id: "vision",
    title: "Visión",
    body: "Para el año 2030, ser la empresa de tecnología de referencia en Cali, destacada por la calidad de nuestros servicios y por transformar la experiencia técnica de nuestros clientes a través de un seguimiento digital personalizado e innovador.",
  },
]

export default function Identidad() {
  return (
    <section id="identidad" className={styles.identidad} aria-labelledby="identidad-heading">
      <div className={styles.identidadInner}>
        <h2 id="identidad-heading" className={styles.identidadTitle}>
          Misión y visión
        </h2>
        <div className={styles.identidadFeatured}>
          {ITEMS.map((item) => (
            <article key={item.id} className={styles.identidadFeature} aria-labelledby={`${item.id}-title`}>
              <h3 id={`${item.id}-title`} className={styles.identidadFeatureTitle}>
                {item.title}
              </h3>
              <p className={styles.identidadFeatureBody}>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
