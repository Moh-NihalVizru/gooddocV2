import { useNavigate } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { radiologyOrders, RadiologyOrderRecord } from "@/data/overview.mock";

const priorityStyles: Record<RadiologyOrderRecord["priority"], string> = {
  "Routine": "bg-gray-100 text-gray-700",
  "Stat": "bg-red-100 text-red-700",
};

const statusStyles: Record<RadiologyOrderRecord["status"], string> = {
  "Ordered": "bg-gray-100 text-gray-700",
  "Scheduled": "bg-blue-100 text-blue-700",
  "In-Progress": "bg-amber-100 text-amber-700",
  "Completed": "bg-green-100 text-green-700",
  "Finalized": "bg-purple-100 text-purple-700",
};

const modalityStyles: Record<RadiologyOrderRecord["modality"], string> = {
  "X-ray": "bg-blue-100 text-blue-700",
  "CT": "bg-purple-100 text-purple-700",
  "MRI": "bg-indigo-100 text-indigo-700",
  "US": "bg-green-100 text-green-700",
  "Fluoro": "bg-amber-100 text-amber-700",
  "Mammo": "bg-pink-100 text-pink-700",
};

const RadiologyOrdersToday = () => {
  const navigate = useNavigate();

  const columns: Column<RadiologyOrderRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.orderId} ageSex={row.ageSex} patientId={row.orderId} fromPage="radiology" />
    },
    { key: "visitId", label: "Visit ID" },
    { 
      key: "location", 
      label: "Location",
      render: (row) => {
        if (!row.location) return "—";
        const parts = row.location.split('/');
        if (parts.length === 2) {
          return (
            <div className="flex flex-col">
              <span>{parts[0]}</span>
              <span className="text-muted-foreground text-xs">{parts[1]}</span>
            </div>
          );
        }
        return <span>{row.location}</span>;
      }
    },
    {
      key: "modality",
      label: "Modality",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge className={`${modalityStyles[row.modality]} min-w-[70px] justify-center`}>{row.modality}</Badge>
      ),
    },
    { key: "exam", label: "Exam" },
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
      key: "scheduledTime", 
      label: "Scheduled Time", 
      sortable: true,
      render: (row) => {
        if (!row.scheduledTime) return "—";
        const [date, time] = row.scheduledTime.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { key: "imagingLocation", label: "Imaging Location" },
    {
      key: "contrast",
      label: "Contrast",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => row.contrast ? (
        <Badge className="bg-amber-100 text-amber-700 min-w-[50px] justify-center">Yes</Badge>
      ) : (
        <span className="text-muted-foreground">No</span>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: "status",
      label: "Status",
      value: "all",
      options: [
        { value: "Ordered", label: "Ordered" },
        { value: "Scheduled", label: "Scheduled" },
        { value: "In-Progress", label: "In-Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Finalized", label: "Finalized" },
      ],
    },
    {
      key: "modality",
      label: "Modality",
      value: "all",
      options: [
        { value: "X-ray", label: "X-ray" },
        { value: "CT", label: "CT" },
        { value: "MRI", label: "MRI" },
        { value: "US", label: "Ultrasound" },
        { value: "Fluoro", label: "Fluoroscopy" },
        { value: "Mammo", label: "Mammography" },
      ],
    },
  ];

  const rowActions: RowAction<RadiologyOrderRecord>[] = [
    { label: "Open Order", onClick: (row) => navigate(`/diagnostics/radiology/${row.orderId}`) },
    { label: "View Images", onClick: (row) => console.log("View images", row.orderId) },
    { label: "Update Status", onClick: (row) => console.log("Update", row.orderId) },
  ];

  // Sort by priority (Stat first), then scheduled time
  const sortedOrders = [...radiologyOrders].sort((a, b) => {
    if (a.priority === "Stat" && b.priority !== "Stat") return -1;
    if (a.priority !== "Stat" && b.priority === "Stat") return 1;
    return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
  });

  return (
    <ListPageLayout
      title="Radiology Orders Today"
      count={radiologyOrders.length}
      breadcrumbs={["Overview", "Radiology Orders Today"]}
      columns={columns}
      data={sortedOrders}
      filters={filters}
      rowActions={rowActions}
      emptyMessage="No radiology orders for today."
      searchPlaceholder="Search by Order ID, patient name, exam..."
      getRowId={(row) => row.orderId}
      onRowClick={(row) => navigate(`/diagnostics/radiology/${row.orderId}`)}
      pageKey="radiology"
    />
  );
};

export default RadiologyOrdersToday;
