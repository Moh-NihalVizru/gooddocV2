/**
 * Format amount in paise to INR currency string with Indian number grouping
 * @param amountInPaise - Amount in paise (1 rupee = 100 paise)
 * @returns Formatted currency string with ₹ symbol and Indian grouping
 * @example formatINR(123456) => "₹1,234.56"
 */
export function formatINR(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format large amounts with abbreviations (L for lakh, Cr for crore)
 * @param amountInPaise - Amount in paise
 * @returns Abbreviated currency string
 * @example formatINRAbbreviated(1234567800) => "₹1.23Cr"
 */
export function formatINRAbbreviated(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  
  if (rupees >= 10000000) {
    // Crores (1 crore = 10 million)
    return `₹${(rupees / 10000000).toFixed(2)}Cr`;
  } else if (rupees >= 100000) {
    // Lakhs (1 lakh = 100 thousand)
    return `₹${(rupees / 100000).toFixed(2)}L`;
  }
  
  return formatINR(amountInPaise);
}
