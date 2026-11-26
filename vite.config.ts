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
            // Leg 3 (2026-11-26): the generic 'vendor' chunk below is a
            // STATIC import of the entry, so EVERYTHING mapped into it
            // rides in first paint — including libraries only used by
            // lazy routes. Measured baseline: vendor was 1,112 kB raw
            // (344 kB gzip) yet its biggest members were lazy-only:
            // konva (Takeoff/ReinforcementVisualizer), the react-markdown
            // chain (Blog/AIAssistant), canvg/core-js/dompurify
            // (html2pdf/html2canvas), re2js (firestore), pako/fast-png
            // (jspdf), decimal.js-light/es-toolkit/@reduxjs/toolkit
            // (recharts) and qrcode (lazy report/share flows). Each gets
            // its own chunk here, so Rollup loads it only when the lazy
            // route that needs it loads. Nothing below is imported by the
            // entry or any eager home component (verified by chunk-module
            // analysis 2026-11-26); if a future eager import is added,
            // its chunk becomes a static preload again — keep it that way
            // only deliberately.
            if (id.includes('konva') || id.includes('react-reconciler')) return 'vendor-konva';
            if (
              id.includes('react-markdown') || id.includes('micromark') ||
              id.includes('mdast') || id.includes('/unified/') ||
              id.includes('remark-') || id.includes('rehype-') ||
              id.includes('hast-') || id.includes('/vfile/') ||
              id.includes('vfile-message') || id.includes('property-information') ||
              id.includes('unist-') || id.includes('decode-named-character-reference') ||
              id.includes('character-entities') || id.includes('stringify-entities') ||
              id.includes('/ccount/') || id.includes('/bail/') || id.includes('/trough/')
            ) return 'vendor-markdown';
            if (id.includes('canvg') || id.includes('core-js') || id.includes('dompurify')) return 'vendor-html2pdf';
            if (id.includes('re2js')) return 'vendor-firebase';
            if (id.includes('fast-png') || id.includes('/pako/')) return 'vendor-pdf';
            if (id.includes('jszip')) return 'vendor-spreadsheet';
            if (id.includes('decimal.js-light') || id.includes('es-toolkit') || id.includes('@reduxjs/toolkit')) return 'vendor-charts';
            if (id.includes('qrcode')) return 'vendor-qrcode';
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
