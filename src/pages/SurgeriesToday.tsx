import { useNavigate } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { surgeries, SurgeryRecord } from "@/data/overview.mock";

const statusStyles: Record<SurgeryRecord["status"], string> = {
  "Scheduled": "bg-gray-100 text-gray-700",
  "In-Progress": "bg-amber-100 text-amber-700",
  "Completed": "bg-green-100 text-green-700",
  "Canceled": "bg-red-100 text-red-700",
};

const SurgeriesToday = () => {
  const navigate = useNavigate();

  const columns: Column<SurgeryRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.caseId} ageSex={row.ageSex} patientId={row.caseId} fromPage="surgeries" />
    },
    { key: "visitId", label: "Visit ID" },
    { key: "procedure", label: "Procedure" },
    { key: "surgeon", label: "Surgeon", sortable: true },
    { 
      key: "orRoom", 
      label: "Room/Bed",
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.orRoom}</span>
          <span className="text-muted-foreground text-xs">Bed 1</span>
        </div>
      )
    },
    { 
      key: "startTime", 
      label: "Start Time", 
      sortable: true,
      render: (row) => {
        if (!row.startTime) return "—";
        const [date, time] = row.startTime.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { key: "estimatedDuration", label: "Est. Duration" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      width: "130px",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge className={`${statusStyles[row.status]} min-w-[100px] justify-center`}>{row.status}</Badge>
      ),
    },
    { key: "anesthesiaType", label: "Anesthesia Type" },
  ];

  const filters: Filter[] = [
    {
      key: "status",
      label: "Status",
      value: "all",
      options: [
        { value: "Scheduled", label: "Scheduled" },
        { value: "In-Progress", label: "In-Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Canceled", label: "Canceled" },
      ],
    },
    {
      key: "orRoom",
      label: "OR Room",
      value: "all",
      options: [
        { value: "OR-1", label: "OR-1" },
        { value: "OR-2", label: "OR-2" },
        { value: "OR-3", label: "OR-3" },
        { value: "OR-4", label: "OR-4" },
        { value: "OR-5", label: "OR-5" },
      ],
    },
  ];

  const rowActions: RowAction<SurgeryRecord>[] = [
    { label: "View Case Details", onClick: (row) => console.log("View case", row.caseId) },
    { label: "Patient Chart", onClick: (row) => navigate(`/patient-insights/${row.caseId}?from=surgeries`) },
    { label: "Update Status", onClick: (row) => console.log("Update status", row.caseId) },
  ];

  // Sort to pin In-Progress at top
  const sortedSurgeries = [...surgeries].sort((a, b) => {
    if (a.status === "In-Progress" && b.status !== "In-Progress") return -1;
    if (a.status !== "In-Progress" && b.status === "In-Progress") return 1;
    return 0;
  });

  return (
    <ListPageLayout
      title="Surgeries"
      count={surgeries.length}
      breadcrumbs={["Overview", "Surgeries"]}
      columns={columns}
      data={sortedSurgeries}
      filters={filters}
      rowActions={rowActions}
      emptyMessage="No surgeries scheduled for today."
      searchPlaceholder="Search by Case ID, patient, procedure, surgeon..."
      getRowId={(row) => row.caseId}
      onRowClick={(row) => navigate(`/patient-insights/${row.caseId}?from=surgeries`)}
      pageKey="surgeries"
    />
  );
};

export default SurgeriesToday;
