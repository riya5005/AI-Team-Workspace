import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, /api/... is forwarded to your backend, so the browser sees one origin
    proxy: { "/api": "http://localhost:5000" },
  },
});