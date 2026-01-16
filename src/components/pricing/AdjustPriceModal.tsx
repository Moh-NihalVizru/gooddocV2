import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LineItem, DiscountType } from '@/types/pricing';
import { formatCurrency, validatePriceEdit, validateDiscount } from '@/lib/pricingEngine';

interface AdjustPriceModalProps {
  open: boolean;
  onClose: () => void;
  item: LineItem;
  onApply: (updates: {
    overridePrice?: number;
    lineDiscountType?: DiscountType;
    lineDiscountValue?: number;
    reason?: string;
    approver?: string;
  }) => void;
  policy: {
    floorPrice: number;
    discountThresholdPercent: number;
  };
}

export function AdjustPriceModal({ open, onClose, item, onApply, policy }: AdjustPriceModalProps) {
  const [overridePrice, setOverridePrice] = useState<string>('');
  const [useOverride, setUseOverride] = useState(false);
  const [lineDiscountType, setLineDiscountType] = useState<DiscountType>('percent');
  const [lineDiscountValue, setLineDiscountValue] = useState<string>('');
  const [useLineDiscount, setUseLineDiscount] = useState(false);
  const [reason, setReason] = useState('');
  const [approver, setApprover] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      // Pre-fill with current values
      if (item.overridePrice !== undefined) {
        setOverridePrice(item.overridePrice.toString());
        setUseOverride(true);
      }
      if (item.lineDiscountAmount !== undefined) {
        setLineDiscountValue(item.lineDiscountAmount.toString());
        setLineDiscountType('flat');
        setUseLineDiscount(true);
      } else if (item.lineDiscountPercent !== undefined) {
        setLineDiscountValue(item.lineDiscountPercent.toString());
        setLineDiscountType('percent');
        setUseLineDiscount(true);
      }
      setReason(item.editedReason || '');
    }
  }, [open, item]);

  const calculateNetPrice = () => {
    const base = item.overridePrice ?? item.basePrice;
    let netPrice = useOverride ? (parseFloat(overridePrice) || 0) : base;

    if (useLineDiscount && lineDiscountValue) {
      const discountVal = parseFloat(lineDiscountValue) || 0;
      if (lineDiscountType === 'flat') {
        netPrice = Math.max(0, netPrice - discountVal);
      } else {
        netPrice = Math.max(0, netPrice - (netPrice * discountVal / 100));
      }
    }

    return netPrice;
  };

  const handleApply = () => {
    const newErrors: string[] = [];
    let requiresApproval = false;
    let requiresReason = false;

    // Validate override price
    if (useOverride) {
      const price = parseFloat(overridePrice);
      if (isNaN(price)) {
        newErrors.push('Invalid override price');
      } else {
        const validation = validatePriceEdit(item, price, policy);
        if (!validation.isValid) {
          newErrors.push(...validation.errors);
        }
        requiresApproval = validation.requiresApproval;
        requiresReason = validation.requiresReason;
      }
    }

    // Validate line discount
    if (useLineDiscount) {
      const discountVal = parseFloat(lineDiscountValue);
      if (isNaN(discountVal)) {
        newErrors.push('Invalid discount value');
      } else {
        const effectivePrice = useOverride ? parseFloat(overridePrice) : item.basePrice;
        const validation = validateDiscount(lineDiscountType, discountVal, effectivePrice);
        if (!validation.isValid) {
          newErrors.push(...validation.errors);
        }

        // Check threshold
        if (lineDiscountType === 'percent' && discountVal > policy.discountThresholdPercent) {
          requiresReason = true;
        }
      }
    }

    // Reason requirement removed

    // Check approver requirement
    if (requiresApproval && !approver.trim()) {
      newErrors.push('Approver required for this change');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Apply changes
    const updates: any = {
      reason: reason.trim() || undefined,
      approver: approver.trim() || undefined,
    };

    if (useOverride) {
      updates.overridePrice = parseFloat(overridePrice);
    }

    if (useLineDiscount) {
      updates.lineDiscountType = lineDiscountType;
      updates.lineDiscountValue = parseFloat(lineDiscountValue);
    }

    onApply(updates);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setOverridePrice('');
    setUseOverride(false);
    setLineDiscountValue('');
    setUseLineDiscount(false);
    setReason('');
    setApprover('');
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Price - {item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Base Price (read-only) */}
          <div>
            <Label className="text-xs text-muted-foreground">Base price</Label>
            <p className="text-sm font-medium">₹{formatCurrency(item.basePrice)}</p>
          </div>

          {/* Override Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="override-price">Override price</Label>
              <Switch checked={useOverride} onCheckedChange={setUseOverride} />
            </div>
            {useOverride && (
              <Input
                id="override-price"
                type="number"
                value={overridePrice}
                onChange={(e) => setOverridePrice(e.target.value)}
                placeholder="Enter new price"
              />
            )}
          </div>

          {/* Line Discount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="line-discount">Line discount</Label>
              <Switch checked={useLineDiscount} onCheckedChange={setUseLineDiscount} />
            </div>
            {useLineDiscount && (
              <div className="flex gap-2">
                <Input
                  id="line-discount"
                  type="number"
                  value={lineDiscountValue}
                  onChange={(e) => setLineDiscountValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button
                  variant={lineDiscountType === 'flat' ? 'default' : 'outline'}
                  onClick={() => setLineDiscountType('flat')}
                  className="w-16"
                >
                  ₹
                </Button>
                <Button
                  variant={lineDiscountType === 'percent' ? 'default' : 'outline'}
                  onClick={() => setLineDiscountType('percent')}
                  className="w-16"
                >
                  %
                </Button>
              </div>
            )}
          </div>

          {/* Net Price Preview */}
          <div className="p-3 bg-muted rounded-md">
            <Label className="text-xs text-muted-foreground">Net line price (preview)</Label>
            <p className="text-lg font-semibold text-primary">₹{formatCurrency(calculateNetPrice())}</p>
          </div>

          {/* Approver (conditional) */}
          <div className="space-y-2">
            <Label htmlFor="approver">Approver (optional)</Label>
            <Input
              id="approver"
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              placeholder="Required if below floor price or over threshold"
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <ul className="text-xs text-destructive space-y-1">
                {errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
