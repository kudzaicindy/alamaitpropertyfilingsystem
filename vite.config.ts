import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Resolve paths to React/ReactDOM CJS files (use dev when production.min is missing, e.g. on Vercel).
function getReactCjsPaths() {
  const nm = path.join(__dirname, 'node_modules');
  const tryResolve = (p: string): string | null => {
    try {
      return require.resolve(p);
    } catch {
      return null;
    }
  };
  return {
    reactProd: tryResolve('react/cjs/react.production.min.js'),
    reactDev: tryResolve('react/cjs/react.development.js') ?? path.join(nm, 'react/cjs/react.development.js'),
    reactIndex: path.join(nm, 'react/index.js'),
    reactJsxProd: tryResolve('react/cjs/react-jsx-runtime.production.min.js'),
    reactJsxDev: tryResolve('react/cjs/react-jsx-runtime.development.js') ?? path.join(nm, 'react/cjs/react-jsx-runtime.development.js'),
    reactDomProd: tryResolve('react-dom/cjs/react-dom.production.min.js'),
    reactDomDev: tryResolve('react-dom/cjs/react-dom.development.js') ?? path.join(nm, 'react-dom/cjs/react-dom.development.js'),
    reactDomIndex: path.join(nm, 'react-dom/index.js'),
  };
}

const cjsPaths = getReactCjsPaths();

/**
 * Fix Vercel build: when react/index.js or react/jsx-runtime.js require() a production CJS file
 * that doesn't exist (ENOENT), resolve that request to the development CJS file instead.
 * We do NOT alias 'react' itself so the commonjs plugin can transform the wrapper normally.
 */
function resolveReactCjsToEsm() {
  return {
    name: 'resolve-react-cjs-to-esm',
    enforce: 'pre',
    resolveId(id: string, importer?: string) {
      const rawId = id.replace(/\?.*$/, '').replace(/^\.\//, '');
      const fromReact = importer != null && (importer.includes('react' + path.sep) || importer.includes('react/'));
      const fromReactDom = importer != null && (importer.includes('react-dom' + path.sep) || importer.includes('react-dom/'));

      if (fromReact && rawId.includes('react-jsx-runtime.production.min.js')) return cjsPaths.reactJsxProd ?? cjsPaths.reactJsxDev;
      if (fromReact && rawId.includes('react-jsx-runtime.development')) return cjsPaths.reactJsxDev;
      if (fromReact && rawId.includes('react.production.min.js')) return cjsPaths.reactProd ?? cjsPaths.reactDev;
      if (fromReact && rawId.includes('react.development.js')) return cjsPaths.reactDev;

      if (fromReactDom && rawId.includes('react-dom.production.min.js')) return cjsPaths.reactDomProd ?? cjsPaths.reactDomDev;
      if (fromReactDom && rawId.includes('react-dom.development.js')) return cjsPaths.reactDomDev;

      // Fix broken commonjs-external ids (relative path that fails on Vercel)
      if (id.includes('commonjs-external')) {
        if (rawId.includes('react-jsx-runtime.production.min.js')) return cjsPaths.reactJsxProd ?? cjsPaths.reactJsxDev;
        if (rawId.includes('react-jsx-runtime.development')) return cjsPaths.reactJsxDev;
        if (rawId.includes('react.production.min.js')) return cjsPaths.reactProd ?? cjsPaths.reactDev;
        if (rawId.includes('react.development.js') && !rawId.includes('react-dom')) return cjsPaths.reactDev;
        if (rawId.includes('react-dom.production.min.js')) return cjsPaths.reactDomProd ?? cjsPaths.reactDomDev;
        if (rawId.includes('react-dom.development.js')) return cjsPaths.reactDomDev;
      }
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
