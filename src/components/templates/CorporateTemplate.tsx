import React from 'react';
import { Invoice } from '../../types/invoice';
import { calculateInvoiceTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currencies';

interface TemplateProps {
  invoice: Invoice;
}

export const CorporateTemplate: React.FC<TemplateProps> = ({ invoice }) => {
  const totals = calculateInvoiceTotals(invoice);
  const accent = invoice.accentColor || '#1e3a8a';

  return (
    <div className="w-full bg-white text-slate-800 p-8 sm:p-12 font-sans text-sm leading-normal">
      {/* Executive Header */}
      <div className="flex justify-between items-start pb-6 border-b-2" style={{ borderColor: accent }}>
        <div>
          {invoice.sender.logoUrl ? (
            <img 
              src={invoice.sender.logoUrl} 
              alt={invoice.sender.name} 
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full mb-2 shadow-xs"
            />
          ) : null}
          <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{invoice.sender.name || 'Company Name'}</h1>
          <div className="text-xs text-slate-600 mt-1">
            <div>{[invoice.sender.address, invoice.sender.city, invoice.sender.postalCode, invoice.sender.country].filter(Boolean).join(', ')}</div>
            <div>{invoice.sender.email} {invoice.sender.phone && `· ${invoice.sender.phone}`}</div>
            {invoice.sender.taxId && <div className="font-mono text-slate-500">Tax Reg / VAT: {invoice.sender.taxId}</div>}
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-black uppercase tracking-wider" style={{ color: accent }}>INVOICE</h2>
          <div className="mt-2 text-xs border border-slate-200 rounded divide-y divide-slate-200 inline-block text-left">
            <div className="flex justify-between gap-4 px-3 py-1 bg-slate-50">
              <span className="font-semibold text-slate-600">Invoice No:</span>
              <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber || 'INV-0001'}</span>
            </div>
            <div className="flex justify-between gap-4 px-3 py-1">
              <span className="font-semibold text-slate-600">Issue Date:</span>
              <span className="font-mono text-slate-800">{invoice.issueDate}</span>
            </div>
            <div className="flex justify-between gap-4 px-3 py-1 bg-slate-50">
              <span className="font-semibold text-slate-600">Due Date:</span>
              <span className="font-mono font-bold text-red-600">{invoice.dueDate}</span>
            </div>
            {invoice.poNumber && (
              <div className="flex justify-between gap-4 px-3 py-1">
                <span className="font-semibold text-slate-600">P.O. Ref:</span>
                <span className="font-mono text-slate-800">{invoice.poNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill To & Details Grid */}
      <div className="grid grid-cols-2 gap-6 my-6 p-4 bg-slate-50 border border-slate-200 rounded text-xs">
        <div>
          <div className="font-bold text-slate-700 uppercase tracking-wider mb-1.5" style={{ color: accent }}>Bill To:</div>
          <div className="text-sm font-bold text-slate-900">{invoice.client.name}</div>
          {invoice.client.contactPerson && <div className="text-slate-600 font-medium">Attn: {invoice.client.contactPerson}</div>}
          <div className="text-slate-600 mt-1">
            {[invoice.client.address, invoice.client.city, invoice.client.postalCode, invoice.client.country].filter(Boolean).join(', ')}
          </div>
          {invoice.client.email && <div className="text-slate-600 mt-0.5">{invoice.client.email}</div>}
          {invoice.client.taxId && <div className="text-slate-500 font-mono mt-0.5">Tax ID: {invoice.client.taxId}</div>}
        </div>

        <div>
          <div className="font-bold text-slate-700 uppercase tracking-wider mb-1.5" style={{ color: accent }}>Terms & Remittance:</div>
          <div className="space-y-1 text-slate-700">
            <div><span className="font-semibold">Payment Terms:</span> {invoice.paymentTerms}</div>
            <div><span className="font-semibold">Currency:</span> {invoice.currency.code} ({invoice.currency.name})</div>
            <div><span className="font-semibold">Invoice Status:</span> <span className="uppercase font-mono text-[11px] font-bold text-slate-800">{invoice.status}</span></div>
          </div>
        </div>
      </div>

      {/* Items Table with Corporate borders */}
      <div className="mb-6 overflow-hidden border border-slate-200 rounded">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-white" style={{ backgroundColor: accent }}>
              <th className="py-2.5 px-3 font-bold uppercase tracking-wider w-8">#</th>
              <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Item & Description</th>
              <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-right w-16">Qty</th>
              <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-right w-24">Rate</th>
              <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items.map((item, index) => {
              const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
              return (
                <tr key={item.id || index} className={index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                  <td className="py-3 px-3 font-mono text-slate-400 text-center">{index + 1}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.description}</div>
                    {item.details && <div className="text-slate-500 text-[11px] mt-0.5">{item.details}</div>}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Breakdown & Wire Information */}
      <div className="grid grid-cols-2 gap-6 text-xs">
        <div>
          <div className="p-3.5 border border-slate-200 rounded bg-slate-50/50 space-y-2">
            <div className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">Wire / Settlement Details</div>
            <div className="text-slate-600 text-[11px] space-y-0.5">
              <div>Bank: Commercial Bank & Trust</div>
              <div>Account Name: {invoice.sender.name}</div>
              <div>IBAN: GB29 NWBK 6016 1331 9268 19</div>
              <div>SWIFT / BIC: NWBKGB2L</div>
              <div>Reference: {invoice.invoiceNumber}</div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-3 text-[11px] text-slate-600">
              <span className="font-bold text-slate-700">Special Instructions: </span>
              {invoice.notes}
            </div>
          )}
        </div>

        <div className="space-y-1.5 border border-slate-200 rounded p-4 bg-slate-50/30">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono tabular-nums font-semibold">{formatCurrency(totals.subtotal, invoice.currency)}</span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Less Discount:</span>
              <span className="font-mono tabular-nums font-semibold">-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
            </div>
          )}

          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax ({invoice.taxRate}%):</span>
              <span className="font-mono tabular-nums font-semibold">{formatCurrency(totals.taxAmount, invoice.currency)}</span>
            </div>
          )}

          {totals.shippingFee > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Shipping / Logistics:</span>
              <span className="font-mono tabular-nums font-semibold">{formatCurrency(totals.shippingFee, invoice.currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black pt-3 border-t-2 border-slate-300" style={{ color: accent }}>
            <span>TOTAL AMOUNT DUE:</span>
            <span className="font-mono tabular-nums">{formatCurrency(totals.total, invoice.currency)}</span>
          </div>

          {invoice.showSignature && invoice.signatureName && (
            <div className="pt-4 mt-2 border-t border-slate-200 text-right">
              <div className="text-xs font-serif italic text-slate-800">{invoice.signatureName}</div>
              <div className="font-bold text-slate-900 text-xs">{invoice.signatureName}</div>
              <div className="text-[11px] text-slate-500">{invoice.signatureTitle || 'Authorized Representative'}</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 uppercase tracking-widest">
        Official Commercial Invoice · Generated with BillCraft
      </div>
    </div>
  );
};
