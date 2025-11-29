import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core UI components that are used everywhere
          "ui-core": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-accordion",
            "@radix-ui/react-progress",
            "@headlessui/react",
          ],
          // Chart libraries - loaded on demand
          charts: ["recharts"],
          // Heavy utility libraries
          utils: ["clsx", "class-variance-authority", "tailwind-merge", "zod"],
          // Excel handling - only loaded when needed
          excel: ["exceljs"],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable source maps for production debugging
    sourcemap: false,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "lucide-react", "@remix-run/react", "@remix-run/node"],
    exclude: ["exceljs"], // Exclude heavy dependencies from pre-bundling
  },
});
