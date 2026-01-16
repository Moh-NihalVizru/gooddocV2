import { useState, useMemo } from 'react';
import { LineItem, DiscountType, AppointmentTotals, PricingPolicy } from '@/types/pricing';
import { calculateAppointmentTotals, formatCurrency } from '@/lib/pricingEngine';

// Default policy (these would come from API in production)
const DEFAULT_POLICY: PricingPolicy = {
  discountThresholdPercent: 15,
  requireReasonAboveThreshold: true,
  floorPriceRules: {},
  approverRoles: ['manager', 'admin'],
};

export function usePricingState(initialItems: LineItem[] = []) {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialItems);
  const [globalDiscountType, setGlobalDiscountType] = useState<DiscountType>('flat');
  const [globalDiscountValue, setGlobalDiscountValue] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [policy] = useState<PricingPolicy>(DEFAULT_POLICY);

  // Calculate totals whenever line items or discounts change
  const calculatedTotals = useMemo(() => {
    return calculateAppointmentTotals({
      lineItems,
      globalDiscountType: globalDiscountValue > 0 ? globalDiscountType : undefined,
      globalDiscountValue: globalDiscountValue > 0 ? globalDiscountValue : undefined,
    });
  }, [lineItems, globalDiscountType, globalDiscountValue]);

  // Update a line item
  const updateLineItem = (itemId: string, updates: Partial<LineItem>) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...updates,
              editedAt: new Date(),
              editedBy: 'current-user', // TODO: Get from auth context
            }
          : item
      )
    );
  };

  // Update line item price
  const updateLineItemPrice = (itemId: string, newPrice: number, reason?: string) => {
    updateLineItem(itemId, {
      overridePrice: newPrice,
      editedReason: reason,
      approval: newPrice < (lineItems.find((i) => i.id === itemId)?.floorPrice || 0)
        ? { required: true, status: 'pending' }
        : undefined,
    });
  };

  // Apply line discount
  const applyLineDiscount = (
    itemId: string,
    discountType: DiscountType,
    value: number,
    reason?: string
  ) => {
    const updates: Partial<LineItem> = {
      editedReason: reason,
    };

    if (discountType === 'flat') {
      updates.lineDiscountAmount = value;
      updates.lineDiscountPercent = undefined;
    } else {
      updates.lineDiscountPercent = value;
      updates.lineDiscountAmount = undefined;
    }

    // Check if requires approval based on threshold
    if (value > policy.discountThresholdPercent && discountType === 'percent') {
      updates.approval = { required: true, status: 'pending' };
    }

    updateLineItem(itemId, updates);
  };

  // Waive off item (set to ₹0)
  const waiveOffItem = (itemId: string, reason: string) => {
    updateLineItem(itemId, {
      overridePrice: 0,
      editedReason: reason,
      approval: { required: true, status: 'pending' },
    });
  };

  // Add line item
  const addLineItem = (item: LineItem) => {
    setLineItems((prev) => [...prev, item]);
  };

  // Remove line item
  const removeLineItem = (itemId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Apply coupon (mock implementation)
  const applyCoupon = (code: string) => {
    // TODO: Call API to validate coupon
    // For now, mock implementation
    if (code.toUpperCase() === 'SAVE10') {
      setGlobalDiscountType('percent');
      setGlobalDiscountValue(10);
      return { success: true, message: '10% discount applied!' };
    }
    return { success: false, message: 'Invalid coupon code' };
  };

  return {
    lineItems,
    globalDiscountType,
    globalDiscountValue,
    couponCode,
    policy,
    totals: calculatedTotals,
    updateLineItemPrice,
    applyLineDiscount,
    waiveOffItem,
    addLineItem,
    removeLineItem,
    setGlobalDiscountType,
    setGlobalDiscountValue,
    setCouponCode,
    applyCoupon,
  };
}
