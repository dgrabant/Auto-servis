import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',       // relative paths for static deployment
  server: {
    host: '0.0.0.0',  // for dev server if testing on Render's preview
    port: 5173
  },
  build: {
    outDir: 'dist',   // default output directory
    emptyOutDir: true
  }
})
