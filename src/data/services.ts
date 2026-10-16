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
    title: 'Mantenimiento preventivo y correctivo de equipos de cómputo',
    description: 'Limpieza interna, cambio de pasta térmica, diagnóstico de hardware y optimización de software. Evitamos fallas antes de que detengan tu operación en Cali.',
    shortDescription: 'Limpieza, diagnóstico, reparación y optimización de computadores.',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900&q=80&auto=format&fit=crop',
    icon: 'IconDeviceLaptop',
    gradient: 'linear-gradient(135deg, hsl(217 91% 60% / 0.9) 0%, hsl(187 90% 46% / 0.7) 100%)',
    glowColor: 'hsl(217 91% 60%)',
    ctaText: 'Ver servicio',
    ctaLink: '/servicios/mantenimiento-computadores',
  },
  {
    id: 2,
    title: 'Diseño e instalación de redes cableadas',
    description: 'Diseño, montaje y puesta en marcha de redes cableadas para oficinas, colegios y bodegas. Desde un punto de red hasta un edificio completo.',
    shortDescription: 'Diseño y montaje de redes cableadas para empresas.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80&auto=format&fit=crop',
    icon: 'IconNetwork',
    gradient: 'linear-gradient(135deg, hsl(187 90% 46% / 0.9) 0%, hsl(160 84% 42% / 0.7) 100%)',
    glowColor: 'hsl(187 90% 46%)',
    ctaText: 'Ver servicio',
    ctaLink: '/servicios/instalacion-redes-empresariales',
  },
  
  {
    id: 4,
    title: 'Configuración de routers, switches y equipos de red',
    description: 'Configuración de routers, switches y access points: VLANs, QoS, VPN y direccionamiento. Dejamos la red documentada y funcionando.',
    shortDescription: 'VLANs, QoS, VPN y configuración de equipos de red.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&q=80&auto=format&fit=crop',
    icon: 'IconRouter',
    gradient: 'linear-gradient(135deg, hsl(187 90% 46% / 0.9) 0%, hsl(38 92% 52% / 0.7) 100%)',
    glowColor: 'hsl(38 92% 52%)',
    ctaText: 'Ver servicio',
    ctaLink: '/servicios/configuracion-routers-switches',
  },
  {
    id: 5,
    title: 'Soporte técnico para empresas y hogares',
    description: 'Diagnóstico y reparación de equipos, impresoras, software y red. Atención presencial en Cali y remota, con planes mensuales para empresas.',
    shortDescription: 'Diagnóstico y reparación, presencial en Cali y a distancia.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format&fit=crop',
    icon: 'IconHeadset',
    gradient: 'linear-gradient(135deg, hsl(262 83% 58% / 0.9) 0%, hsl(217 91% 60% / 0.7) 100%)',
    glowColor: 'hsl(262 83% 58%)',
    ctaText: 'Ver servicio',
    ctaLink: '/servicios/soporte-tecnico',
  },

  
  {
    id: 8,
    title: 'Desarrollo y mantenimiento de sitios web a medida',
    description: 'Diseño, desarrollo y mantenimiento de páginas web con panel administrable, formularios y servicios backend: bases de datos, API y despliegue.',
    shortDescription: 'Sitios web, backend, bases de datos y mantenimiento continuo.',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=80&auto=format&fit=crop',
    icon: 'IconCpu',
    gradient: 'linear-gradient(135deg, hsl(240 60% 40% / 0.9) 0%, hsl(187 90% 46% / 0.7) 100%)',
    glowColor: 'hsl(240 60% 40%)',
    ctaText: 'Ver servicio',
    ctaLink: '/servicios/desarrollo-web-backend',
  },
];

export const getServicesForCarousel = (): Service[] => {
  const duplicated = [...services, ...services, ...services];
  return duplicated;
};
