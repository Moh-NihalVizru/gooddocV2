import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ListPageLayout, Column, Filter, RowAction, UrlParamFilter } from "@/components/overview/ListPageLayout";
import { PatientCell } from "@/components/overview/PatientCell";
import { IPPatientRecord } from "@/data/overview.mock";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/utils/currency";
import { PaymentDetailsPopup } from "@/components/billing/PaymentDetailsPopup";
import { postToWorkflow } from "@/services/apiService";
import { authService } from "@/services/authService";
import { format, addDays } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

const API_ENDPOINT = "gdv2landingpage6969d482b3f38";

const IPPatients = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const admittedToday = searchParams.get("admittedToday");
  const erCase = searchParams.get("erCase");
  const [ipPatientsData, setIpPatientsData] = useState<IPPatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<IPPatientRecord | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchIPPatients = async (input?: { date?: Date; range?: DateRange | undefined }) => {
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
        action: "getInPatientList",
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

      if (data && data[0] && data[0].InPatients) {
        const inPatientsRaw = JSON.parse(data[0].InPatients);
        const mappedData: IPPatientRecord[] = inPatientsRaw.map((p: any) => ({
          mrn: p.Patient_GDID?.toString() || p.Patient_ID || "",
          patient: `${p.PatientName} ${p.PatientSurname}`.trim(),
          ageSex: `${p.Age || p.ApproximateAge}/${p.Gender?.[0] || ""}`,
          visitId: p.Deal_ID?.toString() || "",
          admitDateTime: p.ScheduledOn || "",
          ward: p.WardNumber || "—",
          room: p.RoomNumber || "—",
          bed: "—", // Not explicitly provided in the payload snippet
          bedClass: "Ward", // Defaulting as not provided
          attendingDoctor: `${p.RefferedTo_NetworkName} ${p.RefferedTo_NetworkSurname}`.trim(),
          primaryDiagnosis: p.AppointmentSummary || "—",
          lengthOfStay: 0,
          ipStatus: p.Status === "Open" ? "admitted" : "discharged",
          dischargeDateTime: p.DischargeDate || "",
          emergencyContact: p.ContactPhoneNumber || "",
          billAmount: p.Amount || 0,
          advancePaid: p.AdvanceAmountBalance || 0,
          totalPaid: p.Amount - p.DueAmount || 0,
        }));
        setIpPatientsData(mappedData);
      } else {
        setIpPatientsData([]);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch IP patients:", err);
      setError(err.message || "Failed to load IP patients");
      toast.error("Failed to load IP patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIPPatients();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedRange(undefined);
    fetchIPPatients({ date, range: undefined });
  };

  const handleRangeChange = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      fetchIPPatients({ range });
    }
  };

  let data = ipPatientsData;
  let displayCount = ipPatientsData.length;
  let pageTitle = "IP Patients";

  if (admittedToday === "true") {
    // For now, filtering locally if admittedToday is true, or we could rely on API if it supports it
    // But usually these filters are applied on the fetched data
    data = ipPatientsData.filter(p => p.ipStatus === "admitted");
    displayCount = data.length;
    pageTitle = "New Admissions";
  } else if (erCase === "true") {
    // Mocking ER case filter for now as it's not explicitly in the payload
    displayCount = data.length;
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
        if (!displayDateTime) return "—";
        const parts = displayDateTime.split(' ');
        const date = parts[0];
        const time = parts[1] || "";
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
    {
      key: "emergencyContact",
      label: "Emergency Contact",
      render: (row) => row.emergencyContact ? (
        <span>{row.emergencyContact}</span>
      ) : <span className="text-muted-foreground">—</span>,
    },
  ];

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
        ...new Set(ipPatientsData.map(p => p.ward))
      ].filter(Boolean).map(ward => ({ value: ward, label: ward })),
    },
    {
      key: "attendingDoctor",
      label: "Doctor",
      value: "all",
      options: uniqueDoctors.map(doctor => ({ value: doctor, label: doctor })),
    },
  ];

  const urlParamFilters: UrlParamFilter[] = [
    {
      paramKey: "admittedToday",
      paramValue: "true",
      displayLabel: "New Admissions",
      count: ipPatientsData.filter(p => p.ipStatus === "admitted").length
    },
  ];

  const rowActions: RowAction<IPPatientRecord>[] = [
    { label: "Patient Insight", onClick: (row) => navigate(`/patient-insights/${row.mrn}?from=ip-patients`) },
    { label: "Payment Details", onClick: (row) => handlePaymentDetails(row) },
  ];

  const getPatientBillAmount = (row: IPPatientRecord) => {
    return row.billAmount || 0;
  };

  if (error && ipPatientsData.length === 0) {
    return (
      <ListPageLayout
        title={pageTitle}
        count={0}
        breadcrumbs={["Overview", pageTitle]}
        columns={columns}
        data={[]}
        filters={filters}
        rowActions={rowActions}
        urlParamFilters={urlParamFilters}
        emptyMessage={`Error: ${error}`}
        getRowId={(row) => row.mrn}
        pageKey="ip-patients"
      />
    );
  }

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
        emptyMessage={isLoading ? "Loading patients..." : "No IP patients found."}
        searchPlaceholder="Search by MRN, name, ward, bed..."
        getRowId={(row) => row.mrn}
        onRowClick={(row) => navigate(`/patient-insights/${row.mrn}?from=ip-patients`)}
        pageKey="ip-patients"
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
          gdid={selectedPatient.mrn.slice(-3).padStart(3, '0')}
          ageSex={selectedPatient.ageSex}
          billAmount={getPatientBillAmount(selectedPatient)}
          advancePaid={selectedPatient.advancePaid ?? selectedPatient.totalPaid ?? 0}
          unbilledAmount={0}
        />
      )}
    </>
  );
};

export default IPPatients;
