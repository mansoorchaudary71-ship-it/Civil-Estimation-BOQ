import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
  },
  optimizeDeps: {
    include: ['react-is']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /react-is/]
    }
  }
});
