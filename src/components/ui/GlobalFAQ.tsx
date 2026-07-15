import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ALL_MODULES } from '../Dashboard';

export interface FAQItem {
  question: string;
  answer: string;
}

const SPECIFIC_FAQS: Record<string, FAQItem[]> = {
  "topsoil": [
    {
      question: "What is Bulking (Swell) Factor?",
      answer: "When earth is excavated, it loosens and expands. A factor of 1.25 means the soil requires 25% more volume in the truck than it occupied in the ground."
    }
  ],
  "concrete": [
    {
      question: "Why do we multiply wet volume by 1.33?",
      answer: "Dry mortar volume is typically 30-33% more than wet volume due to voids getting filled with water during mixing."
    },
    {
      question: "What is the standard mix ratio for internal plaster?",
      answer: "1:4 (1 part cement to 4 parts sand) is the standard for internal walls and ceilings, ensuring strong adherence."
    }
  ],
  "direct-shear": [
    {
      question: "What if cohesion comes out negative?",
      answer: "Theoretically, soil cannot have negative cohesion. We bound the bottom limit of 'c' to 0 if the linear fit forces a negative intercept."
    }
  ],
  "precast-wall": [
    {
      question: "Why do we add 1 to the post count?",
      answer: "A linear wall segment requires a starting post and an ending post. For n bays, you need n+1 posts. If it's a closed loop enclosure, n posts = n bays."
    }
  ],
  "cbr": [
    {
      question: "What if the curve is concave upwards initially?",
      answer: "This happens due to surface irregularities. The curve must be corrected by drawing a tangent at the point of greatest slope to intersect the load axis."
    },
    {
      question: "Why is 5.0mm CBR sometimes higher?",
      answer: "Usually the 2.5mm CBR is higher. If 5.0mm is higher, the test should be repeated. If the second test also shows 5.0mm > 2.5mm, the 5.0mm value is accepted."
    }
  ],
  "area": [
    {
      question: "How is an irregular plot calculated?",
      answer: "Irregular land is measured by breaking the polygon into adjacent triangles (Geometric Triangulation). By measuring the 4 boundaries and one diagonal cross-section, Heron's formula is applied to each triangle for perfect accuracy."
    },
    {
      question: "What is RERA Carpet Area?",
      answer: "According to the Real Estate (Regulation and Development) Act (RERA), the carpet area is the net usable floor area of an apartment, excluding external walls, balconies, terraces, and service shafts, but including the area covered by internal partition walls."
    },
    {
      question: "How does the Roof Pitch Multiplier work?",
      answer: "A sloped roof has a larger surface area than its horizontal footprint. The calculator divides the horizontal area (plus overhangs) by the cosine of the pitch angle to give the true sloped area required for roofing materials."
    }
  ],
  "house": [
    {
      question: "What engineering formulas does this tool use?",
      answer: "It strictly uses internationally recognized civil engineering formulas relevant to the quantity estimation field, compliant with standards like NBC Pakistan 2021."
    },
    {
      question: "How accurate is the material estimation?",
      answer: "Our engine uses standard volume conversions (e.g., 1.54 for concrete dry volume) to compute exact material breakdowns matching professional BOQs."
    },
    {
      question: "Does it support different Plot Units like Marla and Sq.Yd?",
      answer: "Yes, the calculation automatically scales whether you input your plot in Marlas, Square Yards, or Square Feet."
    },
    {
      question: "Can I adjust the market rates?",
      answer: "Absolutely. Click on 'View Market Rates' to customize the cost per unit for cement, steel, bricks, and labor."
    }
  ]
};

interface GlobalFAQProps {
  faqs?: FAQItem[];
  moduleId?: string; 
}

export function GlobalFAQ({ faqs = [], moduleId }: GlobalFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const moduleDef = ALL_MODULES.find(m => m.id === moduleId);

  const formatToolTitle = (t: string) => t.replace(/^(Calculate|Find) /, '');

  const specificFaqs = moduleId ? (SPECIFIC_FAQS[moduleId] || []) : [];

  const genericFaqs = moduleDef ? [
    {
      question: `Is the ${formatToolTitle(moduleDef.title)} free to use?`,
      answer: `Yes, all core calculation features for the ${moduleDef.title.toLowerCase()} are completely free for all users.`
    },
    {
      question: `How accurate are the results from the ${formatToolTitle(moduleDef.title)}?`,
      answer: `Estimations follow standard civil engineering formulas and practices. Always verify critical computations.`
    },
    {
      question: `Can I use this ${moduleDef.category.toLowerCase()} tool on my mobile phone?`,
      answer: `Absolutely. The ${formatToolTitle(moduleDef.title)} is fully responsive and optimized for seamless use on smartphones and tablets.`
    },
    {
      question: `What engineering formulas does this tool use?`,
      answer: `It strictly uses internationally recognized civil engineering formulas relevant to the ${moduleDef.category.toLowerCase()} field.`
    },
    {
      question: `How do I save my ${formatToolTitle(moduleDef.title)} calculations?`,
      answer: `Use the Quick Actions menu to export a detailed PDF report or copy the data to your clipboard. Premium users can save directly to their dashboard.`
    }
  ] : [];

  // Filter out any duplicates based on question exact match (or we can just append)
  const combinedFaqsMap = new Map();
  [...faqs, ...specificFaqs, ...genericFaqs].forEach(f => {
    if(!combinedFaqsMap.has(f.question)) {
      combinedFaqsMap.set(f.question, f);
    }
  });
  const combinedFaqs = Array.from(combinedFaqsMap.values());
  const displayedFaqs = showAll ? combinedFaqs : combinedFaqs.slice(0, 2);

  return (
    <section className="w-full bg-white rounded-[32px] p-4 sm:p-4 sm:p-4 sm:p-6 md:p-4 sm:p-4 sm:p-4 sm:p-8 border border-slate-100 shadow-sm overflow-hidden" aria-label="Frequently Asked Questions">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {displayedFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className="w-full border border-slate-200 rounded-[24px] bg-white/80 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow transition-shadow"
            >
              <button className="w-full text-left px-6 py-4 md:py-5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/20 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-slate-800 text-lg pr-8">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
                />
              </button>
              
              <div 
                id={`faq-answer-${index}`}
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0 overflow-hidden'}`}
                aria-hidden={!isOpen}
              >
                <div className="px-6 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {combinedFaqs.length > 2 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors shadow-sm active:scale-95 hover:-translate-y-0.5"
          >
            {showAll ? 'Show Less' : `Show all ${combinedFaqs.length} questions`}
          </button>
        </div>
      )}
    </section>
  );
}
