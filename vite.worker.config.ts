import { defineConfig } from 'vite'
import { sites } from '@openai/sites-vite-plugin'

export default defineConfig({
  publicDir: false,
  plugins: [sites()],
  build: {
    ssr: 'server/worker.mjs',
    outDir: 'dist/server',
    target: 'es2022',
    rollupOptions: { output: { entryFileNames: 'index.js' } },
  },
})
