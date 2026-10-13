import React from 'react';
import { Invoice } from '../../types/invoice';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currencies';

interface TemplateProps {
  invoice: Invoice;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ invoice }) => {
  const totals = calculateInvoiceTotals(invoice);
  const accent = invoice.accentColor || '#0f172a';

  return (
    <div className="w-full bg-white text-slate-800 p-8 sm:p-12 font-sans text-sm leading-relaxed">
      {/* Top Accent Strip */}
      <div 
        className="h-2 w-full mb-8 rounded-full" 
        style={{ backgroundColor: accent }} 
      />

      {/* Header Block: Brand & Invoice Meta */}
      <div className="flex justify-between items-start gap-8 pb-8 border-b border-slate-100">
        <div>
          {invoice.sender.logoUrl ? (
            <img 
              src={invoice.sender.logoUrl} 
              alt={invoice.sender.name} 
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full mb-3 shadow-xs"
            />
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{invoice.sender.name || 'Your Company'}</h1>
          <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">
            {[invoice.sender.address, invoice.sender.city, invoice.sender.state, invoice.sender.postalCode, invoice.sender.country].filter(Boolean).join(', ')}
          </p>
          <div className="text-xs text-slate-500 mt-1 space-x-2">
            {invoice.sender.email && <span>{invoice.sender.email}</span>}
            {invoice.sender.phone && <span>· {invoice.sender.phone}</span>}
            {invoice.sender.taxId && <span>· Tax ID: {invoice.sender.taxId}</span>}
          </div>
        </div>

        <div className="text-right shrink-0">
          <span 
            className="text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded inline-block mb-2"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            Invoice
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{invoice.invoiceNumber || 'INV-0001'}</div>
          <div className="mt-2 text-xs text-slate-500 space-y-0.5 font-mono">
            <div><span className="text-slate-400 font-sans">Date:</span> {invoice.issueDate}</div>
            <div><span className="text-slate-400 font-sans">Due Date:</span> {invoice.dueDate}</div>
            {invoice.poNumber && <div><span className="text-slate-400 font-sans">PO Number:</span> {invoice.poNumber}</div>}
          </div>
        </div>
      </div>

      {/* Parties Block */}
      <div className="grid grid-cols-2 gap-8 py-8 border-b border-slate-100">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billed To</div>
          <div className="text-base font-semibold text-slate-900">{invoice.client.name || 'Client Name'}</div>
          {invoice.client.contactPerson && (
            <div className="text-xs text-slate-600 font-medium mt-0.5">Attn: {invoice.client.contactPerson}</div>
          )}
          <div className="text-xs text-slate-500 mt-1 whitespace-pre-line">
            {[invoice.client.address, invoice.client.city, invoice.client.state, invoice.client.postalCode, invoice.client.country].filter(Boolean).join(', ')}
          </div>
          {invoice.client.email && (
            <div className="text-xs text-slate-500 mt-1">{invoice.client.email}</div>
          )}
          {invoice.client.taxId && (
            <div className="text-xs text-slate-400 mt-0.5">Tax ID: {invoice.client.taxId}</div>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Terms</div>
          <div className="text-sm font-medium text-slate-800">{invoice.paymentTerms || 'Due on Receipt'}</div>
          <div className="text-xs text-slate-500 mt-2">
            Status:{' '}
            <span className="font-semibold capitalize text-slate-700">
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 w-1/2">Description</th>
              <th className="pb-3 text-right">Qty</th>
              <th className="pb-3 text-right">Unit Price</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, index) => {
              const lineAmount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
              return (
                <tr key={item.id || index} className="text-xs">
                  <td className="py-3.5 pr-4 align-top">
                    <div className="font-semibold text-slate-800 text-sm">{item.description || 'Service or Item'}</div>
                    {item.details && (
                      <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.details}</div>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono tabular-nums text-slate-700 align-top">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right font-mono tabular-nums text-slate-700 align-top">
                    {formatCurrency(item.unitPrice || 0, invoice.currency)}
                  </td>
                  <td className="py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900 align-top">
                    {formatCurrency(lineAmount, invoice.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 pb-8 border-t border-slate-100">
        <div className="text-xs text-slate-600 space-y-4">
          {invoice.notes && (
            <div>
              <div className="font-semibold text-slate-700 mb-1">Notes</div>
              <p className="whitespace-pre-line text-slate-500 leading-relaxed">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <div className="font-semibold text-slate-700 mb-1">Terms & Conditions</div>
              <p className="whitespace-pre-line text-slate-500 leading-relaxed text-[11px]">{invoice.terms}</p>
            </div>
          )}
        </div>

        <div className="sm:pl-8">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatCurrency(totals.subtotal, invoice.currency)}</span>
            </div>

            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>
                  Discount {invoice.discountType === 'percentage' ? `(${invoice.discountValue}%)` : ''}
                </span>
                <span className="font-mono tabular-nums">-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
              </div>
            )}

            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax {invoice.taxRate ? `(${invoice.taxRate}%)` : ''}</span>
                <span className="font-mono tabular-nums">{formatCurrency(totals.taxAmount, invoice.currency)}</span>
              </div>
            )}

            {totals.shippingFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Handling</span>
                <span className="font-mono tabular-nums">{formatCurrency(totals.shippingFee, invoice.currency)}</span>
              </div>
            )}

            <div 
              className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200 mt-2"
              style={{ color: accent }}
            >
              <span>Total Due</span>
              <span className="font-mono tabular-nums text-lg">{formatCurrency(totals.total, invoice.currency)}</span>
            </div>
          </div>

          {/* Digital Signature */}
          {invoice.showSignature && invoice.signatureName && (
            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-right">
              <div className="font-serif italic text-lg text-slate-800">{invoice.signatureName}</div>
              <div className="text-xs font-semibold text-slate-900 mt-0.5">{invoice.signatureName}</div>
              {invoice.signatureTitle && <div className="text-[11px] text-slate-500">{invoice.signatureTitle}</div>}
              {invoice.signatureDate && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{invoice.signatureDate}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
        <div>{invoice.sender.website || invoice.sender.email}</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  );
};
