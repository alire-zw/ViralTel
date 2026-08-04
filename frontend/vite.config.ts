import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function shopHeroCacheHeaders(): Plugin {
  return {
    name: 'shop-hero-cache-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/shop-heroes/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/shop-heroes/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), shopHeroCacheHeaders()],
  server: {
    port: 6543,
    strictPort: true,
    host: true,
    allowedHosts: ['www.viraltel.ir', 'proxtest2.mirall.ir', 'api.viraltel.ir', '.viraltel.ir', '.mirall.ir'],
    proxy: {
      '/api': {
        target: 'http://localhost:4321',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 6543,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
  },
})
