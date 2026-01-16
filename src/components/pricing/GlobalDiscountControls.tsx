import React, { useState } from 'react';
import { Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DiscountType } from '@/types/pricing';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

interface GlobalDiscountControlsProps {
  discountType: DiscountType;
  discountValue: number;
  couponCode: string;
  onDiscountTypeChange: (type: DiscountType) => void;
  onDiscountValueChange: (value: number) => void;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => void;
  maxValue: number;
}

export function GlobalDiscountControls({
  discountType,
  discountValue,
  couponCode,
  onDiscountTypeChange,
  onDiscountValueChange,
  onCouponCodeChange,
  onApplyCoupon,
  maxValue,
}: GlobalDiscountControlsProps) {
  const { flags } = useFeatureFlags();

  if (!flags.globalDiscount_summary) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Global Discount</Label>
      </div>

      {/* Discount Input */}
      <div>
        <Input
          type="number"
          value={discountValue || ''}
          onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
        />
      </div>
    </div>
  );
}
