import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction, UrlParamFilter } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { opPatients as initialOpPatients, opCompleted, opCheckedIn, opPendingCheckIn, OPPatientRecord } from "@/data/overview.mock";
import { toast } from "sonner";
import { formatINR } from "@/utils/currency";
import { PaymentDetailsPopup } from "@/components/billing/PaymentDetailsPopup";

const statusStyles: Record<string, string> = {
  "Pending": "bg-amber-100 text-amber-700",
  "Checked-in": "bg-blue-100 text-blue-700",
  "Completed": "bg-green-100 text-green-700",
};

const OPPatientsToday = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitStatusFilter = searchParams.get("visitStatus");
  const [opPatientsData, setOpPatientsData] = useState<OPPatientRecord[]>(initialOpPatients);
  const [selectedPatient, setSelectedPatient] = useState<OPPatientRecord | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const allowedStatuses = ["Pending", "Checked-in", "Completed"];
  const filteredByStatus = opPatientsData.filter(p => allowedStatuses.includes(p.status));

  let data = filteredByStatus;
  let displayCount = filteredByStatus.length;

  if (visitStatusFilter === "Completed") {
    data = opCompleted.filter(p => allowedStatuses.includes(p.status));
    displayCount = data.length;
  } else if (visitStatusFilter === "Pending") {
    data = opCheckedIn.filter(p => allowedStatuses.includes(p.status));
    displayCount = data.length;
  } else if (visitStatusFilter === "In_Queue") {
    data = opPendingCheckIn.filter(p => allowedStatuses.includes(p.status));
    displayCount = data.length;
  }

  const generateToken = () => {
    const tokenNum = Math.floor(Math.random() * 900) + 100;
    return `T${tokenNum}`;
  };

  const handleCheckIn = (row: OPPatientRecord) => {
    const now = new Date();
    const checkInTime = `${now.getDate().toString().padStart(2, '0')}-${now.toLocaleString('en-US', { month: 'short' })}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const token = generateToken();

    setOpPatientsData(prev => prev.map(patient => 
      patient.mrn === row.mrn 
        ? { ...patient, status: "Checked-in" as const, checkInTime, tokenQueueNo: token }
        : patient
    ));

    toast.success(`Patient checked in successfully`, {
      description: `Token: ${token} assigned to ${row.patient}`,
    });
  };

  const handlePaymentDetails = (row: OPPatientRecord) => {
    setSelectedPatient(row);
    setPaymentOpen(true);
  };

  const getPatientBillAmount = (row: OPPatientRecord) => {
    const billAmounts = [500, 800, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500];
    const numericPart = parseInt(row.mrn.replace(/\D/g, '')) || 0;
    return row.billAmount ?? billAmounts[numericPart % billAmounts.length];
  };

  const columns: Column<OPPatientRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.mrn} ageSex={row.ageSex} patientId={row.mrn} fromPage="op-patients" />
    },
    { key: "visitId", label: "Visit ID" },
    { 
      key: "appointmentTime", 
      label: "Appointment Time", 
      sortable: true,
      render: (row) => {
        const [date, time] = row.appointmentTime.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { 
      key: "provider", 
      label: "Doctor",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.provider}</span>
          <span className="text-muted-foreground text-xs">{row.department}</span>
        </div>
      )
    },
    { 
      key: "checkInTime", 
      label: "Check-in Time", 
      render: (row) => {
        if (!row.checkInTime) return "—";
        const [date, time] = row.checkInTime.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge className={`${statusStyles[row.status]} min-w-[120px] justify-center`}>{row.status}</Badge>
      ),
    },
    {
      key: "billAmount",
      label: "Payment Details",
      render: (row) => {
        // Generate bill amount based on mrn for variety
        const billAmounts = [500, 800, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500];
        const numericPart = parseInt(row.mrn.replace(/\D/g, '')) || 0;
        const billAmount = row.billAmount ?? billAmounts[numericPart % billAmounts.length];
        const advance = row.advancePaid ?? row.totalPaid ?? 0;
        const balance = billAmount - advance;
        
        return (
          <div className="flex flex-col text-xs space-y-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Bill:</span>
              <span className="font-medium">{formatINR(billAmount * 100)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Due:</span>
              <span className={balance > 0 ? "text-amber-600 font-medium" : "text-green-600"}>{formatINR(balance * 100)}</span>
            </div>
          </div>
        );
      },
    },
    { key: "tokenQueueNo", label: "Token/Queue No.", render: (row) => row.tokenQueueNo || "—" },
  ];

  // Get unique doctors from data
  const uniqueDoctors = [...new Set(data.map(p => p.provider))].sort();

  const filters: Filter[] = [
    {
      key: "department",
      label: "Department",
      value: "all",
      options: [
        { value: "Cardiology", label: "Cardiology" },
        { value: "Orthopedics", label: "Orthopedics" },
        { value: "Neurology", label: "Neurology" },
        { value: "General Medicine", label: "General Medicine" },
      ],
    },
    {
      key: "provider",
      label: "Doctor",
      value: "all",
      options: uniqueDoctors.map(doctor => ({ value: doctor, label: doctor })),
    },
    {
      key: "status",
      label: "Status",
      value: "all",
      options: [
        { value: "Pending", label: "Pending" },
        { value: "Checked-in", label: "Checked-in" },
        { value: "Completed", label: "Completed" },
      ],
    },
  ];

  const urlParamFilters: UrlParamFilter[] = [
    { paramKey: "visitStatus", paramValue: "Completed", displayLabel: "Visit Completed", count: opCompleted.length },
    { paramKey: "visitStatus", paramValue: "In_Queue", displayLabel: "Check In Pending", count: opPendingCheckIn.length },
  ];

  const rowActions: RowAction<OPPatientRecord>[] = [
    { label: "Patient Insight", onClick: (row) => navigate(`/patient-insights/${row.mrn}?from=op-patients`) },
    { label: "Check In", onClick: (row) => handleCheckIn(row), hidden: (row) => row.status !== "Pending" },
    { label: "Payment Details", onClick: (row) => handlePaymentDetails(row) },
  ];

  return (
    <>
      <ListPageLayout
        title="OP Patients"
        count={displayCount}
        breadcrumbs={["Overview", "OP Patients"]}
        columns={columns}
        data={data}
        filters={filters}
        rowActions={rowActions}
        urlParamFilters={urlParamFilters}
        emptyMessage="No OP patients for today."
        searchPlaceholder="Search by MRN, name, Visit ID..."
        getRowId={(row) => row.mrn}
        onRowClick={(row) => navigate(`/patient-insights/${row.mrn}?from=op-patients`)}
        pageKey="op-patients"
      />

      {selectedPatient && (
        <PaymentDetailsPopup
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          patientName={selectedPatient.patient}
          gdid={selectedPatient.mrn.slice(-3)}
          ageSex={selectedPatient.ageSex}
          billAmount={getPatientBillAmount(selectedPatient)}
          advancePaid={selectedPatient.advancePaid ?? selectedPatient.totalPaid ?? 0}
          unbilledAmount={200}
        />
      )}
    </>
  );
};

export default OPPatientsToday;
