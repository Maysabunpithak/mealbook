import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sites } from '@openai/sites-vite-plugin'
import { createCommunityMiddleware } from './server/community.mjs'
export default defineConfig({ build: { outDir: 'dist/client' }, plugins: [react(), tailwindcss(), sites(), {
  name: 'mealbook-community',
  configureServer(server) { server.middlewares.use(createCommunityMiddleware()) },
  configurePreviewServer(server) { server.middlewares.use(createCommunityMiddleware()) },
}] })
