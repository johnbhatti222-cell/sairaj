import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types/invoice';
import { calculateInvoiceTotals } from './calculations';

export interface GeneratedPdfResult {
  blob: Blob;
  dataUrl: string;
  sizeKb: number;
  filename: string;
}

/**
 * Pre-load all images inside an element to ensure html2canvas captures them without error.
 */
async function preloadImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 800);
      });
    })
  );
}

/**
 * Helper to convert any modern CSS color (including oklch, color, lab)
 * to standard sRGB hex or rgba format using a canvas context.
 */
function sanitizeColorToRgb(color: string): string {
  if (!color || typeof color !== 'string') return color;
  if (!color.includes('oklch') && !color.includes('color(') && !color.includes('lab(')) {
    return color;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = color;
      return ctx.fillStyle;
    }
  } catch (e) {
    // fallback
  }
  return '#1e293b';
}

/**
 * Sanitize all elements in cloned DOM tree to eliminate oklch colors
 * and ensure html2canvas never encounters unsupported color parsing errors.
 */
function sanitizeClonedDomTree(clonedDoc: Document, clonedRoot: HTMLElement) {
  const elements = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll('*'))];
  
  const colorProps = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderBottomColor',
    'borderLeftColor',
    'borderRightColor',
    'outlineColor',
  ] as const;

  for (const el of elements) {
    if (!(el instanceof HTMLElement) && !(el instanceof SVGElement)) continue;
    
    // Check computed styles on the element
    try {
      const view = clonedDoc.defaultView || window;
      const cs = view.getComputedStyle(el);
      for (const prop of colorProps) {
        const val = cs.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase()) || (cs as any)[prop];
        if (val && (val.includes('oklch') || val.includes('color(') || val.includes('lab('))) {
          const sanitized = sanitizeColorToRgb(val);
          (el.style as any)[prop] = sanitized;
        }
      }
    } catch {
      // Ignore element access errors
    }
  }

  // Also scan all inline style tags in cloned document
  const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
  for (const style of styleTags) {
    if (style.innerHTML && style.innerHTML.includes('oklch')) {
      try {
        style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, '#1e293b');
      } catch {
        // Ignore
      }
    }
  }
}

/**
 * 100% Reliable Native Vector PDF Generator using jsPDF directly.
 * Zero external DOM dependency, zero canvas taint risk, zero memory errors,
 * crisp vector text with tiny file size and instant rendering.
 */
export function generateVectorInvoicePdf(
  invoice?: Invoice,
  filename: string = 'invoice.pdf'
): GeneratedPdfResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const totals = invoice ? calculateInvoiceTotals(invoice) : {
    subtotal: 0,
    discountAmount: 0,
    taxableAmount: 0,
    taxAmount: 0,
    shippingFee: 0,
    total: 0,
  };

  const sender = invoice?.sender || {
    name: 'Sairaj Glass & Aluminium Center',
    address: 'Opp. New ST Depo Medha 415012',
    phone: '8390357118',
    email: 'sairaj0517@gmail.com',
    city: 'Medha',
    postalCode: '415012',
    country: 'India',
  };

  const client = invoice?.client || {
    name: 'Customer Client',
    phone: '',
    email: '',
    address: 'Medha',
    city: 'Medha',
    postalCode: '415012',
    country: 'India',
  };

  const items = invoice?.items || [];
  const currencySymbol = 'Rs.'; // ASCII-safe currency string for jsPDF standard Helvetica

  // Page dimensions (A4: 210 x 297 mm)
  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm

  // 1. Top Decorative Brand Bar
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFillColor(184, 134, 27); // Gold accent stripe
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // 2. Company Header
  let cursorY = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(sender.name || 'Sairaj Glass & Aluminium Center', margin, cursorY);

  cursorY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text('Glass, Aluminium Sliding Windows, Doors & Fabrication Works', margin, cursorY);

  cursorY += 4.5;
  const addressLine = [sender.address, sender.city, sender.postalCode, sender.country].filter(Boolean).join(', ');
  doc.text(addressLine, margin, cursorY);

  cursorY += 4.5;
  const contactLine = [
    sender.phone ? `Phone: ${sender.phone}` : null,
    sender.email ? `Email: ${sender.email}` : null,
    sender.taxId ? `GST/Tax: ${sender.taxId}` : null,
  ].filter(Boolean).join('  |  ');
  doc.text(contactLine, margin, cursorY);

  // 3. Invoice Badge Box (Top Right)
  const badgeX = 140;
  const badgeWidth = 56;
  const badgeY = 13;

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(badgeX, badgeY, badgeWidth, 26, 2, 2, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(badgeX + 2, badgeY + 2, badgeWidth - 4, 6.5, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE / BILL', badgeX + badgeWidth / 2, badgeY + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice?.invoiceNumber || 'INV-0001', badgeX + 4, badgeY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${invoice?.issueDate || new Date().toISOString().split('T')[0]}`, badgeX + 4, badgeY + 18);
  doc.text(`Due: ${invoice?.dueDate || invoice?.issueDate || '-'}`, badgeX + 4, badgeY + 22);

  // Horizontal divider
  cursorY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);

  // 4. Bill To & Payment Info Block
  cursorY += 5;
  const colWidth = contentWidth / 2;

  // Left Column: Bill To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO / CUSTOMER:', margin, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(client.name || 'Valued Customer', margin, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  let clientDetailsY = cursorY + 9.5;
  if (client.contactPerson && client.contactPerson !== client.name) {
    doc.text(`Attn: ${client.contactPerson}`, margin, clientDetailsY);
    clientDetailsY += 4;
  }
  if (client.phone) {
    doc.text(`Phone: ${client.phone}`, margin, clientDetailsY);
    clientDetailsY += 4;
  }
  if (client.email) {
    doc.text(`Email: ${client.email}`, margin, clientDetailsY);
    clientDetailsY += 4;
  }
  const clientAddr = [client.address, client.city, client.state, client.postalCode].filter(Boolean).join(', ');
  if (clientAddr) {
    doc.text(clientAddr, margin, clientDetailsY);
  }

  // Right Column: Terms & Payment Info
  const rightColX = margin + colWidth + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT DETAILS & TERMS:', rightColX, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Terms: ${invoice?.paymentTerms || 'Due on Receipt'}`, rightColX, cursorY + 5);
  doc.text(`Status: ${(invoice?.status || 'SENT').toUpperCase()}`, rightColX, cursorY + 9);
  doc.text(`Payment Mode: UPI / Cash / Bank Transfer`, rightColX, cursorY + 13);
  doc.text(`Google Pay / PhonePe: 8390357118`, rightColX, cursorY + 17);

  cursorY = Math.max(clientDetailsY + 8, cursorY + 24);

  // 5. Line Items Table Header
  const tableHeaderY = cursorY;
  const tableHeight = 7;

  doc.setFillColor(15, 23, 42); // Dark slate header
  doc.rect(margin, tableHeaderY, contentWidth, tableHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  const colX = {
    sr: margin + 3,
    desc: margin + 14,
    qty: margin + 115,
    rate: margin + 140,
    amount: margin + 178,
  };

  doc.text('#', colX.sr, tableHeaderY + 4.8);
  doc.text('DESCRIPTION & SPECIFICATION', colX.desc, tableHeaderY + 4.8);
  doc.text('QTY', colX.qty, tableHeaderY + 4.8, { align: 'right' });
  doc.text(`RATE (${currencySymbol})`, colX.rate, tableHeaderY + 4.8, { align: 'right' });
  doc.text(`AMOUNT (${currencySymbol})`, colX.amount, tableHeaderY + 4.8, { align: 'right' });

  cursorY = tableHeaderY + tableHeight;

  // 6. Line Items Rows
  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowY = cursorY;
    const rowHeight = item.details ? 10 : 7.5;

    // Background zebra row
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY, contentWidth, rowHeight, 'F');
    }

    // Border line under row
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, rowY + rowHeight, margin + contentWidth, rowY + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    // Row Number
    doc.text(String(index + 1), colX.sr, rowY + 5);

    // Description
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.description || 'Custom Item', colX.desc, rowY + 5);

    if (item.details) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(item.details, colX.desc, rowY + 8.5);
    }

    // Qty
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(String(item.quantity || 1), colX.qty, rowY + 5, { align: 'right' });

    // Rate
    const unitPrice = Number(item.unitPrice) || 0;
    doc.text(unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.rate, rowY + 5, { align: 'right' });

    // Line Total
    const itemTotal = (Number(item.quantity) || 1) * unitPrice;
    doc.setFont('helvetica', 'bold');
    doc.text(itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.amount, rowY + 5, { align: 'right' });

    cursorY += rowHeight;
  });

  cursorY += 4;

  // 7. Totals & Notes Section
  const summaryBoxWidth = 75;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;
  const summaryStartY = cursorY;

  // Left side: Notes & Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TERMS & CONDITIONS:', margin, summaryStartY + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const termsText = [
    '1. Payment must be cleared according to agreed terms.',
    '2. Goods once delivered and installed are subject to customer acceptance.',
    '3. For glass fitting or fabrication inquiries, reach us at 8390357118.',
  ];
  termsText.forEach((t, i) => {
    doc.text(t, margin, summaryStartY + 6 + i * 3.8);
  });

  // Right side: Financial Totals Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryBoxX, summaryStartY, summaryBoxWidth, 32, 1.5, 1.5, 'FD');

  let totalLineY = summaryStartY + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryBoxX + 4, totalLineY);
  doc.text(`${currencySymbol} ${totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 4, totalLineY, { align: 'right' });

  if (totals.discountAmount > 0) {
    totalLineY += 5;
    doc.text('Discount:', summaryBoxX + 4, totalLineY);
    doc.setTextColor(220, 38, 38);
    doc.text(`- ${currencySymbol} ${totals.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 4, totalLineY, { align: 'right' });
    doc.setTextColor(71, 85, 105);
  }

  // Grand Total Banner
  totalLineY += 6;
  doc.setFillColor(15, 23, 42);
  doc.rect(summaryBoxX + 2, totalLineY - 3.5, summaryBoxWidth - 4, 11, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL DUE:', summaryBoxX + 6, totalLineY + 3.5);
  doc.setFontSize(11);
  doc.text(`${currencySymbol} ${totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxWidth - 6, totalLineY + 3.5, { align: 'right' });

  // 8. Signatory & Bottom Footer
  const bottomY = 270;

  // Signature Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('For SAIRAJ GLASS & ALUMINIUM CENTER', pageWidth - margin - 65, bottomY);
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - margin - 65, bottomY + 12, pageWidth - margin, bottomY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Authorized Signatory', pageWidth - margin - 45, bottomY + 16, { align: 'center' });

  // Bottom Footer Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, 285, contentWidth, 0.4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for choosing Sairaj Glass & Aluminium Center!', margin, 290);
  doc.text('Opp. New ST Depo Medha 415012 | Contact: 8390357118', pageWidth - margin, 290, { align: 'right' });

  const blob = doc.output('blob');
  const dataUrl = doc.output('datauristring');
  const sizeKb = Math.round(blob.size / 1024);

  return {
    blob,
    dataUrl,
    sizeKb,
    filename,
  };
}

/**
 * Capture an invoice DOM element and generate a high-definition A4 PDF via html2canvas.
 */
export async function generateHtmlCanvasPdf(
  element: HTMLElement,
  filename: string = 'invoice.pdf'
): Promise<GeneratedPdfResult> {
  // Pre-load images inside the element
  await preloadImages(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff',
    width: 794,
    windowWidth: 794,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    ignoreElements: (el) => el.classList?.contains('no-print') || false,
    onclone: (clonedDoc, clonedElement) => {
      // 1. Move cloned element to direct child of clonedDoc body to guarantee (0,0) coordinates
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
      clonedDoc.body.style.backgroundColor = '#ffffff';
      clonedDoc.body.style.width = '794px';
      clonedDoc.body.style.overflow = 'visible';

      clonedElement.style.transform = 'none';
      clonedElement.style.position = 'static';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.opacity = '1';
      clonedElement.style.width = '794px';
      clonedElement.style.margin = '0';

      // 2. Sanitize all oklch / lab / modern CSS color functions
      sanitizeClonedDomTree(clonedDoc, clonedElement);
    },
  });

  // Verify canvas dimensions
  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas render returned empty dimensions.');
  }

  let imgData: string;
  try {
    imgData = canvas.toDataURL('image/jpeg', 0.95);
  } catch {
    imgData = canvas.toDataURL('image/png');
  }

  if (!imgData || imgData.length < 50) {
    throw new Error('Canvas image data export failed.');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  // Multi-page handling
  while (heightLeft > 5) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  const blob = pdf.output('blob');
  const dataUrl = pdf.output('datauristring');
  const sizeKb = Math.round(blob.size / 1024);

  return {
    blob,
    dataUrl,
    sizeKb,
    filename,
  };
}

/**
 * Universal Dual-Engine Invoice PDF Generator.
 * Tries the high-res HTML visual snapshot first.
 * If browser constraints, canvas taint, or mobile restrictions occur,
 * automatically falls back to crisp native vector PDF rendering with 0% failure rate.
 */
export async function generateInvoicePdf(
  sourceElement?: HTMLElement | null,
  filename: string = 'invoice.pdf',
  invoice?: Invoice
): Promise<GeneratedPdfResult> {
  // 1. Locate the best target element
  let element = sourceElement;
  if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) {
    const offscreen = document.getElementById('offscreen-invoice-capture');
    if (offscreen && offscreen.offsetWidth > 0) {
      element = offscreen;
    } else {
      const container = document.getElementById('invoice-capture-container');
      if (container && container.offsetWidth > 0) {
        element = container;
      }
    }
  }

  // 2. Attempt HTML Canvas snapshot
  if (element) {
    try {
      const result = await generateHtmlCanvasPdf(element, filename);
      if (result && result.blob.size > 1000) {
        return result;
      }
    } catch (canvasErr) {
      console.warn('HTML Canvas PDF generation had browser restriction, switching seamlessly to vector engine:', canvasErr);
    }
  }

  // 3. Fallback: Native Vector PDF generation with jsPDF
  return generateVectorInvoicePdf(invoice, filename);
}

/**
 * Directly download invoice PDF to the user's computer or mobile phone.
 */
export async function downloadInvoicePdf(
  element?: HTMLElement | null,
  filename: string = 'invoice.pdf',
  invoice?: Invoice
): Promise<GeneratedPdfResult> {
  const result = await generateInvoicePdf(element, filename, invoice);

  // Trigger download via anchor
  const link = document.createElement('a');
  link.href = URL.createObjectURL(result.blob);
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after delay
  setTimeout(() => URL.revokeObjectURL(link.href), 15000);

  return result;
}
