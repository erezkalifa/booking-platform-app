import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/open_api/v1": {
        target: "https://app.boomnow.com",
        changeOrigin: true,
        secure: true,
      },
    },
    host: true,
    port: process.env.PORT || 3000,
  },
  preview: {
    allowedHosts: [
      "web-production-0fac.up.railway.app",
      "*.up.railway.app", // This will allow all railway subdomains
    ],
  },
});
