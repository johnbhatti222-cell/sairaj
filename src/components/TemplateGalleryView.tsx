import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Invoice, TemplateType } from '../types/invoice';
import { ModernTemplate } from './templates/ModernTemplate';
import { CorporateTemplate } from './templates/CorporateTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';

interface TemplateGalleryViewProps {
  invoice: Invoice;
  onSelectTemplate: (template: TemplateType) => void;
  onBackToStudio: () => void;
}

export const TemplateGalleryView: React.FC<TemplateGalleryViewProps> = ({
  invoice,
  onSelectTemplate,
  onBackToStudio,
}) => {
  const templates: {
    id: TemplateType;
    title: string;
    description: string;
    bestFor: string;
    component: React.ReactNode;
  }[] = [
    {
      id: 'modern',
      title: 'Modern Minimal',
      description: 'Streamlined sans-serif typography with accent ribbon and clean tabular totals.',
      bestFor: 'Agencies, Tech Consultants, Freelancers',
      component: <ModernTemplate invoice={{ ...invoice, template: 'modern' }} />,
    },
    {
      id: 'corporate',
      title: 'Corporate Executive',
      description: 'Structured enterprise grid with explicit P.O. box, banking credentials, and formal lines.',
      bestFor: 'B2B Enterprises, Legal & Financial Advisory',
      component: <CorporateTemplate invoice={{ ...invoice, template: 'corporate' }} />,
    },
    {
      id: 'minimal',
      title: 'Editorial Luxe',
      description: 'High-end architectural whitespace, hairline rules, and refined typographic contrast.',
      bestFor: 'Architects, Editorial Writers, Studios',
      component: <MinimalTemplate invoice={{ ...invoice, template: 'minimal' }} />,
    },
    {
      id: 'creative',
      title: 'Creative Studio',
      description: 'Bold color block banner with prominent deliverable breakdown and modern badges.',
      bestFor: 'Product Designers, Creators, Video Agencies',
      component: <CreativeTemplate invoice={{ ...invoice, template: 'creative' }} />,
    },
    {
      id: 'classic',
      title: 'Classic Commercial',
      description: 'Centered serif masthead, traditional boxed tables, and formal invoice phrasing.',
      bestFor: 'Wholesale, Manufacturing, Traditional Firms',
      component: <ClassicTemplate invoice={{ ...invoice, template: 'classic' }} />,
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Template Gallery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse and apply professional, print-calibrated invoice styles with your live data.
          </p>
        </div>

        <button
          onClick={onBackToStudio}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 active:scale-[0.98] transition-colors shadow-xs touch-manipulation"
        >
          <span>Return to Studio</span>
        </button>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {templates.map((tmpl) => {
          const isSelected = invoice.template === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className={`bg-white border rounded-xl overflow-hidden flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Scaled Preview Thumbnail Box */}
              <div className="bg-slate-100/70 p-4 border-b border-slate-200 overflow-hidden h-[300px] sm:h-[340px] relative flex justify-center items-start">
                <div 
                  className="w-[794px] bg-white shadow-xs pointer-events-none origin-top scale-[0.34] sm:scale-[0.38]"
                >
                  {tmpl.component}
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 bg-slate-900 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3" />
                    <span>Active Theme</span>
                  </div>
                )}
              </div>

              {/* Card Meta & Action */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{tmpl.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tmpl.description}</p>
                  <div className="mt-2 text-[11px] text-slate-400 font-mono">
                    Recommended for: <span className="text-slate-600 font-sans">{tmpl.bestFor}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tmpl.id);
                    onBackToStudio();
                  }}
                  className={`w-full min-h-[44px] py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98] ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 border border-slate-300'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Applied to Active Bill</span>
                    </>
                  ) : (
                    <span>Apply This Template</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
