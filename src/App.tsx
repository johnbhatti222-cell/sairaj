/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Mail, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Plus, 
  CheckCircle,
  Eye,
  Edit3,
  SlidersHorizontal,
  Users,
  ShieldCheck,
  FileText,
  FileCheck
} from 'lucide-react';

import { Invoice, InvoiceStatus, TemplateType, ClientDetails } from './types/invoice';
import { SAMPLE_INVOICES, SAIRAJ_COMPANY_DETAILS } from './utils/sampleInvoices';
import { CURRENCIES, formatCurrency } from './utils/currencies';
import { downloadInvoicePdf } from './utils/pdfGenerator';
import { calculateInvoiceTotals } from './utils/calculations';

import { Header } from './components/Header';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { SendEmailModal } from './components/SendEmailModal';
import { InvoicesModal } from './components/InvoicesModal';
import { ClientDirectoryModal } from './components/ClientDirectoryModal';
import { TemplateGalleryView } from './components/TemplateGalleryView';

const STORAGE_KEY = 'billcraft_invoices_sairaj_v2';
const ACTIVE_ID_KEY = 'billcraft_active_invoice_id_v2';

export default function App() {
  // State: Invoices list
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load invoices from local storage:', e);
    }
    return SAMPLE_INVOICES;
  });

  // State: Active Invoice ID
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_ID_KEY);
      if (savedId) return savedId;
    } catch {}
    return SAMPLE_INVOICES[0]?.id || 'inv-sairaj-101';
  });

  // Navigation view: editor, invoices, templates, clients
  const [currentView, setCurrentView] = useState<'editor' | 'invoices' | 'templates' | 'clients'>('editor');

  // Mobile studio view switch: 'edit' or 'preview'
  const [mobileStudioTab, setMobileStudioTab] = useState<'edit' | 'preview'>('edit');

  // Preview zoom level
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);

  // Email modal state
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);

  // PDF downloading flag
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ref to the rendered invoice element in preview
  const invoiceCaptureRef = useRef<HTMLDivElement>(null);
  // Dedicated permanent offscreen capture ref (always mounted, unscaled, positive dimensions)
  const offscreenPdfRef = useRef<HTMLDivElement>(null);

  // Get currently active invoice
  const activeInvoice = invoices.find((inv) => inv.id === activeInvoiceId) || invoices[0] || SAMPLE_INVOICES[0];
  const totals = calculateInvoiceTotals(activeInvoice);

  // Responsive zoom calculation on resize to perfectly fit mobile & tablet screens
  useEffect(() => {
    const updateZoomForViewport = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile phones (360px - 430px): scale down A4 (794px) to fit width minus padding
        const targetWidth = Math.max(300, width - 24);
        const autoZoom = Math.round((targetWidth / 794) * 100) / 100;
        setZoomLevel(Math.max(0.42, Math.min(0.65, autoZoom)));
      } else if (width < 1024) {
        // Tablets
        const targetWidth = Math.max(480, width - 48);
        const autoZoom = Math.round((targetWidth / 794) * 100) / 100;
        setZoomLevel(Math.max(0.65, Math.min(0.85, autoZoom)));
      } else {
        // Desktop
        setZoomLevel(0.95);
      }
    };

    updateZoomForViewport();
    window.addEventListener('resize', updateZoomForViewport);
    return () => window.removeEventListener('resize', updateZoomForViewport);
  }, []);

  // Save to localStorage when invoices change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.error('Could not persist invoices:', e);
    }
  }, [invoices]);

  // Save active ID
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_ID_KEY, activeInvoiceId);
    } catch {}
  }, [activeInvoiceId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update active invoice
  const handleUpdateInvoice = (updated: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updated.id ? updated : inv))
    );
  };

  // Create brand new invoice
  const handleNewInvoice = () => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const newId = `inv-${Date.now()}`;
    const newInvoiceNumber = `SGA-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;

    const newInv: Invoice = {
      id: newId,
      invoiceNumber: newInvoiceNumber,
      status: 'draft',
      issueDate: today,
      dueDate: dueDate,
      paymentTerms: 'Due on Receipt',
      currency: CURRENCIES[0], // Indian Rupee (₹)
      sender: {
        ...SAIRAJ_COMPANY_DETAILS,
      },
      client: {
        id: `client-${Date.now()}`,
        name: 'New Client Customer',
        contactPerson: 'Client Contact',
        email: 'customer@gmail.com',
        phone: '9800000000',
        address: 'Medha',
        city: 'Medha',
        state: 'Maharashtra',
        postalCode: '415012',
        country: 'India',
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: '3-Track Aluminium Sliding Window (12mm Jindal Section)',
          details: 'Powder coated section with 5mm tinted glass and stainless steel mesh (Sq.Ft measurement)',
          quantity: 45,
          unitPrice: 420,
          taxRate: 0,
        },
      ],
      taxRate: 0, // No tax as requested
      discountType: 'percentage',
      discountValue: 0,
      shippingFee: 0,
      notes: 'Quality, Trust, Perfection. Thank you for your business with Sairaj Glass & Aluminium Center!',
      terms: 'Payment due on receipt or completion of fitting. Contact 8390357118 for billing inquiries.',
      template: 'modern',
      accentColor: '#B8861B',
      showSignature: true,
      signatureName: 'Sairaj Glass Center',
      signatureTitle: 'Proprietor',
      signatureDate: today,
      emailHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInv, ...prev]);
    setActiveInvoiceId(newId);
    setCurrentView('editor');
    setMobileStudioTab('edit');
    showToast(`Created new invoice ${newInvoiceNumber}`);
  };

  // Duplicate an existing invoice
  const handleDuplicateInvoice = (target: Invoice) => {
    const newId = `inv-${Date.now()}`;
    const newNumber = `${target.invoiceNumber}-COPY`;
    const duplicated: Invoice = {
      ...target,
      id: newId,
      invoiceNumber: newNumber,
      status: 'draft',
      emailHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices((prev) => [duplicated, ...prev]);
    setActiveInvoiceId(newId);
    setCurrentView('editor');
    showToast(`Duplicated as ${newNumber}`);
  };

  // Delete invoice
  const handleDeleteInvoice = (id: string) => {
    if (invoices.length <= 1) {
      alert('You must have at least one invoice.');
      return;
    }
    if (confirm('Are you sure you want to delete this invoice?')) {
      const remaining = invoices.filter((i) => i.id !== id);
      setInvoices(remaining);
      if (activeInvoiceId === id) {
        setActiveInvoiceId(remaining[0].id);
      }
      showToast('Invoice removed from ledger');
    }
  };

  // Status changer
  const handleUpdateInvoiceStatus = (invoiceId: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status, updatedAt: new Date().toISOString() } : i))
    );
    showToast(`Status updated to ${status.toUpperCase()}`);
  };

  // Draft invoice for a client selected from directory
  const handleDraftInvoiceForClient = (client: ClientDetails) => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const newId = `inv-${Date.now()}`;
    const newInvoiceNumber = `SGA-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;

    const newInv: Invoice = {
      ...activeInvoice,
      id: newId,
      invoiceNumber: newInvoiceNumber,
      status: 'draft',
      issueDate: today,
      dueDate: dueDate,
      client: { ...client },
      emailHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInv, ...prev]);
    setActiveInvoiceId(newId);
    setCurrentView('editor');
    setMobileStudioTab('edit');
    showToast(`Started new bill for ${client.name}`);
  };

  // Update client details across invoices
  const handleUpdateClientInInvoices = (updatedClient: ClientDetails) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.client.name.toLowerCase() === updatedClient.name.toLowerCase()) {
          return {
            ...inv,
            client: { ...inv.client, ...updatedClient },
          };
        }
        return inv;
      })
    );
    showToast(`Updated contact details for ${updatedClient.name}`);
  };

  // Direct PDF Download Handler
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const filename = `${activeInvoice.invoiceNumber || 'Invoice'}.pdf`;
      // Prioritize the dedicated offscreen unscaled container for 100% reliable capture
      const targetElement = offscreenPdfRef.current || invoiceCaptureRef.current;
      await downloadInvoicePdf(targetElement, filename);
      showToast(`Downloaded ${filename} successfully!`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Automatic fallback to browser print dialog
      if (confirm('PDF download encountered a browser rendering issue. Would you like to use Print to PDF instead?')) {
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Print via standard browser dialog
  const handlePrint = () => {
    window.print();
  };

  // Reset to default sample invoices
  const handleResetPresets = () => {
    if (confirm('Reset invoice list to default Sairaj Glass & Aluminium templates?')) {
      setInvoices(SAMPLE_INVOICES);
      setActiveInvoiceId(SAMPLE_INVOICES[0].id);
      showToast('Loaded Sairaj invoice collection');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-16 lg:pb-0">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onDownloadPdf={handleDownloadPdf}
        onOpenSendEmail={() => setIsSendEmailOpen(true)}
        onNewInvoice={handleNewInvoice}
        isDownloadingPdf={isDownloadingPdf}
        invoiceCount={invoices.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* VIEW 1: INVOICE STUDIO */}
        {currentView === 'editor' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Studio Segmented Tab Bar (Edit Details vs Live Document Preview) */}
            <div className="no-print lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => setMobileStudioTab('edit')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 touch-manipulation ${
                    mobileStudioTab === 'edit'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileStudioTab('preview')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 touch-manipulation ${
                    mobileStudioTab === 'preview'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Bill</span>
                </button>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block font-mono">Total:</span>
                <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                  {formatCurrency(totals.total, activeInvoice.currency)}
                </span>
              </div>
            </div>

            {/* Studio Workspace Container */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Form Editor (Full height on mobile when 'edit' is active, 480px on desktop) */}
              <div
                className={`w-full lg:w-[480px] xl:w-[540px] shrink-0 overflow-hidden flex flex-col ${
                  mobileStudioTab === 'preview' ? 'hidden lg:flex' : 'flex'
                } h-[calc(100vh-120px)] lg:h-[calc(100vh-61px)]`}
              >
                <InvoiceEditor
                  invoice={activeInvoice}
                  onChange={handleUpdateInvoice}
                />

                {/* Mobile Thumb-Friendly Quick Action Bottom Bar in Editor Mode */}
                <div className="no-print lg:hidden p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileStudioTab('preview')}
                    className="flex-1 min-h-[44px] py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                    <span>Preview Bill</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="flex-1 min-h-[44px] py-2.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98] disabled:opacity-50 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloadingPdf ? 'Rendering...' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Live A4 PDF Preview (Full height on mobile when 'preview' is active, remaining viewport on desktop) */}
              <div
                className={`flex-1 flex flex-col bg-slate-200/80 overflow-hidden ${
                  mobileStudioTab === 'edit' ? 'hidden lg:flex' : 'flex'
                } h-[calc(100vh-120px)] lg:h-[calc(100vh-61px)]`}
              >
                {/* Preview Controls Bar */}
                <div className="no-print bg-white/95 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      Live Preview
                    </span>
                    <span className="text-slate-400 text-xs hidden sm:inline">·</span>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      A4 Ready
                    </span>
                  </div>

                  {/* Zoom & Action Controls */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-slate-600">
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(0.4, Math.round((z - 0.05) * 100) / 100))}
                        className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:text-slate-900 rounded touch-manipulation"
                        title="Zoom Out"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-1.5 text-[11px] font-mono tabular-nums">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(1.3, Math.round((z + 0.05) * 100) / 100))}
                        className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:text-slate-900 rounded touch-manipulation"
                        title="Zoom In"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={handlePrint}
                      className="hidden sm:inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-white transition-colors"
                      title="Print Document"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print</span>
                    </button>

                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf}
                      className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50 touch-manipulation"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingPdf ? 'PDF...' : 'Download PDF'}</span>
                    </button>
                  </div>
                </div>

                {/* Scrollable Paper Canvas */}
                <div className="flex-1 overflow-auto p-2 sm:p-6 flex justify-center items-start overscroll-contain">
                  <InvoicePreview
                    ref={invoiceCaptureRef}
                    invoice={activeInvoice}
                    zoom={zoomLevel}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: INVOICES LEDGER */}
        {currentView === 'invoices' && (
          <div className="flex-1 overflow-y-auto">
            <InvoicesModal
              invoices={invoices}
              activeInvoiceId={activeInvoiceId}
              onSelectInvoice={(inv) => {
                setActiveInvoiceId(inv.id);
                setCurrentView('editor');
                setMobileStudioTab('edit');
              }}
              onNewInvoice={handleNewInvoice}
              onDuplicateInvoice={handleDuplicateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onDownloadPdfForInvoice={(inv) => {
                setActiveInvoiceId(inv.id);
                setCurrentView('editor');
                setTimeout(() => handleDownloadPdf(), 200);
              }}
              onSendEmailForInvoice={(inv) => {
                setActiveInvoiceId(inv.id);
                setIsSendEmailOpen(true);
              }}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            />
          </div>
        )}

        {/* VIEW 3: TEMPLATE GALLERY */}
        {currentView === 'templates' && (
          <div className="flex-1 overflow-y-auto">
            <TemplateGalleryView
              invoice={activeInvoice}
              onSelectTemplate={(tmpl) => {
                handleUpdateInvoice({ ...activeInvoice, template: tmpl });
                showToast(`Applied ${tmpl.toUpperCase()} template`);
              }}
              onBackToStudio={() => setCurrentView('editor')}
            />
          </div>
        )}

        {/* VIEW 4: CLIENT DIRECTORY */}
        {currentView === 'clients' && (
          <div className="flex-1 overflow-y-auto">
            <ClientDirectoryModal
              invoices={invoices}
              onDraftInvoiceForClient={handleDraftInvoiceForClient}
              onUpdateClientInInvoices={handleUpdateClientInInvoices}
            />
          </div>
        )}
      </main>

      {/* Desktop Status Bar */}
      {currentView === 'editor' && (
        <aside className="no-print hidden lg:flex bg-white border-t border-slate-200 px-6 py-2 items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-700 font-semibold">{activeInvoice.invoiceNumber}</span>
            <span>·</span>
            <span className="capitalize">{activeInvoice.template} Template</span>
            <span>·</span>
            <span>Status: <strong className="uppercase font-mono text-slate-800">{activeInvoice.status}</strong></span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetPresets}
              className="text-slate-400 hover:text-slate-700 text-[11px] underline"
            >
              Reset Samples
            </button>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Autosaved locally</span>
            </div>
          </div>
        </aside>
      )}

      {/* Fixed Mobile Bottom Navigation Bar (Thumb Zone) */}
      <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe">
        <div className="grid grid-cols-4 items-center h-14">
          <button
            type="button"
            onClick={() => setCurrentView('editor')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors touch-manipulation ${
              currentView === 'editor' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('invoices')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors touch-manipulation ${
              currentView === 'invoices' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Invoices ({invoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('templates')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors touch-manipulation ${
              currentView === 'templates' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('clients')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors touch-manipulation ${
              currentView === 'clients' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Clients</span>
          </button>
        </div>
      </nav>

      {/* Modal: Send Invoice via Email */}
      <SendEmailModal
        invoice={activeInvoice}
        previewElement={offscreenPdfRef.current || invoiceCaptureRef.current}
        isOpen={isSendEmailOpen}
        onClose={() => setIsSendEmailOpen(false)}
        onInvoiceSent={(updated) => {
          handleUpdateInvoice(updated);
          showToast(`Invoice dispatched to ${updated.client.email}`);
        }}
      />

      {/* Permanent Offscreen PDF Capture Host (Always mounted, unscaled 794px, 100% reliable) */}
      <div
        id="permanent-pdf-render-host"
        aria-hidden="true"
        className="no-print"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          minHeight: '1080px',
          backgroundColor: '#ffffff',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: -9999,
        }}
      >
        <div
          ref={offscreenPdfRef}
          id="offscreen-invoice-capture"
          className="bg-white w-[794px] min-h-[1080px] text-slate-800"
          style={{ transform: 'none' }}
        >
          <InvoicePreview
            invoice={activeInvoice}
            zoom={1}
          />
        </div>
      </div>

      {/* Subtle Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-18 lg:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
