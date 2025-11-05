import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/work/', // ← назва твого репозиторію
  build: {
    outDir: 'docs' // ← сюди збирається твій готовий сайт
  }
})
