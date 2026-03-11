import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    alias: {
      // Force ESM builds so Rollup never resolves CJS (avoids commonjs-external resolution bug)
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
      'react/cjs/react.production.min.js': path.resolve(__dirname, 'node_modules/react/index.js'),
      'react/cjs/react.development.js': path.resolve(__dirname, 'node_modules/react/index.js'),
      'react/cjs/react-jsx-runtime.production.min.js': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react/cjs/react-jsx-runtime.development.js': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
      'react-dom/cjs/react-dom.production.min.js': path.resolve(__dirname, 'node_modules/react-dom/index.js'),
      'react-dom/cjs/react-dom.development.js': path.resolve(__dirname, 'node_modules/react-dom/index.js'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://propertyfiling-backendnode.onrender.com',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
