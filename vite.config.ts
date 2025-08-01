import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base:
    process.env.NODE_ENV === "development"
      ? process.env.DEV_SERVER_BASE_PATH
      : "/", // Use relative path for production
  server: {
    port: Number(process.env.DEV_SERVER_PORT ?? 8080),
    host: process.env.DEV_SERVER_HOST,
    allowedHosts: process.env.DEV_SERVER_DOMAIN != null
        ? [process.env.DEV_SERVER_DOMAIN]
        : undefined,
  },
});
