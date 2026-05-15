import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';

import { fileURLToPath } from 'url';
import path from 'path';

import react from '@astrojs/react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
	},
	integrations: [react()],
});