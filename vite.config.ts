import { defineConfig } from "vite";
export default defineConfig({ build: { emptyOutDir: false, lib: { entry: "src/index.ts", formats: ["es"], fileName: "index", cssFileName: "baking-components" }, rollupOptions: { external: [/^react($|\/)/, /^react-dom($|\/)/, "react-aria-components", "framer-motion", "lucide-react"], output: { banner: '"use client";' } } } });
