import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ListPageLayout, Column, Filter, RowAction, UrlParamFilter } from "@/components/overview/ListPageLayout";
import { PatientCell } from "@/components/overview/PatientCell";
import { ipPatients, newAdmissions, erCasesToday, IPPatientRecord } from "@/data/overview.mock";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/utils/currency";
import { PaymentDetailsPopup } from "@/components/billing/PaymentDetailsPopup";

const IPPatients = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const admittedToday = searchParams.get("admittedToday");
  const erCase = searchParams.get("erCase");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<IPPatientRecord | null>(null);

  let data = ipPatients;
  let displayCount = ipPatients.length;
  let pageTitle = "IP Patients";

  if (admittedToday === "true") {
    data = newAdmissions;
    displayCount = newAdmissions.length;
    pageTitle = "New Admissions";
  } else if (erCase === "true") {
    data = erCasesToday;
    displayCount = erCasesToday.length;
    pageTitle = "Emergency Case";
  }

  const handlePaymentDetails = (row: IPPatientRecord) => {
    setSelectedPatient(row);
    setPaymentOpen(true);
  };

  const columns: Column<IPPatientRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.mrn} ageSex={row.ageSex} patientId={row.mrn} fromPage="ip-patients" />
    },
    { key: "visitId", label: "Visit ID" },
    { 
      key: "admitDateTime", 
      label: "Admit/Discharged Date", 
      sortable: true,
      render: (row) => {
        const displayDateTime = row.ipStatus === "discharged" && row.dischargeDateTime 
          ? row.dischargeDateTime 
          : row.admitDateTime;
        const [date, time] = displayDateTime.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { 
      key: "ward", 
      label: "Ward/Bed", 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.ward}</span>
          <span className="text-muted-foreground text-xs">Bed {row.bed}</span>
        </div>
      )
    },
    { 
      key: "attendingDoctor", 
      label: "Attending Doctor", 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.attendingDoctor}</span>
          <span className="text-muted-foreground text-xs">{row.primaryDiagnosis}</span>
        </div>
      )
    },
    {
      key: "ipStatus",
      label: "Status",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge 
          className={`min-w-[100px] justify-center ${row.ipStatus === "admitted" 
            ? "bg-green-100 text-green-700 border-green-200" 
            : "bg-gray-100 text-gray-700 border-gray-200"}`}
        >
          {row.ipStatus === "admitted" ? "Admitted" : "Discharged"}
        </Badge>
      )
    },
    {
      key: "billAmount",
      label: "Payment Details",
      sortable: true,
      render: (row) => {
        // Generate bill amount based on mrn for variety
        const billAmounts = [15000, 25000, 35000, 45000, 55000, 65000, 75000, 85000, 95000, 105000];
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
    { 
      key: "emergencyContact", 
      label: "Emergency Contact",
      render: (row) => row.emergencyContact ? (
        <span>{row.emergencyContact}</span>
      ) : <span className="text-muted-foreground">—</span>,
    },
  ];

  // Extract unique doctors from data
  const uniqueDoctors = [...new Set(data.map(p => p.attendingDoctor))].sort();

  const filters: Filter[] = [
    {
      key: "ipStatus",
      label: "Status",
      value: "all",
      options: [
        { value: "admitted", label: "Admitted" },
        { value: "discharged", label: "Discharged" },
      ],
    },
    {
      key: "ward",
      label: "Ward",
      value: "all",
      options: [
        { value: "ICU", label: "ICU" },
        { value: "HDU", label: "HDU" },
        { value: "Ward-A", label: "Ward A" },
        { value: "Ward-B", label: "Ward B" },
        { value: "Private Wing", label: "Private Wing" },
      ],
    },
    {
      key: "attendingDoctor",
      label: "Doctor",
      value: "all",
      options: uniqueDoctors.map(doctor => ({ value: doctor, label: doctor })),
    },
    {
      key: "admitDate",
      label: "Admit Date",
      value: "all",
      options: [
        { value: "today", label: "Today" },
        { value: "last7days", label: "Last 7 Days" },
        { value: "last30days", label: "Last 30 Days" },
      ],
    },
    {
      key: "dischargeDate",
      label: "Discharge Date",
      value: "all",
      options: [
        { value: "today", label: "Today" },
        { value: "last7days", label: "Last 7 Days" },
        { value: "last30days", label: "Last 30 Days" },
      ],
    },
  ];

  const urlParamFilters: UrlParamFilter[] = [
    { paramKey: "admittedToday", paramValue: "true", displayLabel: "New Admissions", count: newAdmissions.length },
    { paramKey: "erCase", paramValue: "true", displayLabel: "Emergency Case", count: erCasesToday.length },
  ];

  const rowActions: RowAction<IPPatientRecord>[] = [
    { label: "Patient Insight", onClick: (row) => navigate(`/patient-insights/${row.mrn}?from=ip-patients`) },
    { label: "Payment Details", onClick: (row) => handlePaymentDetails(row) },
  ];

  const getPatientBillAmount = (row: IPPatientRecord) => {
    const billAmounts = [15000, 25000, 35000, 45000, 55000, 65000, 75000, 85000, 95000, 105000];
    const numericPart = parseInt(row.mrn.replace(/\D/g, '')) || 0;
    return row.billAmount ?? billAmounts[numericPart % billAmounts.length];
  };

  const getGender = (ageSex: string) => {
    return ageSex.includes("M") ? "male" : "female";
  };

  return (
    <>
      <ListPageLayout
        title={pageTitle}
        count={displayCount}
        breadcrumbs={["Overview", pageTitle]}
        columns={columns}
        data={data}
        filters={filters}
        rowActions={rowActions}
        urlParamFilters={urlParamFilters}
        emptyMessage="No IP patients found."
        searchPlaceholder="Search by MRN, name, ward, bed..."
        getRowId={(row) => row.mrn}
        onRowClick={(row) => navigate(`/patient-insights/${row.mrn}?from=ip-patients`)}
        pageKey="ip-patients"
      />

      {selectedPatient && (
        <PaymentDetailsPopup
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          patientName={selectedPatient.patient}
          gdid={selectedPatient.mrn.slice(-3).padStart(3, '0')}
          ageSex={selectedPatient.ageSex}
          billAmount={getPatientBillAmount(selectedPatient)}
          advancePaid={selectedPatient.advancePaid ?? selectedPatient.totalPaid ?? 0}
          unbilledAmount={2000}
        />
      )}
    </>
  );
};

export default IPPatients;
