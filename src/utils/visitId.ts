/**
 * Format a visit ID in the standard format: VYY-XXX
 * @param year - The year (2 or 4 digit)
 * @param sequence - The sequence number
 * @returns Formatted visit ID string
 * @example formatVisitId(25, 1) => "V25-001"
 * @example formatVisitId(2025, 42) => "V25-042"
 */
export function formatVisitId(year: number, sequence: number): string {
  const yy = year > 99 ? year % 100 : year;
  const seq = String(sequence).padStart(3, '0');
  return `V${yy}-${seq}`;
}

/**
 * Generate a new visit ID with current year and random sequence
 * @returns Generated visit ID string
 * @example generateVisitId() => "V25-847"
 */
export function generateVisitId(): string {
  const year = new Date().getFullYear() % 100;
  const sequence = Math.floor(1 + Math.random() * 999);
  return formatVisitId(year, sequence);
}

/**
 * Parse a visit ID string into its components
 * @param visitId - The visit ID string (e.g., "V25-001")
 * @returns Object with year and sequence, or null if invalid
 */
export function parseVisitId(visitId: string): { year: number; sequence: number } | null {
  const match = visitId.match(/^V(\d{2})-(\d{3})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    sequence: parseInt(match[2], 10),
  };
}
