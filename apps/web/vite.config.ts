import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'  // ← Adicione loadEnv
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {  // ← Mude para função com mode
  // Carrega as variáveis do .env sem filtro de prefixo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
    
    // Expõe as variáveis sem prefixo para o frontend
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    }
  }
})