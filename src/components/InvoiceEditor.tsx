import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Percent, 
  Calendar,
  Building,
  User,
  CreditCard,
  FileText,
  Palette
} from 'lucide-react';
import { Invoice, InvoiceItem, TemplateType } from '../types/invoice';
import { CURRENCIES } from '../utils/currencies';
import { calculateInvoiceTotals } from '../utils/calculations';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (updatedInvoice: Invoice) => void;
}

const ACCENT_COLORS = [
  { label: 'Sairaj Gold', value: '#B8861B' },
  { label: 'Deep Black', value: '#0f172a' },
  { label: 'Royal Blue', value: '#1d4ed8' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Warm Amber', value: '#d97706' },
  { label: 'Crimson', value: '#e11d48' },
  { label: 'Steel Gray', value: '#475569' },
];

const TEMPLATES: { id: TemplateType; label: string; desc: string }[] = [
  { id: 'modern', label: 'Modern', desc: 'Contemporary clean layout with accent bar' },
  { id: 'corporate', label: 'Corporate', desc: 'Structured grid with explicit wire details' },
  { id: 'minimal', label: 'Minimal', desc: 'Airy editorial typography and light rules' },
  { id: 'creative', label: 'Creative', desc: 'Bold banner header for design and studios' },
  { id: 'classic', label: 'Classic', desc: 'Traditional centered commercial bill format' },
];

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ invoice, onChange }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'parties' | 'settings' | 'design'>('items');

  const totals = calculateInvoiceTotals(invoice);

  // Helper updater
  const updateInvoice = <K extends keyof Invoice>(key: K, value: Invoice[K]) => {
    onChange({
      ...invoice,
      [key]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateSender = (field: string, val: string) => {
    onChange({
      ...invoice,
      sender: {
        ...invoice.sender,
        [field]: val,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const updateClient = (field: string, val: string) => {
    onChange({
      ...invoice,
      client: {
        ...invoice.client,
        [field]: val,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Line item manipulation
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: 'New service item or product',
      details: '',
      quantity: 1,
      unitPrice: 100,
    };
    updateInvoice('items', [...invoice.items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    updateInvoice('items', updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) {
      alert('Invoice must contain at least one line item.');
      return;
    }
    const updated = invoice.items.filter((_, i) => i !== index);
    updateInvoice('items', updated);
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateSender('logoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Payment terms change helper to calculate due date
  const handleTermsChange = (terms: string) => {
    let daysToAdd = 0;
    if (terms === 'Net 15') daysToAdd = 15;
    else if (terms === 'Net 30') daysToAdd = 30;
    else if (terms === 'Net 60') daysToAdd = 60;
    
    if (daysToAdd > 0 && invoice.issueDate) {
      const date = new Date(invoice.issueDate);
      date.setDate(date.getDate() + daysToAdd);
      const dueDateStr = date.toISOString().split('T')[0];
      onChange({
        ...invoice,
        paymentTerms: terms,
        dueDate: dueDateStr,
      });
    } else {
      updateInvoice('paymentTerms', terms);
    }
  };

  return (
    <div className="bg-white border-r border-slate-200 h-full flex flex-col text-xs text-slate-700">
      {/* Editor Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-2 gap-1 overflow-x-auto shrink-0">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-1.5 px-3 py-2 font-medium text-xs rounded-t-md transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'items'
              ? 'border-slate-900 bg-white text-slate-900 shadow-2xs font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Items & Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('parties')}
          className={`flex items-center gap-1.5 px-3 py-2 font-medium text-xs rounded-t-md transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'parties'
              ? 'border-slate-900 bg-white text-slate-900 shadow-2xs font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Business & Client</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center gap-1.5 px-3 py-2 font-medium text-xs rounded-t-md transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'design'
              ? 'border-slate-900 bg-white text-slate-900 shadow-2xs font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Design & Theme</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-2 font-medium text-xs rounded-t-md transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-slate-900 bg-white text-slate-900 shadow-2xs font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms & Notes</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Top Header Card (Invoice Number & Status & Currency) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/80 border border-slate-200 rounded-lg">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Invoice Number</label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => updateInvoice('invoiceNumber', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-medium text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Status</label>
            <select
              value={invoice.status}
              onChange={(e) => updateInvoice('status', e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none uppercase font-mono"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Currency</label>
            <select
              value={invoice.currency.code}
              onChange={(e) => {
                const found = CURRENCIES.find((c) => c.code === e.target.value);
                if (found) updateInvoice('currency', found);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">P.O. Number</label>
            <input
              type="text"
              value={invoice.poNumber || ''}
              onChange={(e) => updateInvoice('poNumber', e.target.value)}
              placeholder="e.g. PO-8891"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-800 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* TAB 1: LINE ITEMS & PRICING */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Dates & Payment Terms Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => updateInvoice('issueDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Payment Terms</label>
                <select
                  value={invoice.paymentTerms}
                  onChange={(e) => handleTermsChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15 (15 Days)</option>
                  <option value="Net 30">Net 30 (30 Days)</option>
                  <option value="Net 60">Net 60 (60 Days)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => updateInvoice('dueDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono font-medium"
                />
              </div>
            </div>

            {/* Line items table editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Line Items</span>
                <span className="text-[11px] text-slate-500 font-mono">{invoice.items.length} items listed</span>
              </div>

              <div className="space-y-3">
                {invoice.items.map((item, index) => {
                  const itemAmount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <div
                      key={item.id || index}
                      className="p-3 border border-slate-200 rounded-lg bg-slate-50/40 hover:border-slate-300 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1.5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                            placeholder="Item description or service name"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={item.details || ''}
                            onChange={(e) => handleUpdateItem(index, 'details', e.target.value)}
                            placeholder="Additional details, scope, or measurement (e.g. 180 Sq.Ft)"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-slate-400 hover:text-red-600 active:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Delete item"
                          aria-label="Delete line item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                            Quantity / Units
                          </label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(index, 'quantity', Math.max(0, (Number(item.quantity) || 0) - 1))}
                              className="w-9 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-l-lg border border-slate-300 font-bold text-sm touch-manipulation"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full h-8 text-center px-1 bg-white border-y border-slate-300 font-mono tabular-nums text-xs focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(index, 'quantity', (Number(item.quantity) || 0) + 1)}
                              className="w-9 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-r-lg border border-slate-300 font-bold text-sm touch-manipulation"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                            Unit Rate ({invoice.currency.symbol})
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg font-mono tabular-nums text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1 text-right sm:text-right">
                            Line Total
                          </label>
                          <div className="h-8 px-2.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs flex items-center justify-end tabular-nums">
                            {invoice.currency.symbol}{itemAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full min-h-[44px] py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 active:bg-slate-100 transition-colors flex items-center justify-center gap-2 font-semibold text-xs touch-manipulation"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Add Line Item</span>
              </button>
            </div>

            {/* Adjustments: Discount, Tax, Shipping */}
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/60 space-y-3">
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider block">
                Discounts & Surcharges
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Discount */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Discount</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="0"
                      value={invoice.discountValue}
                      onChange={(e) => updateInvoice('discountValue', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                    />
                    <select
                      value={invoice.discountType}
                      onChange={(e) => updateInvoice('discountType', e.target.value as any)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">{invoice.currency.symbol}</option>
                    </select>
                  </div>
                </div>

                {/* Tax Rate */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-medium text-slate-600">Tax (%)</label>
                    {invoice.taxRate > 0 ? (
                      <button
                        type="button"
                        onClick={() => updateInvoice('taxRate', 0)}
                        className="text-[10px] text-blue-600 hover:underline"
                      >
                        Set 0% (No Tax)
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-medium">No Tax Included</span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={invoice.taxRate}
                    onChange={(e) => updateInvoice('taxRate', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                  />
                </div>

                {/* Shipping */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Shipping & Delivery ({invoice.currency.symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={invoice.shippingFee}
                    onChange={(e) => updateInvoice('shippingFee', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Calculated Invoice Total:</span>
                <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                  {invoice.currency.symbol}{totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESS & CLIENT */}
        {activeTab === 'parties' && (
          <div className="space-y-6">
            {/* Sender / Business Details */}
            <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-white">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Your Business Details (Sender)
                </span>
                <label className="cursor-pointer text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>

              {invoice.sender.logoUrl && (
                <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded">
                  <img src={invoice.sender.logoUrl} alt="Logo" className="h-8 max-w-[100px] object-contain" />
                  <span className="text-[11px] text-slate-500">Logo attached</span>
                  <button
                    type="button"
                    onClick={() => updateSender('logoUrl', '')}
                    className="text-[11px] text-red-500 hover:text-red-700 ml-auto"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Business Name</label>
                  <input
                    type="text"
                    value={invoice.sender.name}
                    onChange={(e) => updateSender('name', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Email Address</label>
                  <input
                    type="email"
                    value={invoice.sender.email}
                    onChange={(e) => updateSender('email', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    value={invoice.sender.phone || ''}
                    onChange={(e) => updateSender('phone', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Tax ID / VAT No.</label>
                  <input
                    type="text"
                    value={invoice.sender.taxId || ''}
                    onChange={(e) => updateSender('taxId', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Street Address</label>
                  <input
                    type="text"
                    value={invoice.sender.address}
                    onChange={(e) => updateSender('address', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">City & State</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={invoice.sender.city}
                      onChange={(e) => updateSender('city', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="State / Region"
                      value={invoice.sender.state || ''}
                      onChange={(e) => updateSender('state', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Postal Code & Country</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="ZIP / Postal"
                      value={invoice.sender.postalCode}
                      onChange={(e) => updateSender('postalCode', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={invoice.sender.country}
                      onChange={(e) => updateSender('country', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-white">
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider block">
                Billed Client Details (Recipient)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Client Company Name</label>
                  <input
                    type="text"
                    value={invoice.client.name}
                    onChange={(e) => updateClient('name', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Contact Person (Attn)</label>
                  <input
                    type="text"
                    value={invoice.client.contactPerson || ''}
                    onChange={(e) => updateClient('contactPerson', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">
                    Client Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={invoice.client.email}
                    onChange={(e) => updateClient('email', e.target.value)}
                    placeholder="Used for email dispatch"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Client Phone</label>
                  <input
                    type="text"
                    value={invoice.client.phone || ''}
                    onChange={(e) => updateClient('phone', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Billing Address</label>
                  <input
                    type="text"
                    value={invoice.client.address}
                    onChange={(e) => updateClient('address', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">City & State</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={invoice.client.city}
                      onChange={(e) => updateClient('city', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="State / Region"
                      value={invoice.client.state || ''}
                      onChange={(e) => updateClient('state', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Postal Code & Country</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={invoice.client.postalCode}
                      onChange={(e) => updateClient('postalCode', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={invoice.client.country}
                      onChange={(e) => updateClient('country', e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DESIGN & THEME */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <div>
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider block mb-3">
                Select Invoice Template
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => updateInvoice('template', tmpl.id)}
                    className={`text-left p-3.5 border rounded-lg transition-all ${
                      invoice.template === tmpl.id
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">{tmpl.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{tmpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider block mb-2">
                Accent Color Palette
              </span>
              <div className="flex flex-wrap gap-2.5">
                {ACCENT_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => updateInvoice('accentColor', col.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                      invoice.accentColor === col.value
                        ? 'border-slate-900 bg-slate-100 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: col.value }} />
                    <span>{col.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TERMS, NOTES & SIGNATURE */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Client Notes (Greeting / Wire References)
              </label>
              <textarea
                rows={3}
                value={invoice.notes}
                onChange={(e) => updateInvoice('notes', e.target.value)}
                placeholder="Thank you for your business. Please reference invoice number when paying."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs resize-y"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={invoice.terms}
                onChange={(e) => updateInvoice('terms', e.target.value)}
                placeholder="Payment is due within specified terms. Late fees may apply."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs resize-y"
              />
            </div>

            {/* Signature Block */}
            <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Digital Signature Block
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invoice.showSignature}
                    onChange={(e) => updateInvoice('showSignature', e.target.checked)}
                    className="rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Display on Invoice</span>
                </label>
              </div>

              {invoice.showSignature && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Signer Name</label>
                    <input
                      type="text"
                      value={invoice.signatureName || ''}
                      onChange={(e) => updateInvoice('signatureName', e.target.value)}
                      placeholder="e.g. Elena Vance"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-serif"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Title / Designation</label>
                    <input
                      type="text"
                      value={invoice.signatureTitle || ''}
                      onChange={(e) => updateInvoice('signatureTitle', e.target.value)}
                      placeholder="e.g. Managing Principal"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Date Signed</label>
                    <input
                      type="date"
                      value={invoice.signatureDate || ''}
                      onChange={(e) => updateInvoice('signatureDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
