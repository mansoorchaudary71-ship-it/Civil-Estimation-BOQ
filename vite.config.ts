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
    },
    // Split vendor code out of the initial chunk so the home page loads a
    // small entry chunk; tool routes are React.lazy chunks (see App.tsx).
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('recharts') || id.includes('/d3-') || id.includes('/d3/')) return 'vendor-charts';
            // NOTE (Wave 1 verification): html2pdf/html2canvas must NOT be forced
            // into vendor-pdf. They are dynamically imported by eager ToolHeader
            // (await import('html2pdf.js')); grouping them with statically-imported
            // jspdf made Rollup hoist the whole 1.6 MB chunk into the entry's
            // static imports. jspdf/jspdf-autotable stay grouped (statically
            // imported only by lazy tool modules); html2pdf splits on demand.
            if (id.includes('jspdf')) return 'vendor-pdf';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-is') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase';
            if (id.includes('xlsx') || id.includes('exceljs')) return 'vendor-spreadsheet';
            return 'vendor';
          }
          return undefined;
        }
      }
    }
  }
});
