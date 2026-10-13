import React from 'react';
import { Invoice } from '../../types/invoice';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currencies';

interface TemplateProps {
  invoice: Invoice;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ invoice }) => {
  const totals = calculateInvoiceTotals(invoice);

  return (
    <div className="w-full bg-white text-slate-900 p-8 sm:p-12 font-serif text-xs leading-normal">
      {/* Classic Top Header */}
      <div className="text-center pb-8 border-b-2 border-slate-900">
        {invoice.sender.logoUrl && (
          <div className="flex justify-center mb-3">
            <img 
              src={invoice.sender.logoUrl} 
              alt={invoice.sender.name} 
              className="h-20 w-20 rounded-full object-contain shadow-xs"
            />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight uppercase font-sans text-slate-900">
          {invoice.sender.name || 'Commercial Enterprise'}
        </h1>
        <p className="text-slate-600 font-sans text-xs mt-1">
          {[invoice.sender.address, invoice.sender.city, invoice.sender.state, invoice.sender.postalCode, invoice.sender.country].filter(Boolean).join(', ')}
        </p>
        <div className="text-slate-500 font-sans text-xs mt-0.5 space-x-2">
          {invoice.sender.email && <span>{invoice.sender.email}</span>}
          {invoice.sender.phone && <span>· {invoice.sender.phone}</span>}
          {invoice.sender.taxId && <span>· Tax ID: {invoice.sender.taxId}</span>}
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-300 font-sans">
        <div>
          <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1">Customer / Recipient</div>
          <div className="text-sm font-bold text-slate-900">{invoice.client.name}</div>
          {invoice.client.contactPerson && <div className="text-xs text-slate-600">Attn: {invoice.client.contactPerson}</div>}
          <div className="text-xs text-slate-600 mt-1">
            {[invoice.client.address, invoice.client.city, invoice.client.postalCode, invoice.client.country].filter(Boolean).join(', ')}
          </div>
          {invoice.client.email && <div className="text-xs text-slate-600">{invoice.client.email}</div>}
        </div>

        <div className="text-right text-xs space-y-1">
          <div className="text-xl font-bold text-slate-900 font-mono">INVOICE #{invoice.invoiceNumber}</div>
          <div><span className="text-slate-500">Invoice Date:</span> <span className="font-mono">{invoice.issueDate}</span></div>
          <div><span className="text-slate-500">Due Date:</span> <span className="font-mono font-bold">{invoice.dueDate}</span></div>
          <div><span className="text-slate-500">Payment Terms:</span> {invoice.paymentTerms}</div>
          {invoice.poNumber && <div><span className="text-slate-500">Purchase Order:</span> <span className="font-mono">{invoice.poNumber}</span></div>}
        </div>
      </div>

      {/* Table */}
      <div className="py-6 font-sans">
        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
              <th className="py-2.5 px-3 border-r border-slate-300">Item Description</th>
              <th className="py-2.5 px-3 border-r border-slate-300 text-right w-16">Quantity</th>
              <th className="py-2.5 px-3 border-r border-slate-300 text-right w-24">Unit Rate</th>
              <th className="py-2.5 px-3 text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {invoice.items.map((item, idx) => {
              const amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
              return (
                <tr key={item.id || idx}>
                  <td className="py-3 px-3 border-r border-slate-300">
                    <div className="font-semibold text-slate-900">{item.description}</div>
                    {item.details && <div className="text-slate-500 text-[11px] mt-0.5">{item.details}</div>}
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="py-3 px-3 border-r border-slate-300 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">{formatCurrency(amount, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Terms */}
      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 font-sans text-xs">
        <div className="space-y-3">
          {invoice.notes && (
            <div>
              <div className="font-bold text-slate-800">Notice to Customer:</div>
              <p className="text-slate-600 text-[11px] mt-0.5">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <div className="font-bold text-slate-800">Payment Terms:</div>
              <p className="text-slate-600 text-[11px] mt-0.5">{invoice.terms}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
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
              <span>Shipping Fee:</span>
              <span className="font-mono tabular-nums">{formatCurrency(totals.shippingFee, invoice.currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t-2 border-slate-900">
            <span>Total Payable:</span>
            <span className="font-mono tabular-nums text-lg">{formatCurrency(totals.total, invoice.currency)}</span>
          </div>

          {invoice.showSignature && invoice.signatureName && (
            <div className="pt-6 text-right">
              <div className="font-serif italic text-base text-slate-900">{invoice.signatureName}</div>
              <div className="font-bold text-xs mt-0.5">{invoice.signatureName}</div>
              {invoice.signatureTitle && <div className="text-[11px] text-slate-500">{invoice.signatureTitle}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
