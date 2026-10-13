import React from 'react';
import { Invoice } from '../../types/invoice';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currencies';

interface TemplateProps {
  invoice: Invoice;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ invoice }) => {
  const totals = calculateInvoiceTotals(invoice);
  const accent = invoice.accentColor || '#7c3aed';

  return (
    <div className="w-full bg-white text-slate-800 font-sans text-xs">
      {/* Creative Banner Header */}
      <div className="p-8 sm:p-12 text-white" style={{ backgroundColor: accent }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {invoice.sender.logoUrl && (
              <img 
                src={invoice.sender.logoUrl} 
                alt={invoice.sender.name} 
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-white/60 shadow-md object-contain bg-black/40 shrink-0"
              />
            )}
            <div>
              <div className="text-xs uppercase tracking-widest text-white/80 font-semibold">Glass & Aluminium Works</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">{invoice.sender.name || 'Studio'}</h1>
              <p className="text-white/80 text-xs mt-1">
                {[invoice.sender.address, invoice.sender.city, invoice.sender.postalCode].filter(Boolean).join(', ')} · {invoice.sender.phone} · {invoice.sender.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-mono font-black tracking-tight">{invoice.invoiceNumber}</div>
            <div className="text-xs text-white/90 mt-1 font-mono">Issued {invoice.issueDate}</div>
            <div className="text-xs text-white/80 font-mono">Due {invoice.dueDate}</div>
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-12">
        {/* Client & Metadata Bar */}
        <div className="grid grid-cols-2 gap-8 pb-8 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Project Client</div>
            <div className="text-base font-bold text-slate-900">{invoice.client.name}</div>
            {invoice.client.contactPerson && (
              <div className="text-xs text-slate-600 font-medium">Contact: {invoice.client.contactPerson}</div>
            )}
            <div className="text-xs text-slate-500 mt-1">
              {[invoice.client.address, invoice.client.city, invoice.client.postalCode, invoice.client.country].filter(Boolean).join(', ')}
            </div>
            {invoice.client.email && <div className="text-xs text-slate-500 mt-0.5">{invoice.client.email}</div>}
          </div>

          <div className="text-right flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Terms</div>
              <div className="text-sm font-semibold text-slate-800">{invoice.paymentTerms}</div>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Status: <span className="font-bold text-slate-900 uppercase">{invoice.status}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-900 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <th className="pb-3">Deliverable / Scope</th>
                <th className="pb-3 text-right w-16">Qty</th>
                <th className="pb-3 text-right w-24">Rate</th>
                <th className="pb-3 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <tr key={item.id || idx}>
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-900 text-sm">{item.description}</div>
                      {item.details && <div className="text-slate-500 text-xs mt-0.5">{item.details}</div>}
                    </td>
                    <td className="py-3.5 text-right font-mono tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3.5 text-right font-mono tabular-nums text-slate-700">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3.5 text-right font-mono tabular-nums font-bold text-slate-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Footer */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-600 space-y-3">
            {invoice.notes && (
              <div>
                <div className="font-bold text-slate-900">Project Notes</div>
                <p className="text-slate-500 mt-0.5">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <div className="font-bold text-slate-900">Payment Agreement</div>
                <p className="text-slate-500 mt-0.5 text-[11px]">{invoice.terms}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">{formatCurrency(totals.subtotal, invoice.currency)}</span>
            </div>

            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="font-mono tabular-nums">-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
              </div>
            )}

            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax ({invoice.taxRate}%):</span>
                <span className="font-mono tabular-nums">{formatCurrency(totals.taxAmount, invoice.currency)}</span>
              </div>
            )}

            {totals.shippingFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping:</span>
                <span className="font-mono tabular-nums">{formatCurrency(totals.shippingFee, invoice.currency)}</span>
              </div>
            )}

            <div 
              className="flex justify-between text-base font-black pt-3 border-t-2 border-slate-900"
              style={{ color: accent }}
            >
              <span>TOTAL DUE:</span>
              <span className="font-mono tabular-nums text-xl">{formatCurrency(totals.total, invoice.currency)}</span>
            </div>

            {invoice.showSignature && invoice.signatureName && (
              <div className="pt-6 text-right">
                <div className="font-serif italic text-lg" style={{ color: accent }}>{invoice.signatureName}</div>
                <div className="font-bold text-slate-900 text-xs">{invoice.signatureName}</div>
                {invoice.signatureTitle && <div className="text-[11px] text-slate-500">{invoice.signatureTitle}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
