import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/pricingEngine";
import { AppointmentTotals } from "@/types/pricing";
import { useSidebarContext } from "@/contexts/SidebarContext";

interface BookingStickyFooterProps {
  totals: AppointmentTotals;
  itemCount: number;
  onAskConfirmation: () => void;
  onSchedule: () => void;
  isScheduleDisabled?: boolean;
}

export function BookingStickyFooter({
  totals,
  itemCount,
  onAskConfirmation,
  onSchedule,
  isScheduleDisabled = false,
}: BookingStickyFooterProps) {
  const { isCollapsed } = useSidebarContext();

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
            <div>
              <p className="text-xs text-muted-foreground">Net Payable</p>
              <p className="text-lg font-bold text-primary">
                ₹{formatCurrency(totals.netPayable)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button size="lg" variant="outline" onClick={onAskConfirmation}>
              Ask Confirmation
            </Button>
            <Button size="lg" onClick={onSchedule} disabled={isScheduleDisabled}>
              Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
