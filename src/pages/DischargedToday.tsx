import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { dischargedPatients, dischargePending, IPPatientRecord } from "@/data/overview.mock";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Generate billing amounts based on mrn for variety
const getBillingAmount = (mrn: string) => {
  const amounts = [12500, 45000, 78000, 23400, 56700, 34500, 89000, 15600, 67800, 41200];
  const numericPart = parseInt(mrn.replace(/\D/g, '')) || 0;
  return amounts[numericPart % amounts.length];
};

const getPaymentMode = (mrn: string) => {
  const modes = ["Cash", "Card", "UPI", "Insurance", "NEFT"];
  const numericPart = parseInt(mrn.replace(/\D/g, '')) || 0;
  return modes[numericPart % modes.length];
};

const getDischargeType = (index: number) => {
  const types = ["Home", "Transfer", "AMA", "Expired", "Home"];
  return types[index % types.length];
};

const getDiagnosis = (index: number) => {
  const diagnoses = [
    "Hypertension", "Type 2 Diabetes", "COPD", "Coronary Artery Disease",
    "Osteoarthritis", "Pneumonia", "Appendicitis", "Cholecystitis", "Fracture", "Anemia"
  ];
  return diagnoses[index % diagnoses.length];
};

const DischargedToday = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dischargeStatus = searchParams.get("dischargeStatus");
  const [selectedPatient, setSelectedPatient] = useState<IPPatientRecord | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  let data = dischargedPatients;
  let displayCount = dischargedPatients.length;
  let pageTitle = "Discharged";

  if (dischargeStatus === "Pending") {
    data = dischargePending;
    displayCount = dischargePending.length;
    pageTitle = "Discharge Pending";
  }

  const dischargedColumns: Column<IPPatientRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.mrn} ageSex={row.ageSex} patientId={row.mrn} fromPage="discharged" />
    },
    { key: "visitId", label: "Visit ID" },
    { 
      key: "ward", 
      label: "Ward/Bed",
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.ward}</span>
          <span className="text-muted-foreground text-xs">{row.bed}</span>
        </div>
      )
    },
    { 
      key: "dischargeDateTime", 
      label: "Discharge Date/Time", 
      sortable: true, 
      render: (row) => {
        if (!row.dischargeDateTime) return "—";
        const [date, time] = row.dischargeDateTime.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => {
        const amount = getBillingAmount(row.mrn);
        return <span>₹{amount.toLocaleString('en-IN')}</span>;
      },
    },
    {
      key: "paid",
      label: "Paid",
      render: (row) => {
        const amount = getBillingAmount(row.mrn);
        return <span className="text-green-600 font-medium">₹{amount.toLocaleString('en-IN')}</span>;
      },
    },
    {
      key: "balance",
      label: "Balance",
      render: () => <span>₹0</span>,
    },
    {
      key: "mode",
      label: "Mode",
      render: (row) => <span>{getPaymentMode(row.mrn)}</span>,
    },
    {
      key: "status",
      label: "Status",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: () => <Badge className="bg-green-100 text-green-700 min-w-[80px] justify-center">Settled</Badge>,
    },
  ];

  const pendingColumns: Column<IPPatientRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.mrn} ageSex={row.ageSex} patientId={row.mrn} fromPage="discharged" />
    },
    { key: "visitId", label: "Visit ID" },
    { key: "ward", label: "Ward" },
    { key: "room", label: "Room" },
    { key: "bed", label: "Bed" },
    { 
      key: "plannedDischargeDateTime", 
      label: "Planned Discharge", 
      sortable: true, 
      render: (row) => {
        if (!row.plannedDischargeDateTime) return "—";
        const [date, time] = row.plannedDischargeDateTime.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    {
      key: "blockingTasks",
      label: "Blocking Tasks",
      render: (row) => row.blockingTasks?.length ? (
        <div className="flex flex-wrap gap-1">
          {row.blockingTasks.map((task) => (
            <Badge key={task} className="bg-red-100 text-red-700 text-xs">{task}</Badge>
          ))}
        </div>
      ) : <span>—</span>,
    },
    { key: "attendingDoctor", label: "Attending Doctor" },
    { key: "lengthOfStay", label: "LOS", render: (row) => <span>{row.lengthOfStay} days</span> },
  ];

  const filters: Filter[] = [
    {
      key: "ward",
      label: "Ward",
      value: "all",
      options: [
        { value: "ICU", label: "ICU" },
        { value: "Ward-A", label: "Ward A" },
        { value: "Ward-B", label: "Ward B" },
        { value: "Private Wing", label: "Private Wing" },
      ],
    },
  ];

  const rowActions: RowAction<IPPatientRecord>[] = [
    { label: "Patient Insight", onClick: (row) => navigate(`/patient-insights/${row.mrn}?from=discharged`) },
    { 
      label: "View Summary", 
      onClick: (row) => {
        setSelectedPatient(row);
        setShowSummary(true);
      }
    },
  ];

  const displayColumns = dischargeStatus === "Pending" ? pendingColumns : dischargedColumns;

  const getPatientIndex = (mrn: string) => {
    const numericPart = parseInt(mrn.replace(/\D/g, '')) || 0;
    return numericPart;
  };

  return (
    <>
      <ListPageLayout
        title={pageTitle}
        count={displayCount}
        breadcrumbs={["Overview", pageTitle]}
        columns={displayColumns}
        data={data}
        filters={filters}
        rowActions={rowActions}
        emptyMessage="No discharged patients for today."
        searchPlaceholder="Search by MRN, name, ward..."
        getRowId={(row) => row.mrn}
        onRowClick={(row) => navigate(`/patient-insights/${row.mrn}?from=discharged`)}
        pageKey="discharge"
      />

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Discharge Summary</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Patient Name</p>
                  <p className="font-medium">{selectedPatient.patient}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">GDID</p>
                  <p className="font-medium">GDID - {selectedPatient.mrn.slice(-3).padStart(3, '0')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age / Gender</p>
                  <p className="font-medium">{selectedPatient.ageSex}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visit ID</p>
                  <p className="font-medium">{selectedPatient.visitId}</p>
                </div>
              </div>

              {/* Admission, Discharge & Clinical in one row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Admission Details</h4>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Admit Date/Time</span>
                      <span className="text-sm">{selectedPatient.admitDateTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Ward / Bed</span>
                      <span className="text-sm">{selectedPatient.ward} / {selectedPatient.bed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Attending Doctor</span>
                      <span className="text-sm">{selectedPatient.attendingDoctor}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Discharge Details</h4>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Discharge Date/Time</span>
                      <span className="text-sm">{selectedPatient.dischargeDateTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Discharge Type</span>
                      <span className="text-sm">{getDischargeType(getPatientIndex(selectedPatient.mrn))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Length of Stay</span>
                      <span className="text-sm">{selectedPatient.lengthOfStay} days</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Clinical Information</h4>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Primary Diagnosis</span>
                      <span className="text-sm">{getDiagnosis(getPatientIndex(selectedPatient.mrn))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Condition</span>
                      <span className="text-sm">Stable</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discharge Instructions */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Discharge Instructions</p>
                <p className="text-sm text-muted-foreground">
                  Continue prescribed medications. Follow up with attending physician in 7 days. Report immediately if symptoms worsen.
                </p>
              </div>

              {/* Billing Summary */}
              <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-medium">₹{getBillingAmount(selectedPatient.mrn).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="font-medium text-green-600">₹{getBillingAmount(selectedPatient.mrn).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="font-medium">₹0</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Mode</p>
                  <p className="font-medium">{getPaymentMode(selectedPatient.mrn)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DischargedToday;
