import { IconChevronDown } from '@tabler/icons-react';
import { datosEmpresa } from '@/data/info';
import styles from "@/styles/FAQ.module.css";

const faqs = [
  {
    q: '¿Cuánto tarda una instalación de red?',
    a: 'Depende del tamaño. Una oficina promedio: 2 a 5 días hábiles. Incluye cableado, configuración y pruebas. Te damos el tiempo exacto en la cotización.'
  },
  {
    q: '¿Hacen mantenimiento preventivo?',
    a: 'Sí. Planes mensuales o periódicos: limpieza, revisión, actualización de software y diagnóstico. Evitamos las fallas antes de que pasen.'
  },
  {
    q: '¿Qué cableado instalan?',
    a: 'CAT6 y CAT6A. Patch panels, rostros, racks — todo certificado con reporte de pruebas. Entregamos documentación completa.'
  },
  {
    q: '¿Soporte remoto o solo presencial?',
    a: 'Ambos. Remoto para software y configuración. Presencial cuando se necesita — coordinamos la visita en Cali.'
  },
  {
    q: '¿Dan capacitaciones?',
    a: 'Sí. Capacitamos a tu equipo en herramientas informáticas, seguridad digital y uso responsable de la información. Vamos a tu sede o lo damos en remoto, con contenidos armados para tu operación.'
  },
  {
    q: '¿Desarrollan software o bases de datos a la medida?',
    a: 'Sí: páginas web, software a la medida y bases de datos, con panel administrable, formularios que llegan al responsable correcto y copias de seguridad. Te entregamos el código y queda documentado.'
  },
  {
    q: '¿Pueden encargarse de la marca y las redes de mi negocio?',
    a: 'Sí. Nuestro departamento de marketing trabaja identidad corporativa, contenido para redes y campañas digitales, y define con ustedes el tono antes de publicar.'
  },
  {
    q: '¿Con qué marcas trabajan?',
    a: 'Cisco, MikroTik, Ubiquiti, TP-Link y otras. Recomendamos la que mejor se ajuste a tu presupuesto y necesidades.'
  },
  {
    q: '¿Tienen garantía?',
    a: 'Sí. Garantía escrita en todo lo que instalamos y reparamos. Si algo falla, volvemos sin costo.'
  },
  {
    q: '¿Cómo pido una cotización?',
    a: `Escríbenos al ${datosEmpresa.telefonoDisplay} por WhatsApp o llena el formulario de contacto. Te respondemos con precio y tiempos.`
  },
  {
    q: '¿Atienden casas o solo empresas?',
    a: 'Ambos. Empresas, colegios, casas — lo que necesites en Cali y alrededores.'
  }
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading">
      <script type="application/ld+json" set:html={JSON.stringify(faqJsonLd)} />
      <div className={styles['faq-container']}>
        <div className="section-header">
          <h2 id="faq-heading" className="section-title">
            Preguntas frecuentes
          </h2>
          <p className="section-desc">Dudas reales de clientes reales. Si no está la tuya, escríbenos.</p>
        </div>

        <div className={styles['faq-list']}>
          {faqs.map((faq, i) => (
            <details
              key={i}
              className={styles['faq-item']}
            >
              <summary className={styles['faq-question']}>
                <span className={styles['faq-question-text']}>{faq.q}</span>
                <IconChevronDown className={styles['faq-icon']} aria-hidden="true" />
              </summary>
              <div className={styles['faq-answer']}>
                <p className={styles['faq-answer-text']}>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
