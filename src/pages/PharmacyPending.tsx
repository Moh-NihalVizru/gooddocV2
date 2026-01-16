import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { medicineOrders, MedicineOrderRecord } from "@/data/overview.mock";
import { formatINR } from "@/utils/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Pill, User } from "lucide-react";

const priorityStyles: Record<MedicineOrderRecord["priority"], string> = {
  "Routine": "bg-gray-100 text-gray-700",
  "Stat": "bg-red-100 text-red-700",
};

const paymentStatusStyles: Record<MedicineOrderRecord["paymentStatus"], string> = {
  "Paid": "bg-green-100 text-green-700",
  "Pending": "bg-amber-100 text-amber-700",
  "Partially Paid": "bg-blue-100 text-blue-700",
  "Waived": "bg-gray-100 text-gray-700",
};

const routeStyles: Record<MedicineOrderRecord["route"], string> = {
  "PO": "bg-green-100 text-green-700",
  "IV": "bg-red-100 text-red-700",
  "IM": "bg-amber-100 text-amber-700",
  "SC": "bg-blue-100 text-blue-700",
  "Topical": "bg-purple-100 text-purple-700",
};

const MedicineOrdersToday = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<MedicineOrderRecord | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleViewSummary = (row: MedicineOrderRecord) => {
    setSelectedOrder(row);
    setShowSummary(true);
  };

  const columns: Column<MedicineOrderRecord>[] = [
    { 
      key: "patient", 
      label: "Patient Info", 
      sortable: true,
      width: "220px",
      render: (row) => <PatientCell name={row.patient} gdid={row.orderId} ageSex={row.ageSex} patientId={row.orderId} fromPage="pharmacy" />
    },
    { key: "visitId", label: "Visit ID" },
    { key: "orderId", label: "Order ID" },
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
    { key: "prescriber", label: "Prescriber" },
    {
      key: "orderAmount",
      label: "Payment Details",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{formatINR(row.orderAmount)}</span>
          {row.paidAmount > 0 && (
            <span className="text-muted-foreground text-xs">
              Paid: {formatINR(row.paidAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      sortable: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge className={`${paymentStatusStyles[row.paymentStatus]} min-w-[100px] justify-center`}>{row.paymentStatus}</Badge>
      ),
    },
    { 
      key: "dispensedAt", 
      label: "Dispensed At", 
      render: (row) => {
        if (!row.dispensedAt) return "—";
        const [date, time] = row.dispensedAt.split(' ');
        return (
          <div className="flex flex-col">
            <span>{time}</span>
            <span className="text-muted-foreground text-xs">{date}</span>
          </div>
        );
      }
    },
  ];

  const filters: Filter[] = [
    {
      key: "paymentStatus",
      label: "Payment Status",
      value: "all",
      options: [
        { value: "Pending", label: "Pending" },
        { value: "Partially Paid", label: "Partially Paid" },
      ],
    },
  ];

  const rowActions: RowAction<MedicineOrderRecord>[] = [
    { label: "View Order Summary", onClick: (row) => handleViewSummary(row) },
  ];

  // Filter to only show Pending and Partially Paid, then sort by priority (Stat first), then order time
  const filteredOrders = medicineOrders.filter(
    (order) => order.paymentStatus === "Pending" || order.paymentStatus === "Partially Paid"
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.priority === "Stat" && b.priority !== "Stat") return -1;
    if (a.priority !== "Stat" && b.priority === "Stat") return 1;
    return new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime();
  });

  return (
    <>
      <ListPageLayout
        title="Medicine Orders Today"
        count={filteredOrders.length}
        breadcrumbs={["Overview", "Medicine Orders Today"]}
        columns={columns}
        data={sortedOrders}
        filters={filters}
        rowActions={rowActions}
        emptyMessage="No medicine orders for today."
        searchPlaceholder="Search by Order ID, patient name..."
        getRowId={(row) => row.orderId}
        onRowClick={(row) => navigate(`/patient-insights/${row.orderId}?from=pharmacy`)}
        pageKey="pharmacy"
      />

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Order Summary
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedOrder.ageSex.includes('F') ? 'bg-pink-500' : 'bg-primary'}`}>
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedOrder.patient}</p>
                  <p className="text-sm text-muted-foreground">GDID - {selectedOrder.orderId.replace(/\D/g, '').slice(-3).padStart(3, '0')} • {selectedOrder.ageSex}</p>
                </div>
                <Badge className={`ml-auto ${paymentStatusStyles[selectedOrder.paymentStatus]}`}>{selectedOrder.paymentStatus}</Badge>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="text-sm font-medium">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visit ID</p>
                  <p className="text-sm font-medium">{selectedOrder.visitId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge className={priorityStyles[selectedOrder.priority]}>{selectedOrder.priority}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Route</p>
                  <Badge className={routeStyles[selectedOrder.route]}>{selectedOrder.route}</Badge>
                </div>
              </div>

              <Separator />

              {/* Location & Prescriber */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{selectedOrder.location || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prescriber</p>
                  <p className="text-sm font-medium">{selectedOrder.prescriber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order Time</p>
                  <p className="text-sm font-medium">{selectedOrder.orderTime}</p>
                </div>
              </div>

              <Separator />

              {/* Dispensing Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Dispensed At</p>
                  <p className="text-sm font-medium">{selectedOrder.dispensedAt || "Not dispensed"}</p>
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Order Amount</p>
                  <p className="text-sm font-semibold">{formatINR(selectedOrder.orderAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid Amount</p>
                  <p className="text-sm font-medium text-green-600">{formatINR(selectedOrder.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className={`text-sm font-medium ${selectedOrder.orderAmount - selectedOrder.paidAmount > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                    {selectedOrder.orderAmount - selectedOrder.paidAmount > 0 
                      ? formatINR(selectedOrder.orderAmount - selectedOrder.paidAmount) 
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicineOrdersToday;