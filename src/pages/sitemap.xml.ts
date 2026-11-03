const siteUrl = 'https://sistek.com.co';

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/nosotros', priority: '0.7', changefreq: 'monthly' },
  { path: '/servicios/mantenimiento-computadores', priority: '0.9', changefreq: 'monthly' },
  { path: '/servicios/instalacion-redes-empresariales', priority: '0.9', changefreq: 'monthly' },
  { path: '/servicios/cableado-estructurado', priority: '0.9', changefreq: 'monthly' },
  { path: '/servicios/configuracion-routers-switches', priority: '0.8', changefreq: 'monthly' },
  { path: '/servicios/soporte-tecnico', priority: '0.8', changefreq: 'monthly' },
  { path: '/servicios/asistencia-remota', priority: '0.8', changefreq: 'monthly' },
  { path: '/servicios/diseno-mantenimiento-redes-datos', priority: '0.8', changefreq: 'monthly' },
  { path: '/servicios/desarrollo-web-backend', priority: '0.8', changefreq: 'monthly' },
  { path: '/servicios/ensamblaje-computadores', priority: '0.8', changefreq: 'monthly' },
  { path: '/servicios/capacitacion-tecnologica', priority: '0.8', changefreq: 'monthly' },
  { path: '/servicios/marketing-digital', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog', priority: '0.7', changefreq: 'weekly' },
  { path: '/blog/instalacion-red-empresarial-cali', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacidad', priority: '0.3', changefreq: 'yearly' },
  { path: '/terminos', priority: '0.3', changefreq: 'yearly' },
  { path: '/politicas', priority: '0.3', changefreq: 'yearly' },
];

const lastMod = new Date().toISOString();

export function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(page => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="es-CO" href="${siteUrl}${page.path}" />
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
