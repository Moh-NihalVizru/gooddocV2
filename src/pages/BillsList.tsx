import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListPageLayout, Column, Filter, RowAction, UrlParamFilter } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { billsData, paidBills, partialBills, outstandingBills, BillRecord } from "@/data/bills.mock";

const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const statusStyles: Record<BillRecord["status"], string> = {
  "Paid": "bg-green-100 text-green-700",
  "Partial": "bg-amber-100 text-amber-700",
  "Unpaid": "bg-red-100 text-red-700",
};

const paymentModeStyles: Record<BillRecord["paymentMode"], string> = {
  "Cash": "bg-gray-100 text-gray-700",
  "Card": "bg-blue-100 text-blue-700",
  "UPI": "bg-purple-100 text-purple-700",
  "Insurance": "bg-teal-100 text-teal-700",
  "Mixed": "bg-indigo-100 text-indigo-700",
};

const BillsList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get("type");

  let data = billsData;
  let displayCount = billsData.length;
  let pageTitle = "Bills & Revenue";

  if (typeFilter === "paid") {
    data = paidBills;
    displayCount = paidBills.length;
    pageTitle = "Paid Bills";
  } else if (typeFilter === "outstanding") {
    data = outstandingBills;
    displayCount = outstandingBills.length;
    pageTitle = "Outstanding Bills";
  } else if (typeFilter === "partial") {
    data = partialBills;
    displayCount = partialBills.length;
    pageTitle = "Partial Bills";
  }

  const columns: Column<BillRecord>[] = [
    { 
      key: "patientName", 
      label: "Patient", 
      sortable: true,
      width: "200px",
      render: (row) => <PatientCell name={row.patientName} gdid={row.patientId} ageSex={row.ageSex} patientId={row.patientId} fromPage="bills" />
    },
    { 
      key: "invoiceNo", 
      label: "Invoice No.",
      render: (row) => (
        <span className="font-medium">{row.invoiceNo}</span>
      )
    },
    { 
      key: "billDate", 
      label: "Bill Date", 
      sortable: true,
      render: (row) => {
        const [date, time] = row.billDate.split(' ');
        return (
          <div className="flex flex-col">
            <span>{date}</span>
            <span className="text-muted-foreground text-xs">{time}</span>
          </div>
        );
      }
    },
    {
      key: "doctor", 
      label: "Doctor", 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.doctor}</span>
          <span className="text-muted-foreground text-xs">{row.department}</span>
        </div>
      )
    },
    { 
      key: "netAmount", 
      label: "Amount", 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold">{formatCurrency(row.netAmount)}</span>
          {row.discount > 0 && (
            <span className="text-muted-foreground text-xs line-through">{formatCurrency(row.amount)}</span>
          )}
        </div>
      )
    },
    { 
      key: "paidAmount", 
      label: "Paid", 
      sortable: true,
      render: (row) => (
        <span className="text-green-600 font-medium">{formatCurrency(row.paidAmount)}</span>
      )
    },
    { 
      key: "balance", 
      label: "Balance", 
      sortable: true,
      render: (row) => (
        <span className={row.balance > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
          {row.balance > 0 ? formatCurrency(row.balance) : "—"}
        </span>
      )
    },
    {
      key: "paymentMode",
      label: "Payment Mode",
      render: (row) => (
        <span className="text-sm text-muted-foreground">{row.status === "Unpaid" ? "—" : row.paymentMode}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <Badge className={statusStyles[row.status]}>{row.status}</Badge>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: "department",
      label: "Department",
      value: "all",
      options: [
        { value: "Cardiology", label: "Cardiology" },
        { value: "Orthopedics", label: "Orthopedics" },
        { value: "Neurology", label: "Neurology" },
        { value: "General Medicine", label: "General Medicine" },
        { value: "Oncology", label: "Oncology" },
        { value: "Dermatology", label: "Dermatology" },
      ],
    },
    {
      key: "status",
      label: "Status",
      value: "all",
      options: [
        { value: "Paid", label: "Paid" },
        { value: "Partial", label: "Partial" },
        { value: "Unpaid", label: "Unpaid" },
      ],
    },
    {
      key: "paymentMode",
      label: "Payment Mode",
      value: "all",
      options: [
        { value: "Cash", label: "Cash" },
        { value: "Card", label: "Card" },
        { value: "UPI", label: "UPI" },
        { value: "Insurance", label: "Insurance" },
        { value: "Mixed", label: "Mixed" },
      ],
    },
  ];

  const urlParamFilters: UrlParamFilter[] = [
    { paramKey: "type", paramValue: "paid", displayLabel: "Paid Bills", count: paidBills.length },
    { paramKey: "type", paramValue: "outstanding", displayLabel: "Outstanding", count: outstandingBills.length },
  ];

  const rowActions: RowAction<BillRecord>[] = [
    { label: "View Invoice", onClick: (row) => console.log("View invoice", row.invoiceNo) },
    { label: "Print Bill", onClick: (row) => console.log("Print bill", row.billId) },
    { label: "Collect Payment", onClick: (row) => navigate(`/patient-insights/${row.patientId}/payments?action=collect&billId=${row.billId}`), hidden: (row) => row.status === "Paid" },
    { label: "Patient Insight", onClick: (row) => navigate(`/patient-insights/${row.patientId}?from=bills`) },
  ];

  return (
    <ListPageLayout
      title={pageTitle}
      count={displayCount}
      breadcrumbs={["Overview", "Bills & Revenue"]}
      columns={columns}
      data={data}
      filters={filters}
      rowActions={rowActions}
      urlParamFilters={urlParamFilters}
      emptyMessage="No bills found."
      searchPlaceholder="Search by Invoice No, patient name, Visit ID..."
      getRowId={(row) => row.billId}
      onRowClick={(row) => console.log("View bill details", row.billId)}
      pageKey="billing"
    />
  );
};

export default BillsList;
