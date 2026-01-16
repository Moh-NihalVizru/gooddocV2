import { useNavigate } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { labOrders, LabOrderRecord } from "@/data/overview.mock";

const statusStyles: Record<LabOrderRecord["status"], string> = {
  "Ordered": "bg-gray-100 text-gray-700",
  "Collected": "bg-blue-100 text-blue-700",
  "In-Process": "bg-amber-100 text-amber-700",
  "Completed": "bg-green-100 text-green-700",
  "Verified": "bg-purple-100 text-purple-700",
};

const LabOrdersToday = () => {
  const navigate = useNavigate();

  const columns: Column<LabOrderRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.orderId} ageSex={row.ageSex} patientId={row.orderId} fromPage="lab-orders" />
    },
    { key: "visitId", label: "Visit ID" },
    { key: "location", label: "Location" },
    { key: "tests", label: "Tests" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge className={`${statusStyles[row.status]} min-w-[90px] justify-center`}>{row.status}</Badge>
      ),
    },
    { key: "specimenType", label: "Specimen Type" },
    { 
      key: "collectedAt", 
      label: "Collected At", 
      render: (row) => {
        if (!row.collectedAt) return "—";
        const [date, time] = row.collectedAt.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
    { key: "resultETA", label: "Result ETA", render: (row) => row.resultETA || "—" },
    {
      key: "criticalResult",
      label: "Critical Result",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => row.criticalResult ? (
        <Badge className="bg-red-100 text-red-700 min-w-[50px] justify-center">Yes</Badge>
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
        { value: "Collected", label: "Collected" },
        { value: "In-Process", label: "In-Process" },
        { value: "Completed", label: "Completed" },
        { value: "Verified", label: "Verified" },
      ],
    },
  ];

  const rowActions: RowAction<LabOrderRecord>[] = [
    { label: "Open Lab Order", onClick: (row) => navigate(`/diagnostics/lab/${row.orderId}`) },
    { label: "View Results", onClick: (row) => navigate(`/diagnostics/lab/${row.orderId}`) },
    { label: "Contact Lab", onClick: (row) => console.log("Contact lab for", row.orderId) },
  ];

  return (
    <ListPageLayout
      title="Lab Orders Today"
      count={labOrders.length}
      breadcrumbs={["Overview", "Lab Orders Today"]}
      columns={columns}
      data={labOrders}
      filters={filters}
      rowActions={rowActions}
      emptyMessage="No lab orders for today."
      searchPlaceholder="Search by Order ID, patient name, test..."
      getRowId={(row) => row.orderId}
      onRowClick={(row) => navigate(`/diagnostics/lab/${row.orderId}`)}
      pageKey="lab-results"
    />
  );
};

export default LabOrdersToday;
