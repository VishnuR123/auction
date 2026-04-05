import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // XP.css trips LightningCSS minify; esbuild minifier handles it.
    cssMinify: "esbuild",
  },
});
