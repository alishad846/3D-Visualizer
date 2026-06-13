import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig({

  plugins: [
    react(),
    {
      name: 'strip-dev-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const originalSetHeader = res.setHeader;
          res.setHeader = function (key, value) {
            const lowerKey = key.toLowerCase();
            if (lowerKey === 'pragma' || lowerKey === 'expires' || lowerKey === 'x-xss-protection') {
              return;
            }
            if (lowerKey === 'content-security-policy') {
              return;
            }
            return originalSetHeader.apply(this, arguments);
          };
          next();
        });
      }
    }
  ],

  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },

  // ── Three.js deduplication ──────────────────────────────────────
  // "@react-three/fiber" and "@react-three/drei" each resolve their
  // own copy of the "three" package from their own node_modules. When
  // the app also lists "three" as a direct dependency Vite ends up
  // bundling two separate copies, which triggers the runtime warning
  // "Multiple instances of Three.js being imported".
  //
  // dedupe forces Vite to treat "three" as a single shared module
  // regardless of which import path resolves it.
  resolve: {
    dedupe: ["three"],
  },

  optimizeDeps: {
    exclude: ["@google/model-viewer"],
  },

});
