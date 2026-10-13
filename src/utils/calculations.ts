import { Invoice } from '../types/invoice';

export interface InvoiceCalculations {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  shippingFee: number;
  total: number;
}

export function calculateInvoiceTotals(invoice: Invoice): InvoiceCalculations {
  // 1. Calculate items subtotal
  const subtotal = (invoice.items || []).reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  // 2. Discount amount
  let discountAmount = 0;
  if (invoice.discountType === 'percentage') {
    const rate = Math.min(100, Math.max(0, Number(invoice.discountValue) || 0));
    discountAmount = (subtotal * rate) / 100;
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, Number(invoice.discountValue) || 0));
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // 3. Tax calculation: either per-item or global taxRate
  let taxAmount = 0;
  const hasItemTaxes = invoice.items.some(i => typeof i.taxRate === 'number' && i.taxRate > 0);

  if (hasItemTaxes) {
    taxAmount = invoice.items.reduce((acc, item) => {
      const itemSub = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const itemTaxRate = Number(item.taxRate) || 0;
      return acc + (itemSub * itemTaxRate) / 100;
    }, 0);
  } else {
    const globalTaxRate = Math.max(0, Number(invoice.taxRate) || 0);
    taxAmount = (discountedSubtotal * globalTaxRate) / 100;
  }

  // 4. Shipping fee
  const shippingFee = Math.max(0, Number(invoice.shippingFee) || 0);

  // 5. Grand Total
  const total = discountedSubtotal + taxAmount + shippingFee;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(discountedSubtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
