import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  worker: {
    format: "es",
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["import", "global-builtin", "color-functions"],
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas pesadas em chunks próprios
          "vendor-pdf": ["react-pdf", "pdf-lib", "pdfjs-dist"],
          "vendor-ocr": ["tesseract.js"],
          "vendor-data": ["xlsx", "papaparse"],
          "vendor-dxf": ["@tarikjabiri/dxf", "dxf-parser"],
          "vendor-geo": ["proj4", "leaflet"],
          "vendor-ui": ["react-bootstrap", "bootstrap", "lucide-react"],
          "vendor-utils": ["mathjs", "jszip"],
        },
      },
    },
  },
});
