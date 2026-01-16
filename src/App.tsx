import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { ClockProvider } from "@/contexts/ClockContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Auth from "./pages/Auth";
import Overview from "./pages/Overview";
import NewAppointment from "./pages/NewAppointment";
import Registration from "./pages/Registration";
import BookAppointment from "./pages/BookAppointment";
import Inbox from "./pages/Inbox";
import Payment from "./pages/Payment";
import PatientInsights from "./pages/PatientInsights";
import PatientTimeline from "./pages/PatientTimeline";
import PatientServices from "./pages/PatientServices";
import Payments from "./pages/Payments";
import Discharge from "./pages/Discharge";
import DischargeFlow from "./pages/DischargeFlow";
import DischargePayment from "./pages/DischargePayment";
import DoctorsList from "./pages/DoctorsList";
import DoctorDetail from "./pages/DoctorDetail";
import DoctorForm from "./pages/DoctorForm";
import DoctorSchedulePage from "./pages/DoctorSchedulePage";
import DoctorCalendarPage from "./pages/DoctorCalendarPage";
import NotFound from "./pages/NotFound";
import DiagnosticsWorklist from "./pages/DiagnosticsWorklist";
import LaboratoryResults from "./pages/LaboratoryResults";
import RadiologyResults from "./pages/RadiologyResults";
import OutpatientAppointments from "./pages/OutpatientAppointments";
import Patient360 from "./pages/Patient360";
import Patients from "./pages/Patients";
import RecordVitals from "./pages/RecordVitals";
import Insurance from "./pages/Insurance";
import NewClaim from "./pages/NewClaim";
import PricingCatalog from "./pages/PricingCatalog";
import AddPricingItem from "./pages/AddPricingItem";
import Pharmacy from "./pages/Pharmacy";
import Reports from "./pages/Reports";
import OPPatientsToday from "./pages/OPPatientsToday";
import IPPatients from "./pages/IPPatients";
import CheckInPatients from "./pages/CheckInPatients";
import DischargedToday from "./pages/DischargedToday";
import DoctorsOnDuty from "./pages/DoctorsOnDuty";
import ScheduledToday from "./pages/ScheduledToday";
import LabReportsPending from "./pages/LabReportsPending";
import SurgeriesToday from "./pages/SurgeriesToday";
import EmergencyCases from "./pages/EmergencyCases";
import PharmacyPending from "./pages/PharmacyPending";
import RadiologyQueue from "./pages/RadiologyQueue";
import LowStockItems from "./pages/LowStockItems";
import PatientSearch from "./pages/PatientSearch";
import TransfersList from "./pages/TransfersList";
import DepartmentDetail from "./pages/DepartmentDetail";
import DepartmentsList from "./pages/DepartmentsList";
import BillsList from "./pages/BillsList";
import BedCharges from "./pages/BedCharges";
import TransferPatient from "./pages/TransferPatient";
import AdvancePayments from "./pages/AdvancePayments";
import DiagnosticsList from "./pages/DiagnosticsList";
import PatientAdvanceCollection from "./pages/PatientAdvanceCollection";
import GenerateInterimBill from "./pages/GenerateInterimBill";
import AddBed from "./pages/AddBed";

const queryClient = new QueryClient();

// Helper component to wrap protected routes
const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RealtimeProvider>
      <ClockProvider>
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public route - Auth */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes */}
                <Route path="/" element={<Protected><Overview /></Protected>} />
                <Route path="/inbox" element={<Protected><Inbox /></Protected>} />
                <Route path="/new-appointment" element={<Protected><NewAppointment /></Protected>} />
                <Route path="/registration" element={<Protected><Registration /></Protected>} />
                <Route path="/book-appointment" element={<Protected><BookAppointment /></Protected>} />
                <Route path="/payment" element={<Protected><Payment /></Protected>} />
                <Route path="/patient-insights/:patientId" element={<Protected><PatientInsights /></Protected>} />
                <Route path="/patient-insights/:patientId/timeline" element={<Protected><PatientTimeline /></Protected>} />
                <Route path="/patient-insights/:patientId/services" element={<Protected><PatientServices /></Protected>} />
                <Route path="/patient-insights/:patientId/payments" element={<Protected><PatientAdvanceCollection /></Protected>} />
                <Route path="/patient-insights/:patientId/discharge" element={<Protected><Discharge /></Protected>} />
                <Route path="/patient-insights/:patientId/discharge/payment" element={<Protected><DischargePayment /></Protected>} />
                <Route path="/patients/:patientId/encounters/:encounterId/discharge" element={<Protected><DischargeFlow /></Protected>} />
                <Route path="/patient-insights/:patientId/transfer" element={<Protected><TransferPatient /></Protected>} />
                <Route path="/patient-insights/:patientId/interim-bill" element={<Protected><GenerateInterimBill /></Protected>} />
                <Route path="/doctors" element={<Protected><DoctorsList /></Protected>} />
                <Route path="/doctors/new" element={<Protected><DoctorForm /></Protected>} />
                <Route path="/doctors/:id" element={<Protected><DoctorDetail /></Protected>} />
                <Route path="/doctors/:id/edit" element={<Protected><DoctorForm /></Protected>} />
                <Route path="/doctors/:id/schedule" element={<Protected><DoctorSchedulePage /></Protected>} />
                <Route path="/doctors/:id/calendar" element={<Protected><DoctorCalendarPage /></Protected>} />
                <Route path="/diagnostics" element={<Protected><DiagnosticsWorklist /></Protected>} />
                <Route path="/diagnostics/lab/:orderId" element={<Protected><LaboratoryResults /></Protected>} />
                <Route path="/diagnostics/radiology/:orderId" element={<Protected><RadiologyResults /></Protected>} />
                <Route path="/appointments/outpatient" element={<Protected><OutpatientAppointments /></Protected>} />
                <Route path="/patients/:gdid/360" element={<Protected><Patient360 /></Protected>} />
                <Route path="/patients" element={<Protected><Patients /></Protected>} />
                <Route path="/patients/search" element={<Protected><PatientSearch /></Protected>} />
                <Route path="/vitals/new" element={<Protected><RecordVitals /></Protected>} />
                <Route path="/patient-insights/:patientId/insurance" element={<Protected><Insurance /></Protected>} />
                <Route path="/insurance/claims/new" element={<Protected><NewClaim /></Protected>} />
                <Route path="/pricing-catalog" element={<Protected><PricingCatalog /></Protected>} />
                <Route path="/pricing-catalog/new" element={<Protected><AddPricingItem /></Protected>} />
                <Route path="/pharmacy" element={<Protected><Pharmacy /></Protected>} />
                <Route path="/reports" element={<Protected><Reports /></Protected>} />
                {/* Overview drill-down routes */}
                <Route path="/patients/op" element={<Protected><OPPatientsToday /></Protected>} />
                <Route path="/patients/ip" element={<Protected><IPPatients /></Protected>} />
                <Route path="/patients/check-in" element={<Protected><CheckInPatients /></Protected>} />
                <Route path="/beds/add" element={<Protected><AddBed /></Protected>} />
                <Route path="/patients/discharged" element={<Protected><DischargedToday /></Protected>} />
                <Route path="/doctors/on-duty" element={<Protected><DoctorsOnDuty /></Protected>} />
                <Route path="/schedule/today" element={<Protected><ScheduledToday /></Protected>} />
                <Route path="/diagnostics/orders" element={<Protected><DiagnosticsList /></Protected>} />
                <Route path="/lab/pending" element={<Protected><LabReportsPending /></Protected>} />
                <Route path="/or/surgeries" element={<Protected><SurgeriesToday /></Protected>} />
                <Route path="/er/cases" element={<Protected><EmergencyCases /></Protected>} />
                <Route path="/pharmacy/pending" element={<Protected><PharmacyPending /></Protected>} />
                <Route path="/radiology/queue" element={<Protected><RadiologyQueue /></Protected>} />
                <Route path="/inventory/low-stock" element={<Protected><LowStockItems /></Protected>} />
                <Route path="/patients/transfers" element={<Protected><TransfersList /></Protected>} />
                <Route path="/departments" element={<Protected><DepartmentsList /></Protected>} />
                <Route path="/departments/:departmentId" element={<Protected><DepartmentDetail /></Protected>} />
                <Route path="/reports/revenue" element={<Protected><BillsList /></Protected>} />
                <Route path="/reports/advance-payments" element={<Protected><AdvancePayments /></Protected>} />
                <Route path="/settings/bed-charges" element={<Protected><BedCharges /></Protected>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </TooltipProvider>
      </ClockProvider>
    </RealtimeProvider>
  </QueryClientProvider>
);

export default App;
