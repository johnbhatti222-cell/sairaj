import React from 'react';
import { Download, Mail, Plus, Check } from 'lucide-react';
import { SAIRAJ_LOGO_DATA_URL } from '../assets/sairajLogoData';

interface HeaderProps {
  currentView: 'editor' | 'invoices' | 'templates' | 'clients';
  onViewChange: (view: 'editor' | 'invoices' | 'templates' | 'clients') => void;
  onDownloadPdf: () => void;
  onOpenSendEmail: () => void;
  onNewInvoice: () => void;
  isDownloadingPdf: boolean;
  invoiceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onDownloadPdf,
  onOpenSendEmail,
  onNewInvoice,
  isDownloadingPdf,
  invoiceCount,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 z-30 shrink-0 sticky top-0">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => onViewChange('editor')}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity flex items-center gap-2.5"
          >
            <img 
              src={SAIRAJ_LOGO_DATA_URL} 
              alt="Sairaj Glass & Aluminium Center" 
              className="w-8 h-8 rounded-full object-contain shadow-xs" 
            />
            <span className="hidden sm:inline">Sairaj Glass & Aluminium</span>
            <span className="sm:hidden">Sairaj Glass</span>
          </button>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            onClick={() => onViewChange('editor')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 ${
              currentView === 'editor' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            Invoice Studio
          </button>

          <button
            onClick={() => onViewChange('invoices')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 ${
              currentView === 'invoices' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            Invoices ({invoiceCount})
          </button>

          <button
            onClick={() => onViewChange('templates')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 ${
              currentView === 'templates' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            Template Gallery
          </button>

          <button
            onClick={() => onViewChange('clients')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 ${
              currentView === 'clients' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
            }`}
          >
            Client Directory
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster (with Send Email + Download PDF) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onNewInvoice}
            className="hidden md:inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>

          <button
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 touch-manipulation"
            aria-label="Download PDF bill"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">{isDownloadingPdf ? 'Rendering...' : 'Download PDF'}</span>
            <span className="sm:hidden">{isDownloadingPdf ? '...' : 'PDF'}</span>
          </button>

          <button
            onClick={onOpenSendEmail}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs touch-manipulation"
            aria-label="Send bill via email"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Send Email</span>
            <span className="sm:hidden">Send</span>
          </button>
        </div>
      </div>
    </header>
  );
};
