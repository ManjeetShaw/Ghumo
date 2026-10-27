import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// In development, requests to /api are proxied to the backend.
// In production, either serve the built files with server.ts (which proxies /api too)
// or set VITE_API_URL at build time to the backend's public URL.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
});
