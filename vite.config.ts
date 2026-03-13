import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix Vercel build: Rollup resolves react to CJS and marks them ?commonjs-external with a relative
// path that fails. Resolve those ids to the actual CJS implementation files so they get bundled
// (single React instance with createContext etc.).
function resolveReactCjsToEsm() {
  const isProd = process.env.NODE_ENV !== 'development';
  const reactCjs = path.resolve(__dirname, `node_modules/react/cjs/react.${isProd ? 'production.min' : 'development'}.js`);
  const reactJsxRuntimeCjs = path.resolve(__dirname, `node_modules/react/cjs/react-jsx-runtime.${isProd ? 'production.min' : 'development'}.js`);
  const reactJsxDevRuntimeCjs = path.resolve(__dirname, 'node_modules/react/cjs/react-jsx-dev-runtime.development.js');
  const reactDomCjs = path.resolve(__dirname, `node_modules/react-dom/cjs/react-dom.${isProd ? 'production.min' : 'development'}.js`);
  const reactDomClient = path.resolve(__dirname, 'node_modules/react-dom/client.js');
  return {
    name: 'resolve-react-cjs-to-esm',
    enforce: 'post',
    resolveId(id: string) {
      const rawId = id.replace(/\?.*$/, '').replace(/^\.\//, '');
      if (rawId.includes('react-jsx-runtime.production.min.js')) return reactJsxRuntimeCjs;
      if (rawId.includes('react-jsx-runtime.development')) return reactJsxDevRuntimeCjs;
      if (rawId.includes('react.production.min.js') || rawId.includes('react.development.js')) return reactCjs;
      if (rawId.includes('react-dom.production.min.js') || rawId.includes('react-dom.development.js')) return reactDomCjs;
      if (rawId.includes('react-dom-client')) return reactDomClient;
      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [resolveReactCjsToEsm(), react()],
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    alias: {
      // More specific first so subpaths don’t get matched as main package + path
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom', 'lucide-react'],
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
