import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProduction = mode === 'production';

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
    plugins: [
      react(),
      svgr(),
      isProduction &&
        viteCompression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 10240,
          deleteOriginFile: false,
        }),
      isProduction &&
        viteCompression({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 10240,
          deleteOriginFile: false,
        }),
      process.env.ANALYZE === 'true' &&
        visualizer({
          filename: './dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),
    build: {
      chunkSizeWarningLimit: 600,
      target: 'es2015',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Improved manual chunking strategy
          manualChunks: (id) => {
            // Node modules chunking
            if (id.includes('node_modules')) {
              // Core React libraries - split into smaller chunks
              if (id.includes('react-dom')) {
                return 'react-dom';
              }
              if (id.includes('react') && !id.includes('react-router')) {
                return 'react';
              }
              if (id.includes('react-router')) {
                return 'react-router';
              }
              if (id.includes('scheduler')) {
                return 'react-dom'; // Scheduler is part of react-dom
              }

              // Redux
              if (id.includes('redux') || id.includes('@reduxjs')) {
                return 'redux';
              }

              // MUI Core - split by module for better caching
              if (id.includes('@mui/material')) {
                return 'mui-material';
              }

              // MUI Icons (tree-shakeable)
              if (id.includes('@mui/icons-material')) {
                return 'mui-icons';
              }

              // Emotion styling
              if (id.includes('@emotion')) {
                return 'emotion';
              }

              // MUI X Charts (heavy library, separate chunk)
              if (id.includes('@mui/x-charts')) {
                return 'mui-charts';
              }

              // Utilities
              if (id.includes('axios')) {
                return 'axios';
              }
              if (id.includes('react-ga4')) {
                return 'analytics';
              }
              if (id.includes('marked')) {
                return 'marked';
              }
              if (id.includes('lottie')) {
                return 'lottie';
              }
              if (id.includes('react-helmet')) {
                return 'helmet';
              }

              // Other smaller dependencies
              return 'vendor';
            }
          },
          // Better file naming for caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'react-ga4',
      ],
      exclude: ['*.svg', '**/*.svg'],
    },
  };
});
