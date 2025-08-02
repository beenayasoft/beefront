import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            if (id.includes('axios') || id.includes('@tanstack')) {
              return 'api-vendor';
            }
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
          
          // Feature-based chunks
          if (id.includes('src/features/crm')) {
            return 'crm-features';
          }
          if (id.includes('src/features/documents')) {
            return 'documents-features';
          }
          if (id.includes('src/features/settings')) {
            return 'settings-features';
          }
          if (id.includes('src/features/library')) {
            return 'library-features';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB to suppress warnings for now
  },
}));