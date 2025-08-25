import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/buy-or-loan/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
})
