import { CartItem, Totals } from "@/types/booking/ipAdmission";

/**
 * Calculate net amount for a single cart item (before tax)
 */
export function calcLineNet(item: CartItem): number {
  return item.unitPrice * item.qty * (1 - (item.discountPct || 0) / 100);
}

/**
 * Calculate tax amount for a single cart item
 */
export function calcLineTax(item: CartItem): number {
  return calcLineNet(item) * (item.taxPct / 100);
}

/**
 * Calculate line total including tax
 */
export function calcLineTotal(item: CartItem): number {
  return calcLineNet(item) + calcLineTax(item);
}

/**
 * Calculate totals for all cart items
 * @param items - Array of cart items
 * @param baseCharge - Optional base charge (e.g., from admission)
 */
export function calcTotals(items: CartItem[], baseCharge: number = 0): Totals {
  const subtotalBeforeDiscount = items.reduce((sum, item) => 
    sum + (item.unitPrice * item.qty), 0) + baseCharge;
  
  const discountTotal = items.reduce((sum, item) => 
    sum + (item.unitPrice * item.qty * (item.discountPct || 0) / 100), 0);
  
  const subtotal = subtotalBeforeDiscount - discountTotal;
  
  const taxTotal = items.reduce((sum, item) => 
    sum + calcLineTax(item), 0);
  
  const netPayable = subtotal + taxTotal;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    netPayable: Math.round(netPayable * 100) / 100,
  };
}
