import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import path from 'path';
import react from '@astrojs/react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  site: 'https://sistek.com.co',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Proxy opcional para evitar CORS en dev si usas PUBLIC_API_URL=/api
      // Si PUBLIC_API_URL apunta directo al backend (localhost o Codespace URL),
      // el CORS del backend ya lo permite (ver sistekpro-backend/src/main.ts).
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  },
  integrations: [react()],
});
