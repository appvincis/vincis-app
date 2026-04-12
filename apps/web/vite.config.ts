import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'log-url',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const address = server.httpServer?.address()
          const port = typeof address === 'object' ? address?.port : 5173
          console.log(`\nFront end rodando no http://localhost:${port}`)
        })
      }
    }
  ],


  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
