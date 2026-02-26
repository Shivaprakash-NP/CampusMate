import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Forward anything that starts with /api to your backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // secure: false, // Uncomment if your backend uses a self-signed HTTPS certificate
      }
    }
}
})
