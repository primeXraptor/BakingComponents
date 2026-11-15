import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "baking-components",
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
        "framer-motion",
        "lucide-react",
      ],
      output: { banner: '"use client";' },
    },
  },
});
