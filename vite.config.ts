import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Base path para GitHub Pages
      base: mode === 'production' ? '/SIGO-OPUS/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Proxy para o backend API em desenvolvimento
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
          },
        },
      },
      plugins: [react()],
      // SEGURANÇA: API keys devem ficar apenas no backend
      // Não expor chaves sensíveis no bundle do frontend
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
      }
    };
});
