import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentsTab } from "./tabs/AppointmentsTab";
import { InvoicesTab } from "./tabs/InvoicesTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { CollectPaymentTab } from "./tabs/CollectPaymentTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { InsuranceTab } from "./tabs/InsuranceTab";
import { PatientDetailsTab } from "./tabs/PatientDetailsTab";
import { TimelineTab } from "./tabs/TimelineTab";
import { VisitSelector } from "./VisitSelector";
import { Visit } from "./VisitListItem";
import { 
  Calendar, 
  FileText, 
  CreditCard, 
  History, 
  FolderOpen, 
  Shield, 
  ArrowLeftRight, 
  User 
} from "lucide-react";

interface Patient {
  name: string;
  gdid: string;
  title: string;
  age: number;
  gender: string;
  dob: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  address: string;
  pincode: string;
  state: string;
  city: string;
  country: string;
}

interface VisitDetailsTabsProps {
  selectedVisit: Visit | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  patient: Patient;
  isIPPatient?: boolean;
}

const allTabs = [
  { value: "appointments", label: "Appointments", icon: Calendar, ipOnly: false },
  { value: "collect-payment", label: "Bills & Payments", icon: CreditCard, ipOnly: false },
  { value: "payments", label: "Transaction History", icon: History, ipOnly: false },
  { value: "documents", label: "Documents", icon: FolderOpen, ipOnly: false },
  { value: "timeline", label: "Bed Transfers", icon: ArrowLeftRight, ipOnly: true },
  { value: "insurance", label: "Insurance", icon: Shield, ipOnly: false },
  { value: "patient-details", label: "Patient Details", icon: User, ipOnly: false },
];

export function VisitDetailsTabs({ selectedVisit, activeTab, onTabChange, patient, isIPPatient = false }: VisitDetailsTabsProps) {
  const tabs = allTabs.filter(tab => !tab.ipOnly || isIPPatient);
  
  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex flex-col h-full">
        {/* Sticky Tab Bar */}
        <div className="sticky top-0 bg-card z-10 border-b border-border">
          <div className="flex items-center gap-4 px-6 py-3">
            <VisitSelector />
            <TabsList className="h-11 bg-muted/50 p-1 gap-0.5 rounded-md justify-start w-auto inline-flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="gap-2 text-sm px-4 h-9 rounded-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="appointments" className="mt-0">
            <AppointmentsTab selectedVisit={selectedVisit} patient={patient} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0 h-full">
            <TimelineTab selectedVisit={selectedVisit} />
          </TabsContent>


          <TabsContent value="collect-payment" className="mt-0 h-full">
            <CollectPaymentTab selectedVisit={selectedVisit} />
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <PaymentsTab selectedVisit={selectedVisit} />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <DocumentsTab selectedVisit={selectedVisit} />
          </TabsContent>

          <TabsContent value="insurance" className="mt-0">
            <InsuranceTab selectedVisit={selectedVisit} />
          </TabsContent>

          <TabsContent value="patient-details" className="mt-0">
            <PatientDetailsTab patient={patient} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
