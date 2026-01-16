import { useState, useEffect } from "react";
import { Loader2, Banknote, Smartphone, CreditCard as CreditCardIcon, FileCheck, Building2, Shield } from "lucide-react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { ChevronLeft, Printer, Download, FileText, Pill, Receipt, ClipboardList, Plus, Trash2, User, CreditCard } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import DischargeSummary from "@/components/billing/DischargeSummary";
import InterimBill from "@/components/billing/InterimBill";
import PendingBillsCheck from "@/components/billing/PendingBillsCheck";

interface SplitPayment {
  id: string;
  amount: string;
  method: string;
}

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "cheque", label: "Cheque" },
  { value: "neft", label: "NEFT/RTGS" },
  { value: "insurance", label: "Insurance" },
];

const Discharge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { patientId } = useParams();
  const visitId = location.state?.visitId || "V25-004";
  const [applyAdvance, setApplyAdvance] = useState(false);
  const [depositExpanded, setDepositExpanded] = useState(false);
  const [adjustDeposit, setAdjustDeposit] = useState(false);
  const [confirmCounseling, setConfirmCounseling] = useState(false);
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([
    { id: "1", amount: "", method: "cash" }
  ]);
  
  // Initialize view mode based on URL param
  const initialView = searchParams.get("view") === "interim" ? "interim" : "discharge";
  const [viewMode, setViewMode] = useState<"discharge" | "interim">(initialView);
  const [showDischargeSummary, setShowDischargeSummary] = useState(false);
  const [showInterimBill, setShowInterimBill] = useState(false);
  const [isLoadingInterim, setIsLoadingInterim] = useState(false);

  // Auto-load interim bill with loading state
  useEffect(() => {
    if (initialView === "interim") {
      setIsLoadingInterim(true);
      const timer = setTimeout(() => {
        setIsLoadingInterim(false);
        setShowInterimBill(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [initialView]);

  const fromSearch = searchParams.get("from") === "search";
  const fromPage = searchParams.get("from") || "ip-patients";
  const patientSearchQuery = searchParams.get("q") || "";

  const handleBack = () => {
    if (fromSearch && patientSearchQuery) {
      navigate(`/patients/search?q=${patientSearchQuery}`);
    } else {
      navigate(`/patient-insights/${patientId}?from=${fromPage}`);
    }
  };

  const { isCollapsed } = useSidebarContext();

  // Calculate totals
  const totalBill = 32700;
  const advanceBalance = 20000;
  const insuranceApproved = 0;
  
  // Deposit calculations
  const patientDeposit = 20000;
  const depositUsed = depositExpanded ? Math.min(patientDeposit, totalBill) : 0;
  const remainingDeposit = patientDeposit - depositUsed;
  const netPayable = depositExpanded ? Math.max(0, totalBill - depositUsed) : totalBill;

  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { id: Date.now().toString(), amount: "", method: "cash" }]);
  };

  const removeSplitPayment = (id: string) => {
    if (splitPayments.length > 1) {
      setSplitPayments(splitPayments.filter(p => p.id !== id));
    }
  };

  const updateSplitPayment = (id: string, field: "amount" | "method", value: string) => {
    setSplitPayments(splitPayments.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
        <AppHeader breadcrumbs={fromSearch ? [{ label: "Search Results", onClick: handleBack }, viewMode === "interim" ? "Interim Bill" : "Discharge"] : ["Patient Insights", viewMode === "interim" ? "Interim Bill" : "Discharge"]} />
        
        {/* Compact Header */}
        <div className="h-[72px] bg-background border-b border-border flex items-center justify-between px-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Patient</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Harish Kalyan</p>
              <p className="text-xs text-muted-foreground">GDID-001 • 44Y / M</p>
            </div>
          </div>
        </div>

        <main className="p-6">

          <div className="flex gap-6 justify-center">
            {/* Left Column - Bill Summary */}
            <div className="w-[1000px] space-y-6">
              {/* Conditional Rendering based on URL param */}

              {/* Conditional Rendering */}
              {viewMode === "discharge" ? (
                <>
                  {!showDischargeSummary ? (
                    <PendingBillsCheck
                      patientName="Harish Kalyan"
                      mrn="GDID-001"
                      admissionId="ADM-2025-0142"
                      onProceedToDischarge={() => setShowDischargeSummary(true)}
                      onCollectPayment={() => navigate(`/patient-insights/${patientId}?from=${fromPage}&tab=collect-payment`)}
                    />
                  ) : (
                    <>
                      <DischargeSummary />
                      {/* Invoice Action Buttons */}
                      <div className="flex items-center justify-end mt-4 gap-3">
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download PDF
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Printer className="w-4 h-4" />
                          Print
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {isLoadingInterim || !showInterimBill ? (
                    <Card className="p-12">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading Interim Bill...</p>
                      </div>
                    </Card>
                  ) : (
                    <InterimBill onProceedToPayment={() => navigate(`/patient-insights/${patientId}/payment`)} />
                  )}
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Discharge;
