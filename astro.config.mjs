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
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  },
  integrations: [react()],
});
