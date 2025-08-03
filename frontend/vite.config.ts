import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import process from 'process';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], 
  server: {
    proxy: {
      '/api':`http://${process.env.BACKEND_IP}`
    }
  }
})
