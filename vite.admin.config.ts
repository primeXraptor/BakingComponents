import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/styled-dashboard/admin-index.ts",
      formats: ["es"],
      fileName: () => "dashboard-admin.js",
      cssFileName: "dashboard-admin",
    },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        "react-aria-components",
        "@untitledui/icons",
        "sonner",
        "pdfjs-dist",
        "framer-motion",
        "lucide-react",
      ],
      output: { banner: '"use client";' },
    },
  },
});
