import React from 'react';
import { Invoice } from '../../types/invoice';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currencies';

interface TemplateProps {
  invoice: Invoice;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ invoice }) => {
  const totals = calculateInvoiceTotals(invoice);

  return (
    <div className="w-full bg-white text-slate-800 p-8 sm:p-14 font-sans text-xs leading-relaxed">
      {/* Editorial Header */}
      <div className="flex justify-between items-baseline pb-10 border-b border-slate-200">
        <div>
          {invoice.sender.logoUrl && (
            <img 
              src={invoice.sender.logoUrl} 
              alt={invoice.sender.name} 
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-full mb-2.5 shadow-xs"
            />
          )}
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">Invoice Document</span>
          <h1 className="text-xl font-medium tracking-tight text-slate-900 mt-0.5">{invoice.sender.name || 'Studio'}</h1>
          <p className="text-slate-500 text-[11px] mt-0.5">{invoice.sender.email} {invoice.sender.phone && `· ${invoice.sender.phone}`}</p>
        </div>

        <div className="text-right">
          <div className="font-mono text-lg font-medium text-slate-900">{invoice.invoiceNumber}</div>
          <div className="text-slate-500 text-[11px] mt-0.5">Issued: {invoice.issueDate} · Due: {invoice.dueDate}</div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-12 py-8 border-b border-slate-100">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1">To</span>
          <div className="font-medium text-slate-900 text-sm">{invoice.client.name}</div>
          {invoice.client.contactPerson && <div className="text-slate-600 text-xs mt-0.5">{invoice.client.contactPerson}</div>}
          <div className="text-slate-500 text-xs mt-1">
            {[invoice.client.address, invoice.client.city, invoice.client.postalCode, invoice.client.country].filter(Boolean).join(', ')}
          </div>
          {invoice.client.email && <div className="text-slate-500 text-xs mt-0.5">{invoice.client.email}</div>}
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1">From</span>
          <div className="text-slate-600 text-xs">
            <div>{[invoice.sender.address, invoice.sender.city, invoice.sender.postalCode].filter(Boolean).join(', ')}</div>
            <div>{invoice.sender.country}</div>
            {invoice.sender.taxId && <div className="font-mono text-slate-400 text-[10px] mt-1">Tax ID {invoice.sender.taxId}</div>}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="py-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] tracking-wider uppercase text-slate-400">
              <th className="pb-3 font-normal">Description</th>
              <th className="pb-3 text-right font-normal w-16">Qty</th>
              <th className="pb-3 text-right font-normal w-24">Price</th>
              <th className="pb-3 text-right font-normal w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {invoice.items.map((item, idx) => {
              const amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
              return (
                <tr key={item.id || idx}>
                  <td className="py-4 pr-4">
                    <div className="font-medium text-slate-900">{item.description}</div>
                    {item.details && <div className="text-slate-500 text-[11px] mt-0.5 leading-normal">{item.details}</div>}
                  </td>
                  <td className="py-4 text-right font-mono tabular-nums text-slate-600">{item.quantity}</td>
                  <td className="py-4 text-right font-mono tabular-nums text-slate-600">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-4 text-right font-mono tabular-nums font-medium text-slate-900">{formatCurrency(amount, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Minimal Totals */}
      <div className="flex justify-between items-start pt-6 border-t border-slate-200">
        <div className="max-w-xs text-[11px] text-slate-500 space-y-3">
          {invoice.notes && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">Notes</span>
              <p>{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">Terms</span>
              <p>{invoice.terms}</p>
            </div>
          )}
        </div>

        <div className="w-64 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{formatCurrency(totals.subtotal, invoice.currency)}</span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Discount</span>
              <span className="font-mono tabular-nums">-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
            </div>
          )}

          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Tax ({invoice.taxRate}%)</span>
              <span className="font-mono tabular-nums">{formatCurrency(totals.taxAmount, invoice.currency)}</span>
            </div>
          )}

          {totals.shippingFee > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span className="font-mono tabular-nums">{formatCurrency(totals.shippingFee, invoice.currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-semibold text-slate-900 pt-3 border-t border-slate-900">
            <span>Total</span>
            <span className="font-mono tabular-nums text-base">{formatCurrency(totals.total, invoice.currency)}</span>
          </div>

          {invoice.showSignature && invoice.signatureName && (
            <div className="pt-6 text-right">
              <div className="font-serif italic text-base text-slate-800">{invoice.signatureName}</div>
              <div className="text-[11px] font-medium text-slate-900 mt-1">{invoice.signatureName}</div>
              {invoice.signatureTitle && <div className="text-[10px] text-slate-400">{invoice.signatureTitle}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
