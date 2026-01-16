// Pricing and discount types for appointment booking system

export type DiscountType = 'flat' | 'percent';
export type AllocationMethod = 'pro-rate' | 'equal-split' | 'exclude-non-discountable';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AppRole = 'staff' | 'manager' | 'admin';

export interface LineItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  overridePrice?: number;
  lineDiscountAmount?: number;
  lineDiscountPercent?: number;
  isDiscountable: boolean;
  floorPrice: number;
  editedBy?: string;
  editedAt?: Date;
  editedReason?: string;
  approval?: {
    required: boolean;
    status: ApprovalStatus;
    approver?: string;
    approvedAt?: Date;
  };
}

export interface AppointmentTotals {
  subtotal: number;
  globalDiscountType?: DiscountType;
  globalDiscountValue?: number;
  roundOff: number;
  netPayable: number;
}

export interface PricingPolicy {
  discountThresholdPercent: number;
  requireReasonAboveThreshold: boolean;
  floorPriceRules: Record<string, number>;
  approverRoles: AppRole[];
}

export interface Coupon {
  code: string;
  type: DiscountType;
  value: number;
  constraints?: {
    minAmount?: number;
    maxDiscount?: number;
    validUntil?: Date;
  };
}

export interface AuditEvent {
  entity: 'lineItem' | 'appointment';
  entityId: string;
  userId: string;
  action: string;
  from: any;
  to: any;
  reason?: string;
  approver?: string;
  timestamp: Date;
}

export interface FeatureFlags {
  priceEdit_inline: boolean;
  priceEdit_modal: boolean;
  priceEdit_lock: boolean;
  priceEdit_quickActions: boolean;
  globalDiscount_summary: boolean;
  globalDiscount_stickyBar: boolean;
  globalDiscount_wizard: boolean;
  approval_required_below_floor: boolean;
}

export interface PriceEditState {
  isEditing: boolean;
  isLocked: boolean;
  tempValue?: number;
  reason?: string;
  requiresApproval?: boolean;
}
