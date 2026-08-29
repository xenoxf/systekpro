import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { services } from "@/data/services";
import "@/styles/services/ServicesCarousel.css";
import {
  IconArrowLeft,
  IconArrowRight,
  IconDeviceLaptop,
  IconNetwork,
  IconRouter,
  IconWifi,
  IconHeadset,
  IconCpu,
} from "@tabler/icons-react";

const AUTOPLAY_DELAY = 6000;

const icons: Record<string, ComponentType<{ className?: string }>> = {
  IconDeviceLaptop,
  IconNetwork,
  IconRouter,
  IconWifi,
  IconHeadset,
  IconCpu,
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function ServicesJ() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [a11yStop, setA11yStop] = useState(false);
  const total = services.length;
  const service = services[index];
  const Icon = icons[service.icon] ?? IconNetwork;

  const goTo = (i: number) => setIndex(((i % total) + total) % total);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    const read = () => {
      const root = document.documentElement;
      setA11yStop(root.classList.contains("a11y-stop-anim"));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || a11yStop) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [paused, a11yStop, total]);

  return (
    <section
      id="servicios"
      className="services-carousel"
      aria-label="Servicios destacados"
    >
      <div className="scc-header">
        <span className="scc-title">Nuestros servicios</span>
      </div>

      <div className="scc-track">
          <button
            type="button"
            className="scc-arrow"
            onClick={prev}
            aria-label="Servicio anterior"
          >
            <IconArrowLeft aria-hidden="true" />
          </button>

        <article
          key={service.id}
          className="scc-card"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="slide"
          aria-label={`${index + 1} de ${total}: ${service.title}`}
        >
          <div
            className="scc-media"
            style={{ backgroundImage: `url(${service.image})` }}
          >
            <div
              className="scc-media-grad"
              style={{ background: service.gradient }}
            ></div>
            <div
              className="scc-icon"
              style={{ background: service.gradient }}
              aria-hidden="true"
            >
              <Icon />
            </div>
          </div>

          <div className="scc-body">
            <span className="scc-eyebrow">
              <span className="scc-number">{pad(service.id)}</span> Servicio destacado
            </span>
            <h3 className="scc-title">{service.title}</h3>
            <p className="scc-desc">{service.description}</p>
            <a href={service.ctaLink} className="scc-cta">
              {service.ctaText}
              <IconArrowRight />
            </a>
          </div>
        </article>

          <button
            type="button"
            className="scc-arrow"
            onClick={next}
            aria-label="Siguiente servicio"
          >
            <IconArrowRight aria-hidden="true" />
          </button>
      </div>

        <div className="scc-controls">
          <span className="scc-counter" aria-hidden="true">
            <strong>{pad(index + 1)}</strong> / {pad(total)}
          </span>
          <div className="scc-dots" role="group" aria-label="Seleccionar servicio">
            {services.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`scc-dot${i === index ? " is-active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Ir al servicio ${i + 1}: ${s.title}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </div>
    </section>
  );
}