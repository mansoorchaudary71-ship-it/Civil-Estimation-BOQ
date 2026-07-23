import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "./",
  optimizeDeps: {
    include: ['react-is']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /react-is/]
    }
  }
});
