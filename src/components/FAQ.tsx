import { IconChevronDown } from '@tabler/icons-react';
import '@/styles/landingPage/FAQ.css';

const faqs = [
  {
    q: '¿Cuánto tiempo toma una instalación de red empresarial?',
    a: 'Dependiendo de la complejidad, una instalación de red para una oficina promedio toma de 2 a 5 días hábiles, incluyendo cableado, configuración de equipos y pruebas de funcionamiento.'
  },
  {
    q: '¿Ofrecen servicios de mantenimiento preventivo?',
    a: 'Sí, ofrecemos planes de mantenimiento preventivo que incluyen limpieza interna, revisión de componentes, actualización de software y diagnóstico general del equipo.'
  },
  {
    q: '¿Qué tipo de cableado estructurado instalan?',
    a: 'Instalamos cableado categoría CAT6 y CAT6A para redes empresariales, incluyendo patch panels, rostros y organización en racks. Todo nuestro trabajo se entrega probado y funcionando.'
  },
  {
    q: '¿Ofrecen soporte remoto o solo presencial?',
    a: 'Ofrecemos ambos. El soporte remoto es ideal para problemas de software y configuración. Cuando se requiere atención presencial, coordinamos una visita a tu ubicación en Cali.'
  },
  {
    q: '¿Qué marcas de equipos de red recomiendan?',
    a: 'Trabajamos con las principales marcas del mercado como Cisco, MikroTik, Ubiquiti, TP-Link y más. Recomendamos la mejor solución según tus necesidades y presupuesto.'
  },
  {
    q: '¿Ofrecen garantía en sus servicios?',
    a: 'Sí, todos nuestros servicios cuentan con garantía. Respalamos el trabajo realizado y los equipos que instalamos.'
  },
  {
    q: '¿Cómo puedo solicitar una cotización?',
    a: 'Puedes llamarnos al +57 123 4513541, escribirnos por WhatsApp o llenar el formulario de contacto. Te responderemos a la mayor brevedad.'
  },
  {
    q: '¿Hacen visitas a domicilio o solo a empresas?',
    a: 'Atendemos tanto a empresas como a hogares en Cali y sus alrededores. Realizamos visitas presenciales para diagnóstico e instalación.'
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
      <div className="faq-container">
        <div className="section-header">
          <h2 id="faq-heading" className="section-title">
            Preguntas <span className="gradient-text">frecuentes</span>
          </h2>
          <p className="section-desc">Resolvemos tus dudas sobre nuestros servicios de infraestructura tecnológica en Cali.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="faq-item"
            >
              <summary className="faq-question">
                <span className="faq-question-text">{faq.q}</span>
                <IconChevronDown className="faq-icon" aria-hidden="true" />
              </summary>
              <div className="faq-answer">
                <p className="faq-answer-text">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
