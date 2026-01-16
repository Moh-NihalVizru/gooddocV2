import { useNavigate } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { bedChargesData, BedChargeRecord, totalBeds, totalOccupied, totalAvailable } from "@/data/bed-charges.mock";

const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const BedCharges = () => {
  const navigate = useNavigate();

  const columns: Column<BedChargeRecord>[] = [
    { 
      key: "bedType", 
      label: "Bed Type", 
      sortable: true,
      width: "200px",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.bedType}</span>
          <span className="text-muted-foreground text-xs">{row.ward}</span>
        </div>
      )
    },
    { 
      key: "roomCategory", 
      label: "Category",
      sortable: true,
      render: (row) => (
        <Badge variant="outline" className="font-normal">{row.roomCategory}</Badge>
      )
    },
    { 
      key: "dailyRate", 
      label: "Daily Rate", 
      sortable: true,
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.dailyRate)}</span>
      )
    },
    { 
      key: "nursingCharge", 
      label: "Nursing", 
      sortable: true,
      render: (row) => (
        <span className="text-muted-foreground">{formatCurrency(row.nursingCharge)}</span>
      )
    },
    { 
      key: "serviceCharge", 
      label: "Service", 
      sortable: true,
      render: (row) => (
        <span className="text-muted-foreground">{formatCurrency(row.serviceCharge)}</span>
      )
    },
    { 
      key: "totalPerDay", 
      label: "Total/Day", 
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-primary">{formatCurrency(row.totalPerDay)}</span>
      )
    },
    { 
      key: "occupancy", 
      label: "Occupancy", 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.occupancy}/{row.totalBeds}</span>
          <span className="text-muted-foreground text-xs">{row.totalBeds - row.occupancy} available</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <Badge className={row.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: "roomCategory",
      label: "Category",
      value: "all",
      options: [
        { value: "ICU", label: "ICU" },
        { value: "HDU", label: "HDU" },
        { value: "Private", label: "Private" },
        { value: "Semi-Private", label: "Semi-Private" },
        { value: "General", label: "General" },
        { value: "PICU", label: "PICU" },
        { value: "NICU", label: "NICU" },
        { value: "Maternity", label: "Maternity" },
        { value: "Emergency", label: "Emergency" },
        { value: "Day Care", label: "Day Care" },
        { value: "Isolation", label: "Isolation" },
        { value: "VIP", label: "VIP" },
      ],
    },
    {
      key: "status",
      label: "Status",
      value: "all",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
  ];

  const rowActions: RowAction<BedChargeRecord>[] = [
    { label: "Edit Charges", onClick: (row) => console.log("Edit", row.id) },
    { label: "View History", onClick: (row) => console.log("History", row.id) },
  ];

  return (
    <ListPageLayout
      title="Bed Charges Master"
      count={bedChargesData.length}
      breadcrumbs={["Settings", "Bed Charges"]}
      columns={columns}
      data={bedChargesData}
      filters={filters}
      rowActions={rowActions}
      emptyMessage="No bed charges found."
      searchPlaceholder="Search by bed type, ward, category..."
      getRowId={(row) => row.id}
      onRowClick={(row) => console.log("View details", row.id)}
    />
  );
};

export default BedCharges;
