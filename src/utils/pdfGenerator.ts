import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratedPdfResult {
  blob: Blob;
  dataUrl: string;
  sizeKb: number;
  filename: string;
}

/**
 * Capture an invoice DOM element and generate a high-definition A4 PDF.
 */
export async function generateInvoicePdf(
  element: HTMLElement,
  filename: string = 'invoice.pdf'
): Promise<GeneratedPdfResult> {
  // Ensure the target element is visible and styled properly
  const canvas = await html2canvas(element, {
    scale: 2.5, // 2.5x resolution for crisp text and print rendering
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // A4 dimensions in mm: 210 x 297
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

  // Multi-page handling if content is long
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
 * Directly download invoice PDF to the user's computer.
 */
export async function downloadInvoicePdf(element: HTMLElement, filename: string): Promise<GeneratedPdfResult> {
  const result = await generateInvoicePdf(element, filename);
  
  // Create download anchor
  const link = document.createElement('a');
  link.href = URL.createObjectURL(result.blob);
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after delay
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);

  return result;
}
