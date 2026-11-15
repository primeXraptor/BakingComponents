import { defineConfig } from "vite";
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/auth/index.ts",
      formats: ["es"],
      fileName: () => "auth.js",
      cssFileName: "auth",
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, "react-aria-components"],
      output: { banner: '"use client";' },
    },
  },
});
