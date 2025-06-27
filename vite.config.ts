import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Ou @vitejs/plugin-vue, etc., dependendo do seu framework

export default defineConfig({
  plugins: [react()], // Ou seus plugins relevantes
  server: {
    host: true,
    allowedHosts: [
      "396d-190-102-47-102.ngrok-free.app",
      "196c-190-102-47-102.ngrok-free.app",
    ],
  },
});
