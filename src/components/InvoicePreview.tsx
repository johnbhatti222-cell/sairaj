import React, { forwardRef } from 'react';
import { Invoice } from '../types/invoice';
import { ModernTemplate } from './templates/ModernTemplate';
import { CorporateTemplate } from './templates/CorporateTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';

interface InvoicePreviewProps {
  invoice: Invoice;
  zoom?: number; // scale e.g. 1.0, 0.5, 0.85
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice, zoom = 1 }, ref) => {
    const renderTemplate = () => {
      switch (invoice.template) {
        case 'corporate':
          return <CorporateTemplate invoice={invoice} />;
        case 'minimal':
          return <MinimalTemplate invoice={invoice} />;
        case 'creative':
          return <CreativeTemplate invoice={invoice} />;
        case 'classic':
          return <ClassicTemplate invoice={invoice} />;
        case 'modern':
        default:
          return <ModernTemplate invoice={invoice} />;
      }
    };

    const paperWidth = 794;
    const paperMinHeight = 1080;
    const scaledWidth = Math.round(paperWidth * zoom);
    const scaledHeight = Math.round(paperMinHeight * zoom);

    return (
      <div 
        className="w-full flex justify-center items-start overflow-x-auto overflow-y-auto p-2 sm:p-6 md:p-8"
      >
        {/* Scaled viewport footprint container so mobile layout never clips or overflows */}
        <div
          style={{
            width: `${scaledWidth}px`,
            minHeight: `${scaledHeight}px`,
          }}
          className="relative shrink-0 transition-all duration-150"
        >
          {/* Target A4 element captured by html2canvas at native unscaled dimension */}
          <div
            ref={ref}
            id="invoice-capture-container"
            className="invoice-paper bg-white w-[794px] min-h-[1080px] shadow-sm border border-slate-200 text-slate-800"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
