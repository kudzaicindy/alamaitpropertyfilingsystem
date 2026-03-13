import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix Vercel build: Rollup sometimes resolves react/react-dom to CJS and marks them ?commonjs-external;
// the relative path then fails. Resolve those ids to the ESM files so they get bundled.
function resolveReactCjsToEsm() {
  const reactEsm = path.resolve(__dirname, 'node_modules/react/index.js');
  const reactJsxRuntimeEsm = path.resolve(__dirname, 'node_modules/react/jsx-runtime.js');
  const reactJsxDevRuntimeEsm = path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js');
  const reactDomEsm = path.resolve(__dirname, 'node_modules/react-dom/index.js');
  const reactDomClientEsm = path.resolve(__dirname, 'node_modules/react-dom/client.js');
  return {
    name: 'resolve-react-cjs-to-esm',
    enforce: 'post', // run after commonjs plugin so we can resolve the CJS external ids it creates
    resolveId(id: string) {
      const rawId = id.replace(/\?.*$/, '').replace(/^\.\//, '');
      if (rawId.includes('react-jsx-runtime.production.min.js')) return reactJsxRuntimeEsm;
      if (rawId.includes('react-jsx-runtime.development')) return reactJsxDevRuntimeEsm;
      if (rawId.includes('react.production.min.js') || rawId.includes('react.development.js')) return reactEsm;
      if (rawId.includes('react-dom.production.min.js') || rawId.includes('react-dom.development.js')) return reactDomEsm;
      if (rawId.includes('react-dom-client')) return reactDomClientEsm;
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
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
      'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client.js'),
      'react': path.resolve(__dirname, 'node_modules/react/index.js'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom/index.js'),
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
