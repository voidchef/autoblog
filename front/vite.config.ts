import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    server: {
      proxy: {
        '/v1': {
          target: env.VITE_SERVER_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), svgr()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split React and related libraries into their own chunk
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Split Material-UI into its own chunk
            'mui-vendor': [
              '@mui/material',
              '@mui/icons-material',
              '@emotion/react',
              '@emotion/styled',
            ],
            // Split Redux into its own chunk
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
            // Split other large dependencies
            'utils-vendor': ['react-ga4', 'axios'],
          },
        },
      },
      // Increase chunk size warning limit if needed
      chunkSizeWarningLimit: 600,
    },
  };
});
