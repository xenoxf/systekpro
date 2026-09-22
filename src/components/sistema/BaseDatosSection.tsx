import styles from "@/styles/SistemaApp.module.css"

export default function BaseDatosSection() {
  return (
    <div className={styles['sys-section']}>
      <div className={styles['sys-section-toolbar']} style={{ alignItems: "flex-end" }}>
        <div className={styles['sys-panel-heading']} style={{ minWidth: 0 }}>
          <h2 className={styles['sys-panel-title']} style={{ marginTop: "0.2rem", fontSize: "1.25rem" }}>Base de datos</h2>
          <p className={styles['sys-panel-sub']} style={{ fontSize: "0.8125rem" }}>
            Diagrama entidad-relación del sistema
          </p>
        </div>
      </div>

      <div className={styles['sys-panel']}>
        <img
          src="/info/diagrama_db.png"
          alt="Diagrama de la base de datos del sistema Sistek"
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "auto", display: "block", borderRadius: "0.375rem" }}
        />
      </div>
    </div>
  )
}
