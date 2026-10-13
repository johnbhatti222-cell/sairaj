import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
        // Fallback timeout in case image loading stalls
        setTimeout(resolve, 500);
      });
    })
  );
}

/**
 * Capture an invoice DOM element and generate a high-definition A4 PDF.
 */
export async function generateInvoicePdf(
  sourceElement?: HTMLElement | null,
  filename: string = 'invoice.pdf'
): Promise<GeneratedPdfResult> {
  // 1. Locate the best target element
  let element = sourceElement;
  if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) {
    // Check for the offscreen capture container
    const offscreen = document.getElementById('offscreen-invoice-capture');
    if (offscreen && offscreen.offsetWidth > 0) {
      element = offscreen;
    } else {
      // Check visible container
      const container = document.getElementById('invoice-capture-container');
      if (container && container.offsetWidth > 0) {
        element = container;
      }
    }
  }

  if (!element) {
    throw new Error('Invoice container could not be found for PDF capture.');
  }

  // 2. Pre-load images
  await preloadImages(element);

  // 3. Render via html2canvas with defensive options
  const canvas = await html2canvas(element, {
    scale: 2, // 2x gives 300 DPI print quality without memory overflow
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: 794,
    windowWidth: 794,
    onclone: (clonedDoc, clonedElement) => {
      // Ensure cloned element is clean, unscaled, and visible
      clonedElement.style.transform = 'none';
      clonedElement.style.position = 'static';
      clonedElement.style.left = 'auto';
      clonedElement.style.top = 'auto';
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.width = '794px';
      clonedElement.style.margin = '0 auto';
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // 4. A4 dimensions in mm: 210 x 297
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

  // Multi-page handling if content overflows single A4 page
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
export async function downloadInvoicePdf(
  element?: HTMLElement | null,
  filename: string = 'invoice.pdf'
): Promise<GeneratedPdfResult> {
  const result = await generateInvoicePdf(element, filename);

  // Create download anchor
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
