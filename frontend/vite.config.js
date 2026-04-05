import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://swiftly-g3fg.onrender.com',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'https://swiftly-g3fg.onrender.com',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
