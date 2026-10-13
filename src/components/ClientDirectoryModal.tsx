import React, { useState } from 'react';
import { Building, Mail, Phone, MapPin, Plus, FilePlus, Search, Edit2, Trash2 } from 'lucide-react';
import { ClientDetails, Invoice } from '../types/invoice';

interface ClientDirectoryModalProps {
  invoices: Invoice[];
  onDraftInvoiceForClient: (client: ClientDetails) => void;
  onUpdateClientInInvoices: (updatedClient: ClientDetails) => void;
}

export const ClientDirectoryModal: React.FC<ClientDirectoryModalProps> = ({
  invoices,
  onDraftInvoiceForClient,
  onUpdateClientInInvoices,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClient, setEditingClient] = useState<ClientDetails | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);

  // Extract unique clients across all invoices + persistent clients
  const clientMap = new Map<string, { client: ClientDetails; invoiceCount: number; lastBilled: string }>();

  invoices.forEach((inv) => {
    const key = inv.client.name.trim().toLowerCase() || 'unnamed';
    if (!clientMap.has(key)) {
      clientMap.set(key, {
        client: inv.client,
        invoiceCount: 1,
        lastBilled: inv.issueDate,
      });
    } else {
      const entry = clientMap.get(key)!;
      entry.invoiceCount += 1;
      if (inv.issueDate > entry.lastBilled) {
        entry.lastBilled = inv.issueDate;
      }
    }
  });

  const clientsList = Array.from(clientMap.values());
  const filtered = clientsList.filter(({ client }) => {
    const q = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(q) ||
      (client.email && client.email.toLowerCase().includes(q)) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(q))
    );
  });

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name.trim()) return;

    if (isNewClient) {
      onDraftInvoiceForClient(editingClient);
      setIsNewClient(false);
      setEditingClient(null);
    } else {
      onUpdateClientInInvoices(editingClient);
      setEditingClient(null);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Client Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain customer billing records, tax IDs, and direct email contacts.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNewClient(true);
            setEditingClient({
              id: `client-${Date.now()}`,
              name: '',
              contactPerson: '',
              email: '',
              phone: '',
              address: '',
              city: 'Medha',
              postalCode: '415012',
              country: 'India',
            });
          }}
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 active:scale-[0.98] transition-colors shadow-xs touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[42px] pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {clientsList.length} client organizations registered
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map(({ client, invoiceCount, lastBilled }) => (
          <div
            key={client.name}
            className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-slate-900 text-sm">{client.name}</div>
                <div className="text-[11px] font-mono text-slate-400 shrink-0">
                  {invoiceCount} {invoiceCount === 1 ? 'bill' : 'bills'}
                </div>
              </div>

              {client.contactPerson && (
                <div className="text-xs font-medium text-slate-600 mt-1">
                  Attn: {client.contactPerson}
                </div>
              )}

              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {[client.address, client.city, client.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Last active {lastBilled}</span>
              <button
                type="button"
                onClick={() => onDraftInvoiceForClient(client)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 active:scale-[0.98] transition-colors touch-manipulation"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Draft Bill</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Client Modal Bottom Sheet */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveClient}
            className="bg-white rounded-t-2xl sm:rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto pb-safe sm:pb-6"
          >
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden shrink-0" />
            <h3 className="text-base font-bold text-slate-900">
              {isNewClient ? 'Add New Client' : 'Edit Client Profile'}
            </h3>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company / Client Name *</label>
              <input
                type="text"
                required
                value={editingClient.name}
                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                value={editingClient.contactPerson || ''}
                onChange={(e) => setEditingClient({ ...editingClient, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={editingClient.email}
                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Billing Address</label>
              <input
                type="text"
                value={editingClient.address}
                onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={editingClient.city}
                  onChange={(e) => setEditingClient({ ...editingClient, city: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Country</label>
                <input
                  type="text"
                  value={editingClient.country}
                  onChange={(e) => setEditingClient({ ...editingClient, country: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
              >
                {isNewClient ? 'Create & Start Invoice' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
