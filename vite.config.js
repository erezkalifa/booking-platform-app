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
  },
});
