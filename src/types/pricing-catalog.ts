export type PricingCategory = 
  | "Lab Test"
  | "Doctor Fee"
  | "Procedure"
  | "Imaging"
  | "Room"
  | "Pharmacy"
  | "Package";

export type PricingStatus = "Draft" | "Published" | "Archived";

export type UserRole = "Admin" | "Finance" | "Manager" | "Staff";

export type Currency = "INR" | "USD" | "EUR";

export type VisibilityLevel = "admin" | "staff" | "portal";

export interface PricingCodes {
  internal: string;
  cpt?: string;
  icd?: string;
  hcpcs?: string;
}

export interface PricingTiers {
  cash: number;
  insurance: number;
  corporate: number;
}

export interface PricingDetails {
  currency: Currency;
  cost: number; // Internal cost in paise
  basePrice: number; // Base price in paise
  markupPct: number;
  discountPct: number;
  taxPct: number;
  netPrice: number; // Computed in paise
  tiers: PricingTiers;
  effectiveFrom: string; // ISO date
  effectiveTo: string | null; // ISO date
}

export interface BranchOverride {
  branchId: string;
  branchName: string;
  currency: Currency;
  basePrice: number;
  taxPct: number;
  netPrice: number;
}

export interface AuditEntry {
  at: string; // ISO datetime
  by: string; // User ID
  byName: string; // User name
  change: string; // Description of change
  previousValue?: any;
  newValue?: any;
}

export interface PricingItem {
  id: string;
  name: string;
  category: PricingCategory;
  department: string;
  codes: PricingCodes;
  description: string;
  unit: string; // "test", "session", "day", "each", etc.
  visibility: VisibilityLevel;
  pricing: PricingDetails;
  branchOverrides: BranchOverride[];
  status: PricingStatus;
  tags: string[];
  
  // Operational details
  turnaroundTime?: string;
  requiresDoctorOrder: boolean;
  availability: "In Stock" | "Out of Stock" | "N/A";
  slaNote?: string;
  prepInstructions?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  version: number;
  audit: AuditEntry[];
}

export interface PricingFilters {
  search: string;
  category: PricingCategory | "All";
  department: string;
  status: PricingStatus | "All";
  priceRange: { min: number; max: number } | null;
  dateRange: { from: string; to: string } | null;
  branch: string;
}

export interface BulkUpdateOperation {
  type: "increase" | "decrease" | "setTax" | "changeStatus" | "setEffectiveDate";
  value: number | string;
  unit: "amount" | "percent";
}

export interface ImportColumnMapping {
  csvColumn: string;
  fieldName: keyof PricingItem | string;
}
