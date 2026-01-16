import { useNavigate } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { emergencyCases, ERCaseRecord } from "@/data/overview.mock";

const triageStyles: Record<number, string> = {
  1: "bg-red-600 text-white",
  2: "bg-orange-500 text-white",
  3: "bg-yellow-400 text-yellow-900",
  4: "bg-green-500 text-white",
  5: "bg-blue-500 text-white",
};

const triageLabels: Record<number, string> = {
  1: "Red - Resuscitation",
  2: "Orange - Emergent",
  3: "Yellow - Urgent",
  4: "Green - Less Urgent",
  5: "Blue - Non-Urgent",
};

const dispositionStyles: Record<ERCaseRecord["disposition"], string> = {
  "Pending": "bg-gray-100 text-gray-700",
  "Admit": "bg-blue-100 text-blue-700",
  "Discharge": "bg-green-100 text-green-700",
  "Transfer": "bg-amber-100 text-amber-700",
};

const modeOfArrivalStyles: Record<ERCaseRecord["modeOfArrival"], string> = {
  "Ambulance": "bg-red-100 text-red-700",
  "Walk-in": "bg-green-100 text-green-700",
  "Transfer": "bg-blue-100 text-blue-700",
};

const EmergencyCases = () => {
  const navigate = useNavigate();

  const columns: Column<ERCaseRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.mrn} ageSex={row.ageSex} patientId={row.mrn} fromPage="emergency" />
    },
    { key: "visitId", label: "Visit ID" },
    { 
      key: "arrivalTime", 
      label: "Arrival Time", 
      sortable: true,
      render: (row) => {
        if (!row.arrivalTime) return "—";
        const [date, time] = row.arrivalTime.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    {
      key: "modeOfArrival",
      label: "Mode of Arrival",
      render: (row) => <span className="text-sm">{row.modeOfArrival}</span>,
    },
    { 
      key: "erZoneArea", 
      label: "ER Zone/Bed",
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.erZoneArea}</span>
          <span className="text-muted-foreground text-xs">{row.bedChair}</span>
        </div>
      )
    },
    { key: "attending", label: "Attending" },
    { key: "chiefComplaint", label: "Chief Complaint" },
    { key: "timeSinceArrival", label: "Time Since Arrival" },
    {
      key: "disposition",
      label: "Disposition",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge className={`${dispositionStyles[row.disposition]} min-w-[90px] justify-center`}>{row.disposition}</Badge>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: "triageLevel",
      label: "Triage Level",
      value: "all",
      options: [
        { value: "1", label: "Red - Resuscitation" },
        { value: "2", label: "Orange - Emergent" },
        { value: "3", label: "Yellow - Urgent" },
        { value: "4", label: "Green - Less Urgent" },
        { value: "5", label: "Blue - Non-Urgent" },
      ],
    },
    {
      key: "disposition",
      label: "Disposition",
      value: "all",
      options: [
        { value: "Pending", label: "Pending" },
        { value: "Admit", label: "Admit" },
        { value: "Discharge", label: "Discharge" },
        { value: "Transfer", label: "Transfer" },
      ],
    },
  ];

  const rowActions: RowAction<ERCaseRecord>[] = [
    { label: "Open Case", onClick: (row) => navigate(`/patient-insights/${row.mrn}?from=emergency`) },
    { label: "Update Triage", onClick: (row) => console.log("Update triage", row.mrn) },
    { label: "Assign Physician", onClick: (row) => console.log("Assign", row.mrn) },
  ];

  // Sort by triage level (highest acuity first), then arrival time
  const sortedCases = [...emergencyCases].sort((a, b) => {
    if (a.triageLevel !== b.triageLevel) return a.triageLevel - b.triageLevel;
    return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
  });

  return (
    <ListPageLayout
      title="Emergency Cases"
      count={emergencyCases.length}
      breadcrumbs={["Overview", "Emergency Cases"]}
      columns={columns}
      data={sortedCases}
      filters={filters}
      rowActions={rowActions}
      emptyMessage="No active emergency cases."
      searchPlaceholder="Search by MRN, patient name, chief complaint..."
      getRowId={(row) => row.mrn}
      onRowClick={(row) => navigate(`/patient-insights/${row.mrn}?from=emergency`)}
      pageKey="emergency"
    />
  );
};

export default EmergencyCases;
