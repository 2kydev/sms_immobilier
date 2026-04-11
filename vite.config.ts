import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — loaded on every page, cache indefinitely
          if (id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")) {
            return "vendor-react";
          }

          // Router
          if (id.includes("node_modules/react-router") ||
              id.includes("node_modules/@remix-run/")) {
            return "vendor-router";
          }

          // Data layer — Supabase + React Query
          if (id.includes("node_modules/@supabase/") ||
              id.includes("node_modules/@tanstack/")) {
            return "vendor-data";
          }

          // Charts — only Dashboard uses this
          if (id.includes("node_modules/recharts") ||
              id.includes("node_modules/d3-") ||
              id.includes("node_modules/victory-")) {
            return "vendor-charts";
          }

          // Forms
          if (id.includes("node_modules/react-hook-form") ||
              id.includes("node_modules/@hookform/") ||
              id.includes("node_modules/zod")) {
            return "vendor-forms";
          }

          // Radix UI + shadcn primitives
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }

          // Icons
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }

          // Everything else from node_modules
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
  },
}));
