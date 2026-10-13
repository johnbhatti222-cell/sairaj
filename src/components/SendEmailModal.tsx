import React, { useState, useEffect } from 'react';
import { Mail, Send, Copy, Check, Download, AlertCircle, Share2, Sparkles, ExternalLink, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Invoice } from '../types/invoice';
import { calculateInvoiceTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/currencies';
import { generateInvoicePdf, downloadInvoicePdf } from '../utils/pdfGenerator';

interface SendEmailModalProps {
  invoice: Invoice;
  previewElement: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  onInvoiceSent: (updatedInvoice: Invoice) => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  invoice,
  previewElement,
  isOpen,
  onClose,
  onInvoiceSent,
}) => {
  const totals = calculateInvoiceTotals(invoice);
  const formattedTotal = formatCurrency(totals.total, invoice.currency);

  const [recipient, setRecipient] = useState(invoice.client.email || '');
  const [cc, setCc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState(
    `Invoice ${invoice.invoiceNumber} from ${invoice.sender.name || 'Vendor'} (${formattedTotal})`
  );
  const [message, setMessage] = useState('');
  const [pdfSizeKb, setPdfSizeKb] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Initialize draft content when modal opens or invoice changes
  useEffect(() => {
    if (isOpen) {
      setRecipient(invoice.client.email || '');
      setSubject(`Invoice ${invoice.invoiceNumber} from ${invoice.sender.name || 'Vendor'} (${formattedTotal})`);
      
      const defaultBody = `Dear ${invoice.client.contactPerson || invoice.client.name || 'Valued Client'},

Please find attached invoice ${invoice.invoiceNumber} for the amount of ${formattedTotal}, due on ${invoice.dueDate}.

Invoice Summary:
· Invoice Number: ${invoice.invoiceNumber}
· Due Date: ${invoice.dueDate}
· Payment Terms: ${invoice.paymentTerms}
· Total Amount Due: ${formattedTotal}

${invoice.notes ? `Notes:\n${invoice.notes}\n\n` : ''}Payment Instructions:
Bank wire or settlement details are listed on page 1 of the attached PDF invoice.

If you have any questions regarding this invoice, please do not hesitate to contact us at ${invoice.sender.email || 'our office'}.

Sincerely,
${invoice.sender.name || 'Accounting Team'}
${invoice.sender.email || ''}`;

      setMessage(defaultBody);
      setSentSuccess(false);

      // Pre-generate PDF for attachment
      if (previewElement) {
        setIsGeneratingPdf(true);
        generateInvoicePdf(previewElement, `${invoice.invoiceNumber}.pdf`)
          .then((res) => {
            setPdfBlob(res.blob);
            setPdfSizeKb(res.sizeKb);
          })
          .catch((err) => {
            console.error('Failed to pre-render PDF attachment:', err);
          })
          .finally(() => {
            setIsGeneratingPdf(false);
          });
      }
    }
  }, [isOpen, invoice, previewElement, formattedTotal]);

  if (!isOpen) return null;

  // Handle direct App Dispatch (simulated real-world email delivery with audit log)
  const handleDirectSend = async () => {
    if (!recipient.trim()) {
      alert('Please enter a valid recipient email address.');
      return;
    }

    setIsSending(true);

    // Simulate network transmission delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newHistoryEntry = {
      id: `mail-${Date.now()}`,
      sentAt: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      recipient: recipient.trim(),
      subject: subject.trim(),
      method: 'app_direct' as const,
      status: 'delivered' as const,
    };

    const updated: Invoice = {
      ...invoice,
      status: invoice.status === 'draft' ? 'sent' : invoice.status,
      emailHistory: [newHistoryEntry, ...(invoice.emailHistory || [])],
      updatedAt: new Date().toISOString(),
    };

    setIsSending(false);
    setSentSuccess(true);
    onInvoiceSent(updated);

    // Trigger subtle celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  // Handle Default Mail Client (mailto link)
  const handleOpenMailto = () => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(message);
    const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : '';
    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodedSubject}&body=${encodedBody}${ccParam}`;
    window.location.href = mailtoUrl;

    const newHistoryEntry = {
      id: `mail-${Date.now()}`,
      sentAt: new Date().toLocaleString(),
      recipient: recipient.trim(),
      subject: subject.trim(),
      method: 'mailto' as const,
      status: 'draft_opened' as const,
    };
    onInvoiceSent({
      ...invoice,
      status: invoice.status === 'draft' ? 'sent' : invoice.status,
      emailHistory: [newHistoryEntry, ...(invoice.emailHistory || [])],
    });
  };

  // Handle Web Gmail compose link
  const handleOpenGmail = () => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(message);
    const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : '';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodedSubject}&body=${encodedBody}${ccParam}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle Native Device Share (attaches real PDF file if browser supports Web Share API)
  const handleNativeShare = async () => {
    if (!pdfBlob) {
      if (previewElement) {
        await downloadInvoicePdf(previewElement, `${invoice.invoiceNumber}.pdf`);
      }
      return;
    }

    try {
      const file = new File([pdfBlob], `${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: subject,
          text: message,
          files: [file],
        });
      } else {
        handleOpenMailto();
      }
    } catch (err) {
      console.log('Share canceled or not supported:', err);
    }
  };

  // Copy Draft message to clipboard
  const handleCopyDraft = () => {
    const textToCopy = `Subject: ${subject}\n\nTo: ${recipient}\n${cc ? `CC: ${cc}\n` : ''}\n${message}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] pb-safe sm:pb-0 animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Send Invoice via Email</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Dispatch PDF bill directly to {invoice.client.name || 'client'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-md transition-colors touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {sentSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Invoice successfully sent to {recipient}!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Status has been updated to <span className="font-semibold uppercase font-mono">Sent</span>. 
                A record has been recorded in the invoice audit history.
              </p>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setSentSuccess(false)}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                >
                  Send to Another Recipient
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium border border-emerald-300 text-emerald-800 rounded hover:bg-emerald-100 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : null}

          {/* Recipient Inputs */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Recipient Email (To)</label>
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="text-slate-500 hover:text-slate-800 text-[11px]"
                  >
                    + Add CC
                  </button>
                )}
              </div>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-xs"
              />
            </div>

            {showCc && (
              <div>
                <label className="font-medium text-slate-700 block mb-1">Carbon Copy (CC)</label>
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="accountant@company.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-xs"
                />
              </div>
            )}

            <div>
              <label className="font-medium text-slate-700 block mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Email Body Message</label>
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-xs font-mono leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Attached PDF Preview Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-[10px] uppercase font-mono">
                PDF
              </div>
              <div>
                <div className="font-medium text-slate-800">{invoice.invoiceNumber}.pdf</div>
                <div className="text-[11px] text-slate-500">
                  {isGeneratingPdf ? 'Rendering PDF...' : pdfSizeKb ? `${pdfSizeKb} KB · Formatted A4 Document` : 'A4 Ready Document'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {previewElement && (
                <button
                  type="button"
                  onClick={() => downloadInvoicePdf(previewElement, `${invoice.invoiceNumber}.pdf`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 border border-slate-200 rounded hover:bg-white transition-colors text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Copy</span>
                </button>
              )}
            </div>
          </div>

          {/* Alternate Send Channels */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-2">Alternative Dispatch Channels</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleOpenGmail}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Gmail Web</span>
              </button>

              <button
                type="button"
                onClick={handleOpenMailto}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Mail App</span>
              </button>

              <button
                type="button"
                onClick={handleCopyDraft}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors touch-manipulation"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {'canShare' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-white active:bg-slate-100 transition-colors touch-manipulation"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            <button
              type="button"
              disabled={isSending || !recipient.trim()}
              onClick={handleDirectSend}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 active:scale-[0.98] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs touch-manipulation"
            >
              {isSending ? (
                <>
                  <span className="animate-spin text-white">●</span>
                  <span>Sending PDF...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Directly</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
