import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Copy, 
  Trash2, 
  Download, 
  Mail, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { calculateInvoiceTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/currencies';

interface InvoicesModalProps {
  invoices: Invoice[];
  activeInvoiceId: string;
  onSelectInvoice: (invoice: Invoice) => void;
  onNewInvoice: () => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onDownloadPdfForInvoice: (invoice: Invoice) => void;
  onSendEmailForInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

export const InvoicesModal: React.FC<InvoicesModalProps> = ({
  invoices,
  activeInvoiceId,
  onSelectInvoice,
  onNewInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onDownloadPdfForInvoice,
  onSendEmailForInvoice,
  onUpdateInvoiceStatus,
}) => {
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const defaultCurrency = invoices[0]?.currency || { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' };

  // Calculate high-level financial overview
  const totalBilled = invoices.reduce((acc, inv) => acc + calculateInvoiceTotals(inv).total, 0);
  const paidBilled = invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, inv) => acc + calculateInvoiceTotals(inv).total, 0);
  const outstandingBilled = invoices
    .filter((i) => i.status === 'sent' || i.status === 'draft')
    .reduce((acc, inv) => acc + calculateInvoiceTotals(inv).total, 0);
  const overdueBilled = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((acc, inv) => acc + calculateInvoiceTotals(inv).total, 0);

  // Filtered list
  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filter === 'all' || inv.status === filter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.client.name.toLowerCase().includes(query) ||
      (inv.client.email && inv.client.email.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Editorial Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Invoice Ledger & History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage drafts, monitor dispatched invoices, and track settlement statuses.
          </p>
        </div>

        <button
          onClick={onNewInvoice}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 active:scale-[0.98] transition-colors shadow-xs touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* KPI Overview Strip (Single elevation, zero pills, tabular-nums) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Total Invoiced</div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatCurrency(totalBilled, defaultCurrency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{invoices.length} total records</div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Collected Payments</div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {formatCurrency(paidBilled, defaultCurrency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600/80 mt-0.5">
            {invoices.filter((i) => i.status === 'paid').length} settled
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Pending & Drafts</div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-800 mt-1">
            {formatCurrency(outstandingBilled, defaultCurrency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
            {invoices.filter((i) => i.status === 'sent' || i.status === 'draft').length} open
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500">Overdue Volume</div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-red-600 mt-1">
            {formatCurrency(overdueBilled, defaultCurrency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-red-500/80 mt-0.5">
            {invoices.filter((i) => i.status === 'overdue').length} requiring follow-up
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Interactive segmented controls for filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto shrink-0">
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize touch-manipulation whitespace-nowrap ${
                filter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice # or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[42px] pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900"
          />
        </div>
      </div>

      {/* MOBILE CARDS VIEW (< sm screens for touch ergonomics) */}
      <div className="sm:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-lg">
            No invoices found matching your current filter.
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const totals = calculateInvoiceTotals(inv);
            const isActive = inv.id === activeInvoiceId;

            return (
              <div
                key={inv.id}
                className={`p-4 bg-white border rounded-xl space-y-3 transition-colors ${
                  isActive ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-900">{inv.invoiceNumber}</span>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">{inv.client.name}</div>
                    <div className="text-[11px] text-slate-500">{inv.client.city || inv.client.email}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      {formatCurrency(totals.total, inv.currency)}
                    </div>
                    <select
                      value={inv.status}
                      onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as InvoiceStatus)}
                      className="mt-1 text-[11px] font-bold uppercase font-mono px-2 py-1 border border-slate-300 rounded bg-white text-slate-800 touch-manipulation"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                  <span>Issued: {inv.issueDate}</span>
                  <span>Due: {inv.dueDate}</span>
                </div>

                {/* Touch-Friendly Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectInvoice(inv)}
                    className="col-span-2 min-h-[42px] px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98]"
                  >
                    <span>Open in Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDownloadPdfForInvoice(inv)}
                    className="min-h-[42px] px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 touch-manipulation"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSendEmailForInvoice(inv)}
                    className="min-h-[42px] px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 touch-manipulation"
                    title="Send via Email"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (sm: and up) */}
      <div className="hidden sm:block bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Invoice</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                  No invoices found matching your current filter.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const totals = calculateInvoiceTotals(inv);
                const isActive = inv.id === activeInvoiceId;

                return (
                  <tr
                    key={inv.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isActive ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Invoice ID & Template */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{inv.template} template</div>
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{inv.client.name || 'Unnamed Client'}</div>
                      <div className="text-[11px] text-slate-500">{inv.client.email || 'No email specified'}</div>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-slate-400">Due: {inv.dueDate}</div>
                    </td>

                    {/* Status with clean inline presentation */}
                    <td className="py-3.5 px-4">
                      <select
                        value={inv.status}
                        onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as InvoiceStatus)}
                        className="text-xs font-semibold uppercase font-mono px-2 py-0.5 border border-slate-200 rounded bg-white text-slate-800 focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      {inv.emailHistory?.length > 0 && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          Emailed ({inv.emailHistory.length}x)
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-sm font-bold text-slate-900">
                      {formatCurrency(totals.total, inv.currency)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectInvoice(inv)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors touch-manipulation"
                        >
                          Open in Studio
                        </button>

                        <button
                          onClick={() => onSendEmailForInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded transition-colors"
                          title="Send via Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDownloadPdfForInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDuplicateInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
