import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: false,
        proxy: {
            '/api': {
                target: 'http://backend:9000',
                changeOrigin: true,
                secure: false,
            }
        },
        watch: {
          usePolling: true,
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
})
