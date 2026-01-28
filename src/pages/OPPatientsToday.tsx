import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction, UrlParamFilter } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { OPPatientRecord } from "@/data/overview.mock";
import { toast } from "sonner";
import { formatINR } from "@/utils/currency";
import { PaymentDetailsPopup } from "@/components/billing/PaymentDetailsPopup";
import { postToWorkflow } from "@/services/apiService";
import { authService } from "@/services/authService";
import { format, addDays } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { DateRange } from "react-day-picker";

const statusStyles: Record<string, string> = {
  "Pending": "bg-amber-100 text-amber-700",
  "Checked-in": "bg-blue-100 text-blue-700",
  "Completed": "bg-green-100 text-green-700",
  "Open": "bg-blue-100 text-blue-700", // Added for API status
};

const API_ENDPOINT = "gdv2landingpage6969d482b3f38";

const OPPatientsToday = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitStatusFilter = searchParams.get("visitStatus");
  const [opPatientsData, setOpPatientsData] = useState<OPPatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [selectedPatient, setSelectedPatient] = useState<OPPatientRecord | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchOPPatients = async (input?: { date?: Date; range?: DateRange | undefined }) => {
    let userEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    let userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

    if (!userEmail || !userId) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        userEmail = currentUser.email || undefined;
        userId = currentUser.id?.toString() || undefined;
        if (userEmail) localStorage.setItem("userEmail", userEmail);
        if (userId) localStorage.setItem("userId", userId);
      }
    }

    if (!userEmail || !userId) {
      toast.error("User authentication required. Please login again.");
      navigate("/auth");
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
      const rangeToUse = input?.range ?? selectedRange;
      const dateToUse = input?.date ?? selectedDate;

      let startDate = format(dateToUse, "yyyy-MM-dd");
      let endDate = format(addDays(dateToUse, 1), "yyyy-MM-dd");

      if (rangeToUse?.from && rangeToUse?.to) {
        startDate = format(rangeToUse.from, "yyyy-MM-dd");
        endDate = format(rangeToUse.to, "yyyy-MM-dd");
      }

      const payload = {
        action: "getOutPatientList",
        email: userEmail,
        userId,
        startDate,
        endDate,
        date: startDate,
      };

      const { data, error: apiError } = await postToWorkflow<any>(
        API_ENDPOINT,
        payload,
        controller.signal
      );

      if (controller.signal.aborted) return;
      if (apiError) throw new Error(apiError);

      if (data && data[0] && data[0].OutPatients) {
        const outPatientsRaw = JSON.parse(data[0].OutPatients);
        const mappedData: OPPatientRecord[] = outPatientsRaw.map((p: any) => ({
          mrn: p.Patient_GDID?.toString() || p.Patient_ID || "",
          patient: `${p.PatientName} ${p.PatientSurname}`.trim(),
          ageSex: `${p.Age || p.ApproximateAge}/${p.Gender?.[0] || ""}`,
          contact: p.ContactEmailID || "",
          visitId: p.Deal_ID?.toString() || "",
          appointmentTime: p.ScheduledOn || "",
          department: p.RefferedTo_Organization || "",
          provider: `${p.RefferedTo_NetworkName} ${p.RefferedTo_NetworkSurname}`.trim(),
          visitReason: p.AppointmentType || "",
          status: p.Status === "Open" ? "Pending" : p.Status, // Mapping "Open" to "Pending" for UI consistency
          checkInTime: p.AdmissionDate || "",
          tokenQueueNo: "", // Not provided in this API hit
          billAmount: 0, // Not provided in this API hit
          advancePaid: 0,
          totalPaid: 0,
        }));
        setOpPatientsData(mappedData);
      } else {
        setOpPatientsData([]);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch OP patients:", err);
      setError(err.message || "Failed to load OP patients");
      toast.error("Failed to load OP patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOPPatients();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedRange(undefined);
    fetchOPPatients({ date, range: undefined });
  };

  const handleRangeChange = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      fetchOPPatients({ range });
    }
  };

  const allowedStatuses = ["Pending", "Checked-in", "Completed", "Open"];
  const filteredByStatus = opPatientsData.filter(p => allowedStatuses.includes(p.status));

  let data = filteredByStatus;
  let displayCount = filteredByStatus.length;

  if (visitStatusFilter === "Completed") {
    data = opPatientsData.filter(p => p.status === "Completed");
    displayCount = data.length;
  } else if (visitStatusFilter === "Pending") {
    data = opPatientsData.filter(p => p.status === "Checked-in");
    displayCount = data.length;
  } else if (visitStatusFilter === "In_Queue") {
    data = opPatientsData.filter(p => p.status === "Pending" || p.status === "Open");
    displayCount = data.length;
  }

  const handleCheckIn = (row: OPPatientRecord) => {
    toast.info("Check-in functionality will be integrated with the specific check-in API.");
  };

  const handlePaymentDetails = (row: OPPatientRecord) => {
    setSelectedPatient(row);
    setPaymentOpen(true);
  };

  const getPatientBillAmount = (row: OPPatientRecord) => {
    return row.billAmount || 0;
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
        if (!row.appointmentTime) return "—";
        const parts = row.appointmentTime.split(' ');
        const date = parts[0];
        const time = parts[1];
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
        const parts = row.checkInTime.split(' ');
        const date = parts[0];
        const time = parts[1];
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
        <Badge className={`${statusStyles[row.status] || "bg-gray-100 text-gray-700"} min-w-[120px] justify-center`}>{row.status}</Badge>
      ),
    },
    {
      key: "billAmount",
      label: "Payment Details",
      render: (row) => {
        const billAmount = row.billAmount || 0;
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

  const uniqueDoctors = [...new Set(data.map(p => p.provider))].sort();

  const filters: Filter[] = [
    {
      key: "department",
      label: "Department",
      value: "all",
      options: [
        ...new Set(opPatientsData.map(p => p.department))
      ].filter(Boolean).map(dept => ({ value: dept, label: dept })),
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
        { value: "Open", label: "Open" },
      ],
    },
  ];

  const urlParamFilters: UrlParamFilter[] = [
    {
      paramKey: "visitStatus",
      paramValue: "Completed",
      displayLabel: "Visit Completed",
      count: opPatientsData.filter(p => p.status === "Completed").length
    },
    {
      paramKey: "visitStatus",
      paramValue: "In_Queue",
      displayLabel: "Check In Pending",
      count: opPatientsData.filter(p => p.status === "Pending" || p.status === "Open").length
    },
  ];

  const rowActions: RowAction<OPPatientRecord>[] = [
    { label: "Patient Insight", onClick: (row) => navigate(`/patient-insights/${row.mrn}?from=op-patients`) },
    { label: "Check In", onClick: (row) => handleCheckIn(row), hidden: (row) => row.status !== "Pending" && row.status !== "Open" },
    { label: "Payment Details", onClick: (row) => handlePaymentDetails(row) },
  ];

  if (error && opPatientsData.length === 0) {
    return (
      <ListPageLayout
        title="OP Patients"
        count={0}
        breadcrumbs={["Overview", "OP Patients"]}
        columns={columns}
        data={[]}
        filters={filters}
        rowActions={rowActions}
        urlParamFilters={urlParamFilters}
        emptyMessage={`Error: ${error}`}
        getRowId={(row) => row.mrn}
        pageKey="op-patients"
      />
    );
  }

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
        emptyMessage={isLoading ? "Loading patients..." : "No OP patients for today."}
        searchPlaceholder="Search by MRN, name, Visit ID..."
        getRowId={(row) => row.mrn}
        onRowClick={(row) => navigate(`/patient-insights/${row.mrn}?from=op-patients`)}
        pageKey="op-patients"
        isLoading={isLoading}
        selectedDate={selectedDate}
        selectedRange={selectedRange}
        onDateChange={handleDateChange}
        onRangeChange={handleRangeChange}
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
          unbilledAmount={0}
        />
      )}
    </>
  );
};

export default OPPatientsToday;
