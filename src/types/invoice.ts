export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type TemplateType = 'modern' | 'corporate' | 'minimal' | 'creative' | 'classic';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number; // percentage, e.g. 10 for 10%
}

export interface BusinessDetails {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  taxId?: string; // VAT / GST / EIN
  website?: string;
  logoUrl?: string;
}

export interface ClientDetails {
  id?: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  taxId?: string;
}

export interface PaymentDetails {
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'check' | 'other';
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  paymentLink?: string;
  instructions?: string;
}

export interface EmailHistoryEntry {
  id: string;
  sentAt: string;
  recipient: string;
  subject: string;
  method: 'app_direct' | 'mailto' | 'gmail' | 'web_share';
  status: 'delivered' | 'opened' | 'draft_opened';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber?: string;
  status: InvoiceStatus;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  paymentTerms: string; // 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60'
  currency: Currency;
  sender: BusinessDetails;
  client: ClientDetails;
  items: InvoiceItem[];
  taxRate: number; // Global default tax rate %
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  shippingFee: number;
  notes: string;
  terms: string;
  template: TemplateType;
  accentColor: string;
  signatureName?: string;
  signatureTitle?: string;
  signatureDate?: string;
  showSignature: boolean;
  emailHistory: EmailHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}
