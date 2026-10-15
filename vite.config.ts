import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // GitHub Pages project-site URL: https://<username>.github.io/parent-insight/
  base: '/parent-insight/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': projectRoot,
    },
  },
});
