import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: "worker/index.ts",
    outDir: "dist",
    emptyOutDir: false,
    target: "es2024",
    rolldownOptions: {
      output: { entryFileNames: "_worker.js" },
    },
  },
  ssr: {
    target: "webworker",
    noExternal: true,
  },
});
