import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "VamootWidget",
      formats: ["es"],
      fileName: () => "widget.es.js"
    },
    rollupOptions: { output: {} }
  }
});

