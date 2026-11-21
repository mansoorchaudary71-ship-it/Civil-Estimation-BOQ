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
        // Do NOT hoist transitive imports of dynamic imports into the
        // entry's static imports: ToolHeader dynamically imports
        // html2pdf.js, whose chain (jspdf) would otherwise be hoisted
        // into the first-load graph (see the vendor-pdf note above).
        hoistTransitiveImports: false,
        manualChunks(id) {
          // Wave 2-C (measured): Vite's dynamic-import preload helper
          // ("\0vite/preload-helper.js") is imported by the entry — every
          // lazy tool route uses it — but Rollup had placed it in the
          // vendor-pdf chunk next to jspdf, so the entry's static import
          // of the helper dragged the whole 365 kB jspdf + autotable
          // chunk into the eager graph even though the entry never
          // touches jsPDF (its only use there is the helper). Give the
          // helper its own ~2 kB chunk; vendor-pdf then loads only when
          // a lazy chunk actually needs jsPDF.
          if (id.includes('preload-helper')) return 'vendor-preload';
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('recharts') || id.includes('/d3-') || id.includes('/d3/')) return 'vendor-charts';
            // NOTE (Wave 1 verification, corrected Wave 2-C): html2pdf/
            // html2canvas must NOT be forced into vendor-pdf. They are
            // dynamically imported by eager ToolHeader (await
            // import('html2pdf.js')); grouping them with statically-imported
            // jspdf put the whole 1.6 MB chain in the entry's static
            // imports. jspdf/jspdf-autotable stay grouped (statically
            // imported only by lazy tool modules); html2pdf splits on demand.
            // Wave 2-C (measured): the split alone was not enough — the
            // entry STILL statically imported vendor-pdf. The cause was
            // NOT hoisting and NOT html2pdf: the entry's vendor-pdf import
            // was Vite's own dynamic-import preload helper
            // ("\0vite/preload-helper.js", see the rule above), which
            // Rollup had placed in vendor-pdf next to jspdf. Fixed by
            // giving the helper its own chunk.
            // Baseline eager graph: 8 chunks / 4.54 MB (vendor 2.26 MB +
            // vendor-pdf 0.36 MB). Fix: own on-demand chunk for the
            // html2pdf chain + no transitive hoisting + own chunk for the
            // preload helper, so the chain loads only when a user actually
            // exports a PDF.
            if (id.includes('html2pdf') || id.includes('html2canvas')) return 'vendor-html2pdf';
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
