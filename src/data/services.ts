export interface Service {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  icon: string;
  gradient: string;
  glowColor: string;
  ctaText: string;
  ctaLink: string;
}

export const services: Service[] = [
  {
    id: 1,
    title: 'Mantenimiento de Equipos',
    description: 'Diagnóstico, reparación y optimización integral de computadores. Mantenimiento preventivo y correctivo para maximizar la vida útil y el rendimiento de tus equipos tecnológicos.',
    shortDescription: 'Diagnóstico, reparación y optimización de computadores para máximo rendimiento.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFK665jD5VKGRvN7FDgvOUCae90P9OtCFeWtdNmHxOnw&s=10',
    icon: 'IconDeviceLaptop',
    gradient: 'linear-gradient(135deg, hsl(217 91% 60% / 0.9) 0%, hsl(187 90% 46% / 0.7) 100%)',
    glowColor: 'hsl(217 91% 60%)',
    ctaText: 'Solicitar mantenimiento',
    ctaLink: '#contacto',
  },
  {
    id: 2,
    title: 'Instalación de Redes Empresariales',
    description: 'Diseño e implementación de redes cableadas e inalámbricas para empresas e instituciones con los más altos estándares de calidad, seguridad y escalabilidad.',
    shortDescription: 'Diseño e implementación de redes cableadas e inalámbricas con estándares enterprise.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    icon: 'IconNetwork',
    gradient: 'linear-gradient(135deg, hsl(187 90% 46% / 0.9) 0%, hsl(160 84% 42% / 0.7) 100%)',
    glowColor: 'hsl(187 90% 46%)',
    ctaText: 'Cotizar instalación',
    ctaLink: '#contacto',
  },
  {
    id: 3,
    title: 'Configuración de Equipos de Red',
    description: 'Configuración profesional de routers, switches y access points. Optimización de redes para negocios y hogares con VLANs, QoS, VPN y seguridad avanzada.',
    shortDescription: 'Configuración de routers, switches y APs con VLANs, QoS y seguridad.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQSbeGcOL-mPBJR-j4omqzkAMIvBATtaEvfU6XdGbF_A&s=10',
    icon: 'IconRouter',
    gradient: 'linear-gradient(135deg, hsl(187 90% 46% / 0.9) 0%, hsl(38 92% 52% / 0.7) 100%)',
    glowColor: 'hsl(38 92% 52%)',
    ctaText: 'Optimizar mi red',
    ctaLink: '#contacto',
  },
  {
    id: 4,
    title: 'Redes Inalámbricas WiFi',
    description: 'Implementación de redes WiFi empresariales con cobertura óptima, roaming sin interrupciones, análisis de espectro y capacity planning para alta densidad.',
    shortDescription: 'WiFi 6/7 empresarial con roaming, análisis de espectro y alta densidad.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa3GHYc_bB05qylxM7CDq5mKDF7xajVlYY1wV3Sd3rCQ&s=10',
    icon: 'IconWifi',
    gradient: 'linear-gradient(135deg, hsl(160 84% 42% / 0.9) 0%, hsl(187 90% 46% / 0.7) 100%)',
    glowColor: 'hsl(160 84% 42%)',
    ctaText: 'Auditar cobertura',
    ctaLink: '#contacto',
  },
  {
    id: 5,
    title: 'Soporte Técnico Especializado',
    description: 'Asistencia técnica presencial y remota 24/7. Diagnóstico de fallas, instalación de software, gestión de incidencias y monitoreo proactivo de infraestructura crítica.',
    shortDescription: 'Soporte 24/7 presencial y remoto con monitoreo proactivo.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIQBLaNk54AWj2ewK-E8mStGtsuYbzvcWxytvKq_LLJQ&s=10',
    icon: 'IconHeadset',
    gradient: 'linear-gradient(135deg, hsl(262 83% 58% / 0.9) 0%, hsl(217 91% 60% / 0.7) 100%)',
    glowColor: 'hsl(262 83% 58%)',
    ctaText: 'Contratar soporte',
    ctaLink: '#contacto',
  },
];

export const getServicesForCarousel = (): Service[] => {
  const duplicated = [...services, ...services, ...services];
  return duplicated;
}; 
