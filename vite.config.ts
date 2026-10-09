import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/voice-request': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/resources': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/plans': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/learners': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/class': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/quizzes': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/gnn': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/ml': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    },
    watch: {
      ignored: ['**/data/**', '**/backend/**']
    }
  }
});
