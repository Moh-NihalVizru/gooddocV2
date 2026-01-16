import { useNavigate } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { transfers, TransferRecord } from "@/data/overview.mock";

const priorityStyles: Record<TransferRecord["priority"], string> = {
  "Routine": "bg-gray-100 text-gray-700",
  "Urgent": "bg-amber-100 text-amber-700",
  "Stat": "bg-red-600 text-white",
};

const statusStyles: Record<TransferRecord["status"], string> = {
  "Requested": "bg-gray-100 text-gray-700",
  "Approved": "bg-blue-100 text-blue-700",
  "Bed Reserved": "bg-indigo-100 text-indigo-700",
  "In Transit": "bg-amber-100 text-amber-700",
  "Completed": "bg-green-100 text-green-700",
  "Canceled": "bg-red-100 text-red-700",
};

const transferTypeStyles: Record<TransferRecord["transferType"], string> = {
  "Intra-ward": "bg-gray-100 text-gray-700",
  "Inter-ward": "bg-blue-100 text-blue-700",
  "To ICU": "bg-red-100 text-red-700",
  "To HDU": "bg-orange-100 text-orange-700",
  "Room Change": "bg-purple-100 text-purple-700",
  "Bed Swap": "bg-indigo-100 text-indigo-700",
  "Inter-facility": "bg-amber-100 text-amber-700",
};

const bedClassStyles: Record<TransferRecord["fromBedClass"], string> = {
  "ICU": "bg-red-100 text-red-700",
  "HDU": "bg-orange-100 text-orange-700",
  "Ward": "bg-blue-100 text-blue-700",
  "Private": "bg-purple-100 text-purple-700",
  "Isolation": "bg-yellow-100 text-yellow-700",
};

const TransfersList = () => {
  const navigate = useNavigate();

  // Sort by: Status priority (In Transit → Bed Reserved/Approved → Requested → Completed → Canceled), then Priority (Stat first), then Requested At ASC
  const statusOrder: Record<TransferRecord["status"], number> = {
    "In Transit": 1,
    "Bed Reserved": 2,
    "Approved": 3,
    "Requested": 4,
    "Completed": 5,
    "Canceled": 6,
  };
  const priorityOrder: Record<TransferRecord["priority"], number> = {
    "Stat": 1,
    "Urgent": 2,
    "Routine": 3,
  };

  const sortedTransfers = [...transfers].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
  });

  const columns: Column<TransferRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.mrn} ageSex={row.ageSex} patientId={row.mrn} fromPage="transfers" />
    },
    { key: "visitId", label: "Visit ID" },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => <Badge className={`${priorityStyles[row.priority]} min-w-[70px] justify-center`}>{row.priority}</Badge>,
    },
    {
      key: "transferType",
      label: "Transfer Type",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => <Badge className={`${transferTypeStyles[row.transferType]} min-w-[100px] justify-center`}>{row.transferType}</Badge>,
    },
    {
      key: "fromWard",
      label: "From Ward",
      render: (row) => <span>{row.fromWard}</span>,
    },
    {
      key: "fromRoom",
      label: "From Room",
      render: (row) => <span>{row.fromRoom}</span>,
    },
    {
      key: "fromBed",
      label: "From Bed",
      render: (row) => <span>{row.fromBed}</span>,
    },
    {
      key: "fromBedClass",
      label: "From Bed Class",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => <Badge className={`${bedClassStyles[row.fromBedClass]} min-w-[70px] justify-center`}>{row.fromBedClass}</Badge>,
    },
    {
      key: "toWard",
      label: "To Ward",
      render: (row) => (
        <span className={row.toWard === "ICU" ? "font-semibold text-red-600" : ""}>
          {row.toWard}
        </span>
      ),
    },
    {
      key: "toRoom",
      label: "To Room",
      render: (row) => <span>{row.toRoom}</span>,
    },
    {
      key: "toBed",
      label: "To Bed",
      render: (row) => <span>{row.toBed}</span>,
    },
    {
      key: "toBedClass",
      label: "To Bed Class",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge className={`${bedClassStyles[row.toBedClass]} min-w-[70px] justify-center ${row.toBedClass === "ICU" ? "ring-2 ring-red-300" : ""}`}>
          {row.toBedClass}
        </Badge>
      ),
    },
    { key: "reason", label: "Reason/Indication" },
    { key: "requestingClinician", label: "Requesting Clinician" },
    { key: "approver", label: "Approver", render: (row) => row.approver || "—" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => <Badge className={`${statusStyles[row.status]} min-w-[100px] justify-center`}>{row.status}</Badge>,
    },
    { 
      key: "requestedAt", 
      label: "Requested At", 
      sortable: true,
      render: (row) => {
        if (!row.requestedAt) return "—";
        const [date, time] = row.requestedAt.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { 
      key: "approvedAt", 
      label: "Approved At", 
      render: (row) => {
        if (!row.approvedAt) return "—";
        const [date, time] = row.approvedAt.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { 
      key: "transferStartAt", 
      label: "Transfer Start", 
      render: (row) => {
        if (!row.transferStartAt) return "—";
        const [date, time] = row.transferStartAt.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { 
      key: "arrivedAt", 
      label: "Arrived At", 
      render: (row) => {
        if (!row.arrivedAt) return "—";
        const [date, time] = row.arrivedAt.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { key: "equipmentNeeded", label: "Equipment Needed", render: (row) => row.equipmentNeeded || "—" },
    {
      key: "isolationRequired",
      label: "Isolation Required",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => row.isolationRequired ? (
        <Badge className="bg-yellow-500 text-white min-w-[50px] justify-center">Yes</Badge>
      ) : <span className="text-muted-foreground">No</span>,
    },
    { key: "transportTeam", label: "Transport Team/Porter", render: (row) => row.transportTeam || "—" },
    { key: "notesBlockers", label: "Notes/Blockers", render: (row) => row.notesBlockers || "—" },
  ];

  const filters: Filter[] = [
    {
      key: "fromWard",
      label: "From Ward",
      value: "all",
      options: [
        { value: "ICU", label: "ICU" },
        { value: "HDU", label: "HDU" },
        { value: "Ward-A", label: "Ward A" },
        { value: "Ward-B", label: "Ward B" },
        { value: "Ward-C", label: "Ward C" },
      ],
    },
    {
      key: "toWard",
      label: "To Ward/Unit",
      value: "all",
      options: [
        { value: "ICU", label: "ICU" },
        { value: "HDU", label: "HDU" },
        { value: "Ward-A", label: "Ward A" },
        { value: "Ward-B", label: "Ward B" },
        { value: "Ward-C", label: "Ward C" },
      ],
    },
    {
      key: "toBedClass",
      label: "Bed Class",
      value: "all",
      options: [
        { value: "ICU", label: "ICU" },
        { value: "HDU", label: "HDU" },
        { value: "Ward", label: "Ward" },
        { value: "Private", label: "Private" },
        { value: "Isolation", label: "Isolation" },
      ],
    },
    {
      key: "transferType",
      label: "Transfer Type",
      value: "all",
      options: [
        { value: "Intra-ward", label: "Intra-ward" },
        { value: "Inter-ward", label: "Inter-ward" },
        { value: "To ICU", label: "To ICU" },
        { value: "To HDU", label: "To HDU" },
        { value: "Room Change", label: "Room Change" },
        { value: "Bed Swap", label: "Bed Swap" },
        { value: "Inter-facility", label: "Inter-facility" },
      ],
    },
    {
      key: "status",
      label: "Status",
      value: "all",
      options: [
        { value: "Requested", label: "Requested" },
        { value: "Approved", label: "Approved" },
        { value: "Bed Reserved", label: "Bed Reserved" },
        { value: "In Transit", label: "In Transit" },
        { value: "Completed", label: "Completed" },
        { value: "Canceled", label: "Canceled" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      value: "all",
      options: [
        { value: "Stat", label: "Stat" },
        { value: "Urgent", label: "Urgent" },
        { value: "Routine", label: "Routine" },
      ],
    },
  ];

  const rowActions: RowAction<TransferRecord>[] = [
    { label: "Open Transfer", onClick: (row) => console.log("Open transfer", row.transferId) },
    { label: "Assign Bed", onClick: (row) => console.log("Assign bed", row.transferId) },
    { label: "Approve", onClick: (row) => console.log("Approve", row.transferId) },
    { label: "Start Transfer", onClick: (row) => console.log("Start", row.transferId) },
    { label: "Mark Arrived", onClick: (row) => console.log("Mark arrived", row.transferId) },
  ];

  return (
    <ListPageLayout
      title="Transfers"
      count={transfers.length}
      breadcrumbs={["Overview", "Transfers"]}
      columns={columns}
      data={sortedTransfers}
      filters={filters}
      rowActions={rowActions}
      emptyMessage="No transfer records for today."
      searchPlaceholder="Search by Transfer ID, MRN, patient name..."
      getRowId={(row) => row.transferId}
      onRowClick={(row) => navigate(`/patient-insights/${row.mrn}?from=transfers`)}
      pageKey="transfers"
    />
  );
};

export default TransfersList;