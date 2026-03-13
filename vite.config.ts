import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = path.resolve(process.cwd());

function reactCjsFix() {
  return {
    name: 'react-cjs-fix',
    resolveId(id) {
      const r = (p) => path.resolve(root, 'node_modules', p);
      // Only fix CJS-style ids that break the build; leave bare 'react'/'react-dom' to normal resolution
      if (id.includes('react.production.min.js') || id.includes('react.development.js')) {
        return r('react/index.js');
      }
      if (id.includes('react-dom.production.min.js') || id.includes('react-dom.development.js')) {
        return r('react-dom/index.js');
      }
      if (id.includes('react-jsx-runtime')) {
        return r('react/jsx-runtime.js');
      }
      if (id.includes('react-jsx-dev-runtime')) {
        return r('react/jsx-dev-runtime.js');
      }
      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), reactCjsFix()],
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    alias: {
      'react/jsx-runtime': path.resolve(root, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(root, 'node_modules/react/jsx-dev-runtime.js'),
      'react/cjs/react.production.min.js': path.resolve(root, 'node_modules/react/index.js'),
      'react/cjs/react.development.js': path.resolve(root, 'node_modules/react/index.js'),
      'react/cjs/react-jsx-runtime.production.min.js': path.resolve(root, 'node_modules/react/jsx-runtime.js'),
      'react/cjs/react-jsx-runtime.development.js': path.resolve(root, 'node_modules/react/jsx-dev-runtime.js'),
      'react-dom/cjs/react-dom.production.min.js': path.resolve(root, 'node_modules/react-dom/index.js'),
      'react-dom/cjs/react-dom.development.js': path.resolve(root, 'node_modules/react-dom/index.js'),
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
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
