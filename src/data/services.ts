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
    description: 'Limpieza, diagnóstico y reparación de computadores. Prevención de fallas antes de que detengan tu operación.',
    shortDescription: 'Limpieza, diagnóstico y reparación de computadores.',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900&q=80&auto=format&fit=crop',
    icon: 'IconDeviceLaptop',
    gradient: 'linear-gradient(135deg, hsl(217 91% 60% / 0.9) 0%, hsl(187 90% 46% / 0.7) 100%)',
    glowColor: 'hsl(217 91% 60%)',
    ctaText: 'Solicitar mantenimiento',
    ctaLink: '#contacto',
  },
  {
    id: 2,
    title: 'Instalación de Redes Empresariales',
    description: 'Diseño y montaje de redes cableadas e inalámbricas. Desde una oficina pequeña hasta un edificio completo.',
    shortDescription: 'Diseño y montaje de redes cableadas e inalámbricas.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80&auto=format&fit=crop',
    icon: 'IconNetwork',
    gradient: 'linear-gradient(135deg, hsl(187 90% 46% / 0.9) 0%, hsl(160 84% 42% / 0.7) 100%)',
    glowColor: 'hsl(187 90% 46%)',
    ctaText: 'Cotizar instalación',
    ctaLink: '#contacto',
  },
  {
    id: 3,
    title: 'Configuración de Equipos de Red',
    description: 'Routers, switches y access points configurados para tu red. VLANs, QoS, VPN — sin slop.',
    shortDescription: 'Configuración de routers, switches y APs.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&q=80&auto=format&fit=crop',
    icon: 'IconRouter',
    gradient: 'linear-gradient(135deg, hsl(187 90% 46% / 0.9) 0%, hsl(38 92% 52% / 0.7) 100%)',
    glowColor: 'hsl(38 92% 52%)',
    ctaText: 'Optimizar mi red',
    ctaLink: '#contacto',
  },
  {
    id: 4,
    title: 'Redes Inalámbricas WiFi',
    description: 'Cobertura sin puntos ciegos. Estudio de sitio, roaming sin cortes y soporte continuo.',
    shortDescription: 'WiFi empresarial con roaming y cobertura completa.',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=900&q=80&auto=format&fit=crop',
    icon: 'IconWifi',
    gradient: 'linear-gradient(135deg, hsl(160 84% 42% / 0.9) 0%, hsl(187 90% 46% / 0.7) 100%)',
    glowColor: 'hsl(160 84% 42%)',
    ctaText: 'Auditar cobertura',
    ctaLink: '#contacto',
  },
  {
    id: 5,
    title: 'Soporte Técnico Especializado',
    description: 'Presencial o remoto. Resolvemos lo que otros no pudieron — o lo que nadie quiso tocar.',
    shortDescription: 'Soporte presencial y remoto para empresas.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format&fit=crop',
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
