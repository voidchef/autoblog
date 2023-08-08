import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/v1': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), svgr()],
});
