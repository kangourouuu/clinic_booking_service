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
        sourcemap: true,
        // Optimize chunk splitting
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
                    'ui-vendor': ['lucide-react', 'framer-motion', 'clsx'],
                    'form-vendor': ['react-hook-form', 'axios'],
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Use esbuild for minification (faster and no extra dependencies)
        minify: 'esbuild',
    },
    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            'axios',
            'lucide-react',
        ],
    },
})
