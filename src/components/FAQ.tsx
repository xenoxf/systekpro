import React, { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

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
    q: '¿Dan soporte remoto o solo presencial?',
    a: 'Ofrecemos ambos. El soporte remoto es ideal para problemas de software y configuración. Cuando se requiere atención presencial, coordinamos una visita a tu ubicación en Cali.'
  },
  {
    q: '¿Qué marcas de equipos de red recomiendan?',
    a: 'Trabajamos con las principales marcas del mercado como Cisco, MikroTik, Ubiquiti, TP-Link y más. Recomendamos la mejor solución según tus necesidades y presupuesto.'
  },
  {
    q: '¿Ofrecen garantía en sus servicios?',
    a: 'Sí, todos nuestros servicios cuentan con garantía. Respadamos el trabajo realizado y los equipos que instalamos.'
  },
  {
    q: '¿Cómo puedo solicitar una cotización?',
    a: 'Puedes llamarnos al 123 4513541, escribirnos por WhatsApp o llenar el formulario de contacto. Te responderemos a la mayor brevedad.'
  },
  {
    q: '¿Hacen visitas a domicilio o solo a empresas?',
    a: 'Atendemos tanto a empresas como a hogares en Cali y sus alrededores. Realizamos visitas presenciales para diagnóstico e instalación.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq">
      <div className="faq-container">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">
            Preguntas <span className="gradient-text">frecuentes</span>
          </h2>
          <p className="section-desc">Resolvemos tus dudas sobre nuestros servicios de infraestructura TI.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? 'open' : ''}`}
              onClick={() => toggle(i)}
            >
              <div className="faq-question">
                <span className="faq-question-text">{faq.q}</span>
                <IconChevronDown className="faq-icon" />
              </div>
              <div className="faq-answer">
                <p className="faq-answer-text">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
