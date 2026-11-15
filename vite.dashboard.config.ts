import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/dashboard/index.ts",
      formats: ["es"],
      fileName: () => "dashboard.js",
      cssFileName: "dashboard",
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
