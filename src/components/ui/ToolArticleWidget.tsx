import React from 'react';
import { Link } from 'react-router-dom';
import { getToolGuide } from '../../seo/toolGuides';

export function ToolArticleWidget({ toolName, toolId }: { toolName: string; toolId?: string }) {
  const guide = toolId ? getToolGuide(toolId) : undefined;

  // Tools without a guide keep the existing generic boilerplate unchanged.
  if (!guide) {
    return (
      <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 md:p-4 sm:p-4 sm:p-4 sm:p-8 border border-border-color shadow-brand-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-txt-primary tracking-tight mb-6">How to use the {toolName}</h2>
            <ol className="list-decimal list-inside space-y-3 text-base text-txt-secondary leading-relaxed">
              <li>Select your preferred units of measurement</li>
              <li>Input the primary dimensions and parameters</li>
              <li>Review any standard constants and adjust if necessary</li>
              <li>Check the real-time generated results and summaries</li>
              <li>Export the calculation to PDF or save it for later</li>
            </ol>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-txt-primary tracking-tight mb-6">{toolName.replace(/ Calculator$| Estimator$/, '')} Details</h2>
            <p className="text-base text-txt-secondary leading-relaxed mb-4">
              This tool is specifically designed for civil engineers, contractors, and students to calculate requirements with unparalleled speed and accuracy. Our implementation seamlessly integrates the latest engineering guidelines to ensure you receive a robust estimation process directly in your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 md:p-8 border border-border-color shadow-brand-sm overflow-hidden" aria-label={`${toolName} guide`}>
      <h2 className="text-xl md:text-2xl font-bold text-txt-primary tracking-tight mb-4">
        How the {toolName} works
      </h2>
      <p className="text-base text-txt-secondary leading-relaxed mb-8 max-w-3xl">{guide.intro}</p>

      <h3 className="text-lg font-bold text-txt-primary tracking-tight mb-3">Formulas used</h3>
      <ul className="space-y-4 mb-8 max-w-3xl">
        {guide.formulas.map((f) => (
          <li key={f.formula} className="border border-ui-borderSubtle rounded-2xl p-4 bg-surface-default">
            <p className="font-mono text-sm font-bold text-txt-primary break-words">{f.formula}</p>
            <p className="text-sm text-txt-secondary leading-relaxed mt-1">{f.variables}</p>
            {f.note && <p className="text-sm text-txt-tertiary leading-relaxed mt-1">{f.note}</p>}
          </li>
        ))}
      </ul>

      {guide.tables.map((t) => (
        <div key={t.title} className="mb-8 max-w-3xl">
          <h3 className="text-lg font-bold text-txt-primary tracking-tight mb-3">{t.title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-ui-borderSubtle rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-surface-hover text-left">
                  {t.headers.map((h) => (
                    <th key={h} className="p-2 font-semibold text-txt-primary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, i) => (
                  <tr key={i} className="border-t border-ui-borderSubtle">
                    {row.map((cell, j) => (
                      <td key={j} className={`p-2 ${j === 0 ? 'font-semibold text-txt-primary' : 'text-txt-secondary'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <h3 className="text-lg font-bold text-txt-primary tracking-tight mb-3">{guide.workedExample.title}</h3>
      <div className="mb-8 max-w-3xl">
        <p className="text-sm text-txt-secondary leading-relaxed mb-3">
          <strong className="text-txt-primary">Inputs: </strong>{guide.workedExample.inputs}
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-txt-secondary leading-relaxed">
          {guide.workedExample.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <p className="text-sm text-txt-secondary leading-relaxed mt-3">
          <strong className="text-txt-primary">Result: </strong>{guide.workedExample.result}
        </p>
      </div>

      {guide.related.length > 0 && (
        <section aria-labelledby="tool-guide-related-heading">
          <h3 id="tool-guide-related-heading" className="text-lg font-bold text-txt-primary tracking-tight mb-3">
            Related calculators
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guide.related.map((rel) => (
              <Link
                key={rel.id}
                to={`/${rel.id}`}
                className="block bg-surface-default border border-border-color rounded-2xl p-4 hover:border-accent-300 hover:shadow-brand-md transition-all"
              >
                <h4 className="font-semibold text-txt-primary text-sm">{rel.title}</h4>
                <p className="text-sm text-txt-secondary mt-1">{rel.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
