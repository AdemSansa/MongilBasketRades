import { jsPDF } from 'jspdf';

export interface ReceiptData {
  /** Stable id of the payment / kit order -- the receipt number is derived from it. */
  id: string;
  playerName: string;
  /** e.g. "Membership", "Insurance", "Team kit". */
  description: string;
  /** e.g. "September 2026", "Season 2026-2027", "Size M". */
  detail: string;
  amount: number;
  currency: string;
  paymentDate: string | null;
  method: string | null;
  reference: string | null;
  notes: string | null;
}

const NAVY: [number, number, number] = [18, 41, 77];
const ORANGE: [number, number, number] = [245, 130, 31];

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch('/logo.jpg');
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const [year, month, day] = value.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

function formatMethod(method: string | null): string {
  if (!method) return '—';
  return { CASH: 'Cash', BANK_TRANSFER: 'Bank transfer', OTHER: 'Other' }[method] ?? method;
}

/** Downloads a proof-of-payment PDF (receipt / discharge) for a paid payment or kit order. */
export async function downloadReceiptPdf(data: ReceiptData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'landscape' });
  const width = doc.internal.pageSize.getWidth();
  const receiptNumber = `REC-${data.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, width, 30, 'F');

  const logo = await loadLogoDataUrl();
  if (logo) doc.addImage(logo, 'JPEG', 8, 4, 22, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Mongil Basket Rades', logo ? 34 : 10, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Payment receipt / proof of payment', logo ? 34 : 10, 21);
  doc.setFontSize(9);
  doc.text(receiptNumber, width - 10, 14, { align: 'right' });
  doc.text(`Issued ${formatDate(new Date().toISOString())}`, width - 10, 21, { align: 'right' });

  const rows: [string, string][] = [
    ['Received from / for', data.playerName],
    ['Payment for', `${data.description} — ${data.detail}`],
    ['Payment date', formatDate(data.paymentDate)],
    ['Method', formatMethod(data.method)],
  ];
  if (data.reference) rows.push(['Reference', data.reference]);
  if (data.notes) rows.push(['Notes', data.notes]);

  doc.setTextColor(0, 0, 0);
  let y = 44;
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(label, 12, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 26, 26);
    doc.text(doc.splitTextToSize(value, width - 80), 62, y);
    y += 9;
  }

  doc.setFillColor(...ORANGE);
  doc.roundedRect(width - 72, 92, 60, 22, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('AMOUNT PAID', width - 42, 99, { align: 'center' });
  doc.setFontSize(16);
  doc.text(`${data.amount.toFixed(2)} ${data.currency}`, width - 42, 109, { align: 'center' });

  doc.setDrawColor(180, 180, 180);
  doc.line(12, 128, 70, 128);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Academy signature / stamp', 12, 133);
  doc.text('This receipt certifies that the amount above was received in full.', 12, 141);

  const safeName = data.playerName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  doc.save(`receipt-${safeName}-${receiptNumber}.pdf`);
}
