import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/pricingEngine';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { AppointmentTotals } from '@/types/pricing';
import { useSidebarContext } from '@/contexts/SidebarContext';

interface StickyFooterBarProps {
  totals: AppointmentTotals;
  itemCount: number;
  onGenerateInvoice?: () => void;
  // Single consultation mode props
  singleConsultationMode?: boolean;
  onAskConfirmation?: () => void;
  onScheduleNow?: () => void;
  isScheduleDisabled?: boolean;
}

export function StickyFooterBar({ 
  totals, 
  itemCount, 
  onGenerateInvoice,
  singleConsultationMode = false,
  onAskConfirmation,
  onScheduleNow,
  isScheduleDisabled = false,
}: StickyFooterBarProps) {
  const { flags } = useFeatureFlags();
  const { isCollapsed } = useSidebarContext();

  if (!flags.globalDiscount_stickyBar) {
    return null;
  }

  const globalDiscountAmount =
    totals.globalDiscountType && totals.globalDiscountValue
      ? totals.globalDiscountType === 'flat'
        ? totals.globalDiscountValue
        : (totals.subtotal * totals.globalDiscountValue) / 100
      : 0;

  return (
    <div 
      className="fixed bottom-0 right-0 bg-background border-t border-border shadow-lg z-40 transition-all duration-300"
      style={{ left: isCollapsed ? '60px' : '220px' }}
    >
      <div className="max-w-[1600px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs text-muted-foreground">Total Items</p>
              <p className="text-sm font-semibold">{itemCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Subtotal</p>
              <p className="text-sm font-semibold">₹{formatCurrency(totals.subtotal)}</p>
            </div>
            {globalDiscountAmount > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Global Discount</p>
                <p className="text-sm font-semibold text-green-600">
                  -₹{formatCurrency(globalDiscountAmount)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Net Payable</p>
              <p className="text-lg font-bold text-primary">
                ₹{formatCurrency(totals.netPayable)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {singleConsultationMode ? (
              <>
                <Button size="lg" variant="outline" onClick={onAskConfirmation}>
                  Ask Confirmation
                </Button>
                <Button size="lg" onClick={onScheduleNow} disabled={isScheduleDisabled}>
                  Schedule Now
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" variant="outline" onClick={() => window.history.back()}>
                  Back
                </Button>
                <Button size="lg" onClick={onGenerateInvoice}>
                  Generate Invoice
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
