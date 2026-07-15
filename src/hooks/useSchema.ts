import { useEffect } from 'react';

export function useSchema(schemaData: Record<string, any>) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-schema';
    script.text = JSON.stringify(schemaData);
    
    // Remove any existing dynamic schema
    const existing = document.getElementById('dynamic-schema');
    if (existing) {
      document.head.removeChild(existing);
    }
    
    document.head.appendChild(script);
    
    return () => {
      const el = document.getElementById('dynamic-schema');
      if (el) {
        document.head.removeChild(el);
      }
    };
  }, [schemaData]);
}
