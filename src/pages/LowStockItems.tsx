import { useNavigate } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { lowStockItems, LowStockRecord } from "@/data/overview.mock";

const severityStyles: Record<LowStockRecord["severity"], string> = {
  "Normal": "bg-gray-100 text-gray-700",
  "Low": "bg-amber-100 text-amber-700",
  "Critical": "bg-red-100 text-red-700",
};

const categoryStyles: Record<LowStockRecord["category"], string> = {
  "Drug": "bg-blue-100 text-blue-700",
  "Consumable": "bg-green-100 text-green-700",
  "Device": "bg-purple-100 text-purple-700",
};

const LowStock = () => {
  const navigate = useNavigate();

  const columns: Column<LowStockRecord>[] = [
    { key: "itemName", label: "Item Name", sortable: true },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <Badge className={categoryStyles[row.category]}>{row.category}</Badge>
      ),
    },
    {
      key: "onHand",
      label: "On Hand",
      sortable: true,
      render: (row) => <span className="font-medium">{row.onHand}</span>,
    },
    { key: "reorderPoint", label: "Reorder Point" },
    { key: "parLevel", label: "Par Level" },
    {
      key: "avgDailyUse",
      label: "Avg Daily Use",
      render: (row) => <span>{row.avgDailyUse}/day</span>,
    },
    {
      key: "daysOfStockLeft",
      label: "Days of Stock Left",
      sortable: true,
      render: (row) => (
        <span className={row.daysOfStockLeft <= 2 ? "text-red-600 font-semibold" : row.daysOfStockLeft <= 5 ? "text-amber-600 font-medium" : ""}>
          {row.daysOfStockLeft} days
        </span>
      ),
    },
    {
      key: "onOrder",
      label: "On Order",
      render: (row) => row.onOrder > 0 ? (
        <Badge className="bg-green-100 text-green-700">{row.onOrder}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    },
    { key: "supplier", label: "Supplier" },
    {
      key: "leadTimeDays",
      label: "Lead Time",
      render: (row) => <span>{row.leadTimeDays} days</span>,
    },
    {
      key: "suggestedReorderQty",
      label: "Suggested Reorder",
      render: (row) => <span className="font-medium">{row.suggestedReorderQty}</span>,
    },
    {
      key: "severity",
      label: "Severity",
      sortable: true,
      render: (row) => (
        <Badge className={severityStyles[row.severity]}>{row.severity}</Badge>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: "category",
      label: "Category",
      value: "all",
      options: [
        { value: "Drug", label: "Drug" },
        { value: "Consumable", label: "Consumable" },
        { value: "Device", label: "Device" },
      ],
    },
    {
      key: "severity",
      label: "Severity",
      value: "all",
      options: [
        { value: "Critical", label: "Critical" },
        { value: "Low", label: "Low" },
        { value: "Normal", label: "Normal" },
      ],
    },
  ];

  const rowActions: RowAction<LowStockRecord>[] = [
    { label: "View Item", onClick: (row) => console.log("View", row.itemName) },
    { label: "Create Purchase Requisition", onClick: (row) => console.log("Create PR for", row.itemName) },
    { label: "Update Stock", onClick: (row) => console.log("Update stock", row.itemName) },
  ];

  return (
    <ListPageLayout
      title="Low Stock"
      count={lowStockItems.length}
      breadcrumbs={["Overview", "Low Stock"]}
      columns={columns}
      data={lowStockItems}
      filters={filters}
      rowActions={rowActions}
      emptyMessage="No low stock items."
      searchPlaceholder="Search by item name, category, supplier..."
      getRowId={(row) => row.itemName}
      pageKey="pharmacy"
    />
  );
};

export default LowStock;
