import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  divisionName?: string;
  toolName?: string;
  howToSteps?: string[];
  faq?: { question: string; answer: string }[];
  children?: React.ReactNode;
}

export default function SEOHead({ title, description, canonicalUrl, divisionName, toolName, howToSteps, faq, children }: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', 'website', true);
    if (canonicalUrl) {
      updateMeta('og:url', canonicalUrl, true);
      let link = document.querySelector(`link[rel="canonical"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }, [title, description, canonicalUrl]);

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "description": description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any"
  };

  const howToSchema = howToSteps && howToSteps.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${toolName || title}`,
    "step": howToSteps.map((step, index) => ({
      "@type": "HowToStep",
      "text": step,
      "position": index + 1
    }))
  } : null;

  const faqSchema = faq && faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      {howToSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />}
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      
      {/* Breadcrumbs */}
      {(divisionName && toolName) && (
        <nav className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2 px-4 max-w-7xl mx-auto pt-4">
          <span className="hover:text-slate-900 cursor-pointer">Home</span>
          <span>/</span>
          <span className="hover:text-slate-900 cursor-pointer">{divisionName}</span>
          <span>/</span>
          <span className="text-slate-900">{toolName}</span>
        </nav>
      )}

      {children}
    </>
  );
}
