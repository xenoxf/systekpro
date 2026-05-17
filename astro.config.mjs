import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import path from 'path';
import react from '@astrojs/react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
  integrations: [react()],
});
