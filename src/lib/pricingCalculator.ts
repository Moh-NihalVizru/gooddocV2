/**
 * Pricing Calculator Utility
 * All amounts in paise (smallest currency unit)
 */

export interface PriceCalculationInput {
  basePrice: number; // paise
  markupPct: number; // 0-100
  discountPct: number; // 0-100
  taxPct: number; // 0-100
}

export interface PriceCalculationResult {
  basePrice: number;
  markupAmount: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  netPrice: number;
  breakdown: string[];
}

export function calculateNetPrice(input: PriceCalculationInput): PriceCalculationResult {
  const { basePrice, markupPct, discountPct, taxPct } = input;

  // Step 1: Apply markup
  const markupAmount = Math.round((basePrice * markupPct) / 100);
  const afterMarkup = basePrice + markupAmount;

  // Step 2: Apply discount
  const discountAmount = Math.round((afterMarkup * discountPct) / 100);
  const subtotal = afterMarkup - discountAmount;

  // Step 3: Apply tax
  const taxAmount = Math.round((subtotal * taxPct) / 100);
  const netPrice = subtotal + taxAmount;

  const breakdown = [
    `Base Price: ₹${(basePrice / 100).toFixed(2)}`,
    markupPct > 0 ? `+ Markup (${markupPct}%): ₹${(markupAmount / 100).toFixed(2)}` : null,
    discountPct > 0 ? `- Discount (${discountPct}%): ₹${(discountAmount / 100).toFixed(2)}` : null,
    `= Subtotal: ₹${(subtotal / 100).toFixed(2)}`,
    taxPct > 0 ? `+ Tax (${taxPct}%): ₹${(taxAmount / 100).toFixed(2)}` : null,
    `= Net Price: ₹${(netPrice / 100).toFixed(2)}`,
  ].filter(Boolean) as string[];

  return {
    basePrice,
    markupAmount,
    discountAmount,
    subtotal,
    taxAmount,
    netPrice,
    breakdown,
  };
}

export function validatePriceInput(input: Partial<PriceCalculationInput>): string[] {
  const errors: string[] = [];

  if (input.basePrice !== undefined && input.basePrice < 0) {
    errors.push("Base price cannot be negative");
  }

  if (input.markupPct !== undefined && (input.markupPct < 0 || input.markupPct > 100)) {
    errors.push("Markup percentage must be between 0 and 100");
  }

  if (input.discountPct !== undefined && (input.discountPct < 0 || input.discountPct > 100)) {
    errors.push("Discount percentage must be between 0 and 100");
  }

  if (input.taxPct !== undefined && (input.taxPct < 0 || input.taxPct > 100)) {
    errors.push("Tax percentage must be between 0 and 100");
  }

  return errors;
}

export function applyBulkPriceChange(
  currentPrice: number,
  operation: "increase" | "decrease",
  value: number,
  unit: "amount" | "percent"
): number {
  if (unit === "amount") {
    return operation === "increase" ? currentPrice + value : currentPrice - value;
  } else {
    const changeAmount = Math.round((currentPrice * value) / 100);
    return operation === "increase" ? currentPrice + changeAmount : currentPrice - changeAmount;
  }
}
