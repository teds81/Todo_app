import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Todo_app/',
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    // Pour le développement, redirige / vers /portfolio
    proxy: {
      '/': {
        target: 'https://teds81.github.io/',
        changeOrigin: true,
        rewrite: (path) => path === '/' ? '/Todo_app/' : path
      }
    }
  }
})
