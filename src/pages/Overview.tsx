import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarWidget } from "@/components/CalendarWidget";
import { OverviewKpiCard } from "@/components/overview/OverviewKpiCard";
import { postToWorkflow } from "@/services/apiService";
import { toast } from "sonner";
import { 
  BedDouble, 
  Stethoscope, 
  CalendarClock, 
  Scissors,
  AlertTriangle,
  Pill,
  PackageOpen,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

import iconOpPatients from "@/assets/icon-op-patients.svg";
import iconIpPatients from "@/assets/icon-ip-patients.svg";
import iconDiagnostics from "@/assets/icon-diagnostics.svg";
import iconRevenue from "@/assets/icon-revenue.svg";

interface SubMetric {
  label: string;
  value: number | string;
  filterParam?: string;
  route?: string;
}

interface MetricCardProps {
  title: string;
  count: number;
  displayCount?: string;
  icon: React.ElementType;
  route: string;
  iconColorClass: string;
  isPrimary?: boolean;
  subMetrics?: SubMetric[];
  badge?: string;
}

const iconColors = {
  patients: "text-foreground",
  doctors: "text-foreground",
  labs: "text-foreground",
  surgery: "text-foreground",
  emergency: "text-foreground",
  pharmacy: "text-foreground",
  inventory: "text-foreground",
};

const StandardMetricCard = ({ 
  title, 
  count,
  displayCount,
  icon: Icon, 
  route, 
  iconColorClass,
  badge,
}: MetricCardProps) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(route)}
      aria-label={`Open ${title} list (${count})`}
      className="
        group w-full text-left rounded-xl border border-border bg-card
        transition-all duration-200 ease-out
        hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5
        active:scale-[0.98]
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        h-[90px] px-4 flex items-center gap-3
      "
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-border shadow-sm shrink-0">
        <Icon className={`w-5 h-5 ${iconColorClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-1.5px" }}>
            {displayCount ? (
              displayCount.includes('|') ? (
                <>
                  {displayCount.split('|')[0].trim()}
                  <span className="text-[14px] font-medium text-muted-foreground" style={{ fontWeight: 500, letterSpacing: "normal" }}>{displayCount.split('|').slice(1).join('|')}</span>
                </>
              ) : displayCount
            ) : count.toLocaleString()}
          </p>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold shadow-sm">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground truncate">
          {title}
        </p>
      </div>
      <ChevronRight 
        aria-hidden="true"
        className="w-5 h-5 text-primary/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" 
      />
    </button>
  );
};

const API_ENDPOINT = "gdv2landingpage6969d482b3f38";

interface OverviewData {
  appointmentRequests?: number;
  doctorsOnDuty?: number;
  medicineOrders?: number;
  bedsAvailable?: number;
  bedsICU?: number;
  bedsWard?: number;
  surgeries?: number;
  emergencyCases?: number;
  lowStock?: number;
  opPatients?: number;
  opPatientsCompleted?: number;
  opPatientsPending?: number;
  ipPatients?: number;
  ipPatientsICU?: number;
  ipPatientsWard?: number;
  ipNewAdmissions?: number;
  ipDischarged?: number;
  diagnostics?: number;
  diagnosticsLaboratory?: number;
  diagnosticsRadiology?: number;
  revenue?: string;
  revenueBillsPaid?: number;
  revenueOutstanding?: string;
  revenueAdvance?: string;
}

const Overview = () => {
  const navigate = useNavigate();
  const [overviewData, setOverviewData] = useState<OverviewData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchOverviewData = async () => {
    // Get user email and ID from localStorage
    const userEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

    if (!userEmail || !userId) {
      toast.error("User authentication required. Please login again.");
      navigate("/login");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const payload = {
        action: "getLandingPageData",
        email: userEmail,
        userId,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      };

      const { data, error: apiError } = await postToWorkflow<any>(
        API_ENDPOINT,
        payload,
        controller.signal
      );

      if (controller.signal.aborted) return;
      if (apiError) throw new Error(apiError);

      if (!data || !data[0]) {
        if (isMountedRef.current) {
          setOverviewData({});
        }
        return;
      }

      // Process the response data
      // The API response structure may vary, adjust based on actual response
      const responseData = data[0];
      
      // Map the response to our OverviewData interface
      // Adjust field names based on actual API response structure
      const mappedData: OverviewData = {
        appointmentRequests: parseInt(responseData.appointmentRequests || responseData.appointment_requests || "0") || 0,
        doctorsOnDuty: parseInt(responseData.doctorsOnDuty || responseData.doctors_on_duty || "0") || 0,
        medicineOrders: parseInt(responseData.medicineOrders || responseData.medicine_orders || "0") || 0,
        bedsAvailable: parseInt(responseData.bedsAvailable || responseData.beds_available || "0") || 0,
        bedsICU: parseInt(responseData.bedsICU || responseData.beds_icu || "0") || 0,
        bedsWard: parseInt(responseData.bedsWard || responseData.beds_ward || "0") || 0,
        surgeries: parseInt(responseData.surgeries || "0") || 0,
        emergencyCases: parseInt(responseData.emergencyCases || responseData.emergency_cases || "0") || 0,
        lowStock: parseInt(responseData.lowStock || responseData.low_stock || "0") || 0,
        opPatients: parseInt(responseData.opPatients || responseData.op_patients || "0") || 0,
        opPatientsCompleted: parseInt(responseData.opPatientsCompleted || responseData.op_patients_completed || "0") || 0,
        opPatientsPending: parseInt(responseData.opPatientsPending || responseData.op_patients_pending || "0") || 0,
        ipPatients: parseInt(responseData.ipPatients || responseData.ip_patients || "0") || 0,
        ipPatientsICU: parseInt(responseData.ipPatientsICU || responseData.ip_patients_icu || "0") || 0,
        ipPatientsWard: parseInt(responseData.ipPatientsWard || responseData.ip_patients_ward || "0") || 0,
        ipNewAdmissions: parseInt(responseData.ipNewAdmissions || responseData.ip_new_admissions || "0") || 0,
        ipDischarged: parseInt(responseData.ipDischarged || responseData.ip_discharged || "0") || 0,
        diagnostics: parseInt(responseData.diagnostics || "0") || 0,
        diagnosticsLaboratory: parseInt(responseData.diagnosticsLaboratory || responseData.diagnostics_laboratory || "0") || 0,
        diagnosticsRadiology: parseInt(responseData.diagnosticsRadiology || responseData.diagnostics_radiology || "0") || 0,
        revenue: responseData.revenue || "0",
        revenueBillsPaid: parseInt(responseData.revenueBillsPaid || responseData.revenue_bills_paid || "0") || 0,
        revenueOutstanding: responseData.revenueOutstanding || responseData.revenue_outstanding || "₹0/0",
        revenueAdvance: responseData.revenueAdvance || responseData.revenue_advance || "₹0/0",
      };

      if (isMountedRef.current) {
        setOverviewData(mappedData);
        setError(null);
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to load overview data:", error);
      const errorMessage = error.message || "Failed to load overview data";
      if (isMountedRef.current) {
        setError(errorMessage);
        toast.error("Failed to load overview data", {
          description: errorMessage,
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchOverviewData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Top row cards (first 4) - populated from API data
  const topRowCards: MetricCardProps[] = [
    {
      title: "Appointment request received",
      count: overviewData.appointmentRequests || 0,
      displayCount: (overviewData.appointmentRequests || 0).toString(),
      icon: CalendarClock,
      route: "/schedule/today?date=today",
      iconColorClass: iconColors.doctors,
      badge: overviewData.appointmentRequests ? "new" : undefined,
    },
    {
      title: "Doctors on Duty",
      count: overviewData.doctorsOnDuty || 0,
      icon: Stethoscope,
      route: "/doctors/on-duty?shift=current",
      iconColorClass: iconColors.doctors,
    },
    {
      title: "Total medicine orders",
      count: overviewData.medicineOrders || 0,
      icon: Pill,
      route: "/pharmacy/pending?status=pending",
      iconColorClass: iconColors.pharmacy,
    },
    {
      title: "Beds Availability",
      count: overviewData.bedsAvailable || 0,
      displayCount: overviewData.bedsAvailable 
        ? `${overviewData.bedsAvailable}| ICU: ${overviewData.bedsICU || 0} • Ward: ${overviewData.bedsWard || 0}`
        : "0",
      icon: BedDouble,
      route: "/patients/check-in?date=today",
      iconColorClass: iconColors.patients,
    },
  ];

  // Bottom row cards - populated from API data
  const bottomRowCards: MetricCardProps[] = [
    {
      title: "Surgeries",
      count: overviewData.surgeries || 0,
      icon: Scissors,
      route: "/or/surgeries?date=today",
      iconColorClass: iconColors.surgery,
    },
    {
      title: "Emergency Cases",
      count: overviewData.emergencyCases || 0,
      icon: AlertTriangle,
      route: "/er/cases?status=active",
      iconColorClass: iconColors.emergency,
    },
    {
      title: "Low Stock",
      count: overviewData.lowStock || 0,
      icon: PackageOpen,
      route: "/inventory/low-stock",
      iconColorClass: iconColors.inventory,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={["Overview"]} />
        
        <main className="p-6">
          {/* Header Card */}
          <Card className="p-5 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-foreground">Today's Summary</h1>
              <div className="flex items-center gap-4">
                <CalendarWidget pageKey="overview" showSubtext={true} />
                {error && (
                  <Button 
                    onClick={fetchOverviewData} 
                    variant="outline" 
                    size="sm"
                    className="h-9"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                )}
                <Button onClick={() => navigate("/new-appointment")} className="h-9">
                  <Plus className="w-4 h-4 mr-1" />
                  New Appointment
                </Button>
                <Button onClick={() => navigate("/new-appointment", { state: { flowType: "ip-admission" } })} className="h-9 bg-[#16a34a] hover:bg-[#16a34a]/90 text-white border-none">
                  <BedDouble className="w-4 h-4 mr-1" />
                  IP Admission
                </Button>
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="p-8 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading overview data...</p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="p-6 mb-6 border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Failed to load overview data</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
                <Button onClick={fetchOverviewData} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {/* Priority KPI Cards Row - New Design */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <OverviewKpiCard
                title="OP Patients"
                kpiValue={(overviewData.opPatients || 0).toString()}
                iconSrc={iconOpPatients}
                route="/patients/op?date=today"
                bullets={[{ text: "Patients" }]}
                chips={[
                  { 
                    label: "Visit Completed", 
                    value: (overviewData.opPatientsCompleted || 0).toString(), 
                    route: "/patients/op?date=today&visitStatus=Completed" 
                  },
                  { 
                    label: "Check in Pending", 
                    value: (overviewData.opPatientsPending || 0).toString(), 
                    route: "/patients/op?date=today&visitStatus=In_Queue" 
                  },
                ]}
              />
              <OverviewKpiCard
                title="IP Patients"
                kpiValue={(overviewData.ipPatients || 0).toString()}
                iconSrc={iconIpPatients}
                route="/patients/ip?status=admitted"
                bullets={[
                  { text: `ICU ${overviewData.ipPatientsICU || 0}` }, 
                  { text: `Ward ${overviewData.ipPatientsWard || 0}` }
                ]}
                chips={[
                  { 
                    label: "New Admission", 
                    value: (overviewData.ipNewAdmissions || 0).toString(), 
                    route: "/patients/ip?status=admitted&admittedToday=true" 
                  },
                  { 
                    label: "Discharged", 
                    value: (overviewData.ipDischarged || 0).toString(), 
                    route: "/patients/discharged?date=today" 
                  },
                ]}
              />
              <OverviewKpiCard
                title="Diagnostics"
                kpiValue={(overviewData.diagnostics || 0).toString()}
                iconSrc={iconDiagnostics}
                route="/diagnostics/orders"
                bullets={[{ text: "Orders" }]}
                chips={[
                  { 
                    label: "Laboratory", 
                    value: (overviewData.diagnosticsLaboratory || 0).toString(), 
                    route: "/diagnostics/orders?type=Laboratory" 
                  },
                  { 
                    label: "Radiology", 
                    value: (overviewData.diagnosticsRadiology || 0).toString(), 
                    route: "/diagnostics/orders?type=Radiology" 
                  },
                ]}
              />
              <OverviewKpiCard
                title="Revenue"
                kpiValue={overviewData.revenue || "0"}
                iconSrc={iconRevenue}
                route="/reports/revenue?type=paid"
                bullets={[{ text: `${overviewData.revenueBillsPaid || 0} Bills Paid` }]}
                chips={[
                  { 
                    label: "Outstanding Bills", 
                    value: overviewData.revenueOutstanding || "₹0/0", 
                    route: "/reports/revenue?type=outstanding" 
                  },
                  { 
                    label: "Advance Amount", 
                    value: overviewData.revenueAdvance || "₹0/0", 
                    route: "/reports/advance-payments" 
                  },
                ]}
              />
            </div>
          )}

          {/* Top Row - Appointment, Doctors, Medicine, Beds */}
          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {topRowCards.map((card) => (
                  <StandardMetricCard key={card.title} {...card} />
                ))}
              </div>

              {/* Bottom Row - Other cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {bottomRowCards.map((card) => (
                  <StandardMetricCard key={card.title} {...card} />
                ))}
              </div>
            </>
          )}
        </main>
      </PageContent>
    </div>
  );
};

export default Overview;
