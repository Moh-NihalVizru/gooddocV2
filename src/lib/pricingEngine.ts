// Pricing calculation engine

import { LineItem, AppointmentTotals, DiscountType } from "@/types/pricing";

export interface CalculationInput {
  lineItems: LineItem[];
  globalDiscountType?: DiscountType;
  globalDiscountValue?: number;
}

export interface CalculationResult extends AppointmentTotals {
  lineItemsWithDistributedDiscount: Array<LineItem & { distributedDiscount: number }>;
}

/**
 * Main calculation engine for appointment totals
 * Order: line prices → subtotal → global discount → round-off → net payable
 */
export function calculateAppointmentTotals(input: CalculationInput): CalculationResult {
  const { lineItems, globalDiscountType, globalDiscountValue } = input;

  // Step 1: Calculate line net prices (with overrides and line discounts)
  const lineNets = lineItems.map((item) => {
    const effectivePrice = item.overridePrice ?? item.basePrice;
    let lineNet = effectivePrice;

    // Apply line discount
    if (item.lineDiscountAmount !== undefined) {
      lineNet = Math.max(0, lineNet - item.lineDiscountAmount);
    } else if (item.lineDiscountPercent !== undefined) {
      lineNet = Math.max(0, lineNet - (lineNet * item.lineDiscountPercent / 100));
    }

    return { ...item, lineNet };
  });

  // Step 2: Calculate subtotal
  const subtotal = lineNets.reduce((sum, item) => sum + item.lineNet, 0);

  // Step 3: Apply global discount
  let globalDiscountAmount = 0;
  if (globalDiscountType && globalDiscountValue !== undefined && globalDiscountValue > 0) {
    if (globalDiscountType === 'flat') {
      globalDiscountAmount = Math.min(globalDiscountValue, subtotal);
    } else if (globalDiscountType === 'percent') {
      globalDiscountAmount = (subtotal * Math.min(globalDiscountValue, 100)) / 100;
    }
  }

  // Step 4: Distribute global discount across items (pro-rate by value)
  const lineItemsWithDistributedDiscount = lineNets.map((item) => {
    if (!item.isDiscountable || subtotal === 0) {
      return { ...item, distributedDiscount: 0 };
    }
    const distributedDiscount = (item.lineNet / subtotal) * globalDiscountAmount;
    return { ...item, distributedDiscount };
  });

  // Step 5: Calculate gross total after discount
  const grossTotal = Math.max(0, subtotal - globalDiscountAmount);

  // Step 6: Round to nearest rupee
  const netPayable = Math.round(grossTotal);
  const roundOff = netPayable - grossTotal;

  return {
    subtotal,
    globalDiscountType,
    globalDiscountValue,
    roundOff,
    netPayable,
    lineItemsWithDistributedDiscount,
  };
}

/**
 * Validate price edit against policy
 */
export function validatePriceEdit(
  item: LineItem,
  newPrice: number,
  policy: { floorPrice: number; discountThresholdPercent: number }
): {
  isValid: boolean;
  requiresApproval: boolean;
  requiresReason: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let requiresApproval = false;
  let requiresReason = false;

  // Validate non-negative
  if (newPrice < 0) {
    errors.push("Price cannot be negative");
  }

  // Check floor price
  if (newPrice < policy.floorPrice) {
    requiresApproval = true;
    requiresReason = true;
    errors.push(`Price below floor (₹${formatCurrency(policy.floorPrice)})`);
  }

  // Check discount threshold
  const discountPercent = ((item.basePrice - newPrice) / item.basePrice) * 100;
  if (discountPercent > policy.discountThresholdPercent) {
    requiresReason = true;
  }

  return {
    isValid: errors.length === 0 || requiresApproval,
    requiresApproval,
    requiresReason,
    errors,
  };
}

/**
 * Validate discount against policy
 */
export function validateDiscount(
  discountType: DiscountType,
  discountValue: number,
  maxValue: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (discountValue < 0) {
    errors.push("Discount cannot be negative");
  }

  if (discountType === 'percent' && discountValue > 100) {
    errors.push("Discount cannot exceed 100%");
  }

  if (discountType === 'flat' && discountValue > maxValue) {
    errors.push(`Discount cannot exceed ₹${formatCurrency(maxValue)}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format currency for India (₹ with thousand separators)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
