import React, { Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toolsSeoRegistry } from './toolsData';

// Dynamically import all tool components (or create a mapping)
// In a real app, you might use React.lazy for code splitting
import AggregateBlendingCalculator from '../components/modules/AggregateBlendingCalculator';
import IsolatedFootingCalculator from '../components/modules/IsolatedFootingCalculator';
// ... import other tools

const componentMap: Record<string, React.ComponentType<any>> = {
  AggregateBlendingCalculator,
  IsolatedFootingCalculator,
  // ... map other tools
};

export default function DynamicToolPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const toolData = toolsSeoRegistry.find(tool => tool.slug === slug);
  
  if (!toolData) {
    return <Navigate to="/404" replace />;
  }

  const ToolComponent = componentMap[toolData.componentName];
  const canonicalUrl = `https://civilestimationpro.com/calculator/${toolData.slug}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative w-full h-full overflow-y-auto overflow-x-hidden bg-transparent">
      {/* Programmatic SEO Injection */}
      <Helmet>
        <title>{toolData.title}</title>
        <meta name="description" content={toolData.description} />
        <meta name="keywords" content={toolData.keywords.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={toolData.title} />
        <meta property="og:description" content={toolData.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        {/* JSON-LD Structured Data */}
        {toolData.jsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(toolData.jsonLd)}
          </script>
        )}
      </Helmet>

      {/* Render the actual tool component */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex-1 flex flex-col pt-8">
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading calculator...</div>}>
          {ToolComponent ? <ToolComponent /> : <div>Component not found</div>}
        </Suspense>
      </div>
    </div>
  );
}
