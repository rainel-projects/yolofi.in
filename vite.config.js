import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs
    allowedHosts: ['yolofi.in', 'www.yolofi.in', '.yolofi.in', 'localhost'], // Allow domain mapping
    port: 5173
  }
})
