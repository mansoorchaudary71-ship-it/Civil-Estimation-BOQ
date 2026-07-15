import { useEffect } from 'react';

export function useGlobalPrint(getPrintData: () => any) {
  useEffect(() => {
    // Expose the getter to the window object so PrintPreviewModal can fetch fresh data on demand
    (window as any).__GLOBAL_PDF_GETTER = getPrintData;
    
    return () => {
       delete (window as any).__GLOBAL_PDF_GETTER;
    };
  }, [getPrintData]);
}

