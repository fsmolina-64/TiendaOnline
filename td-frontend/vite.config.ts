import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});