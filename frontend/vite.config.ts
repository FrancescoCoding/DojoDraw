/// <reference types ="vite/client"/>

import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5174,
  },
  resolve: {
    // Set up absolute imports: import Nav from '@/components/Nav'
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
