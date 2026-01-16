/**
 * Billing ID Utilities
 * Standard format: 3 letters + 3 digits (e.g., INV001, RCP456, DOC789)
 */

type IdPrefix = 'INV' | 'RCP' | 'BIL' | 'DOC' | 'CLM' | 'ORD' | 'LAB' | 'RX' | 'ADM' | 'TXN';

/**
 * Generic ID formatter: PREFIX + 3 digits
 */
export function formatId(prefix: IdPrefix, sequence: number): string {
  const seq = String(Math.abs(sequence) % 1000).padStart(3, '0');
  return `${prefix}${seq}`;
}

/**
 * Generic ID generator
 */
export function generateId(prefix: IdPrefix): string {
  const sequence = Math.floor(1 + Math.random() * 999);
  return formatId(prefix, sequence);
}

// Invoice IDs
export function formatInvoiceId(sequence: number): string {
  return formatId('INV', sequence);
}
export function generateInvoiceId(): string {
  return generateId('INV');
}

// Receipt IDs
export function formatReceiptId(sequence: number): string {
  return formatId('RCP', sequence);
}
export function generateReceiptId(): string {
  return generateId('RCP');
}

// Bill IDs
export function formatBillId(sequence: number): string {
  return formatId('BIL', sequence);
}
export function generateBillId(): string {
  return generateId('BIL');
}

// Document IDs
export function formatDocumentId(sequence: number): string {
  return formatId('DOC', sequence);
}
export function generateDocumentId(): string {
  return generateId('DOC');
}

// Claim IDs (Insurance)
export function formatClaimId(sequence: number): string {
  return formatId('CLM', sequence);
}
export function generateClaimId(): string {
  return generateId('CLM');
}

// Order IDs
export function formatOrderId(sequence: number): string {
  return formatId('ORD', sequence);
}
export function generateOrderId(): string {
  return generateId('ORD');
}

// Lab Order IDs
export function formatLabId(sequence: number): string {
  return formatId('LAB', sequence);
}
export function generateLabId(): string {
  return generateId('LAB');
}

// Prescription IDs
export function formatPrescriptionId(sequence: number): string {
  return formatId('RX', sequence);
}
export function generatePrescriptionId(): string {
  return generateId('RX');
}

// Admission IDs
export function formatAdmissionId(sequence: number): string {
  return formatId('ADM', sequence);
}
export function generateAdmissionId(): string {
  return generateId('ADM');
}

// Transaction IDs
export function formatTransactionId(sequence: number): string {
  return formatId('TXN', sequence);
}
export function generateTransactionId(): string {
  return generateId('TXN');
}

/**
 * Parse any standard ID into its sequence number
 */
export function parseId(id: string): { prefix: string; sequence: number } | null {
  const match = id.match(/^([A-Z]{2,3})(\d{3})$/);
  if (!match) return null;
  return { prefix: match[1], sequence: parseInt(match[2], 10) };
}

export function parseInvoiceId(invoiceId: string): number | null {
  const result = parseId(invoiceId);
  return result?.prefix === 'INV' ? result.sequence : null;
}

export function parseReceiptId(receiptId: string): number | null {
  const result = parseId(receiptId);
  return result?.prefix === 'RCP' ? result.sequence : null;
}
