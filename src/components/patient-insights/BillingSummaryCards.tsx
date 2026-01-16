import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BillingSummaryCardsProps {
  billedAmount: string;
  unbilledAmount: string;
  totalDue: string;
  advanceAmount: string;
  collectedAmount: string;
  balanceAmount: string;
  patientId?: string;
  patientName?: string;
  admissionId?: string;
  variant?: "default" | "light";
}

export function BillingSummaryCards({
  billedAmount,
  unbilledAmount,
  totalDue,
  advanceAmount,
  collectedAmount,
  balanceAmount,
  patientId,
  patientName = "Patient",
  admissionId = "ADM-2026-001",
}: BillingSummaryCardsProps) {
  const navigate = useNavigate();
  
  // Calculate advance balance (advance - used portion)
  const advanceNum = parseFloat(advanceAmount.replace(/[₹,]/g, '')) || 0;
  const advanceBalance = `₹${(advanceNum).toLocaleString('en-IN')}`;

  const handlePayableClick = () => {
    if (patientId) {
      // Emit analytics event (stubbed)
      console.log('onOpenGenerateInterim', {
        patientId,
        admissionId,
        source: 'totalPayableCard'
      });
      // Navigate to the Generate Interim Bill page
      const params = new URLSearchParams({
        amount: balanceAmount,
        name: patientName,
        admissionId: admissionId,
        from: 'ip-patients',
      });
      navigate(`/patient-insights/${patientId}/interim-bill?${params.toString()}`);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Billing Summary Card */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 px-4 py-3 min-w-[200px] hover:bg-white/15 transition-colors">
        <p className="text-white text-xs pb-2 border-b border-white/25 mb-2">
          Billing Summary
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/70 text-[11px]">Billed Amount</span>
            <span className="text-white font-medium text-sm tabular-nums">{billedAmount}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/70 text-[11px]">Unbilled Amount</span>
            <span className="text-white/90 text-xs tabular-nums">{unbilledAmount}</span>
          </div>
        </div>
      </Card>

      {/* Collection Status Card */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 px-4 py-3 min-w-[200px] hover:bg-white/15 transition-colors">
        <p className="text-white text-xs pb-2 border-b border-white/25 mb-2">
          Collection Status
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/70 text-[11px]">Advance Paid</span>
            <span className="text-emerald-300 font-medium text-sm tabular-nums">{advanceAmount}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/70 text-[11px]">Advance Balance</span>
            <span className="text-white/90 text-xs tabular-nums">{advanceBalance}</span>
          </div>
        </div>
      </Card>

      {/* Total Due Amount Card - Hero Card */}
      <Card 
        className="bg-white/15 backdrop-blur-sm border-white/30 px-4 py-3 min-w-[220px] hover:bg-white/20 transition-colors ring-1 ring-white/10"
        data-testid="card-total-payable"
      >
        <div className="flex items-baseline justify-between pb-2 border-b border-white/25 mb-2">
          <p className="text-white text-xs">Total Due Amount</p>
          <span className="text-white font-semibold text-base tabular-nums">{totalDue}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/70 text-[11px]">Total Paid</span>
            <span className="text-emerald-300 text-xs tabular-nums">−{collectedAmount}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handlePayableClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePayableClick();
                    }
                  }}
                  role="button"
                  aria-label="Generate interim bill from Total Payable"
                  tabIndex={0}
                  className="flex items-center justify-between gap-4 pt-1 border-t border-white/15 w-full hover:bg-white/10 rounded transition-colors cursor-pointer focus:outline-none"
                  data-testid="open-generate-interim"
                >
                  <span className="text-white text-[11px]">Total Payable</span>
                  <span className="text-amber-300 font-semibold text-sm tabular-nums underline underline-offset-2">{balanceAmount}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Generate interim bill
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
}
