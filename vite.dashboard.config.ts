import { defineConfig } from "vite";
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/dashboard/index.ts",
      formats: ["es"],
      fileName: () => "dashboard.js",
      cssFileName: "dashboard",
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, "react-aria-components"],
      output: { banner: '"use client";' },
    },
  },
});
