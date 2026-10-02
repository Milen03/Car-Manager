import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    // Mirrors the Vercel rewrite so the auth cookie stays same-origin.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
