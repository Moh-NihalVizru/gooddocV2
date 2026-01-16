export const mockPatientsByPhone: Record<string, any> = {
  "9876543210": {
    type: "IP" as const,
    name: "Harish Kalyan",
    gdid: "001",
    age: "35",
    gender: "Male",
    lastActivityShort: "In IP since May 2025",
    ipInfo: {
      doctor: "Dr. Hello World",
      ward: "25",
      bed: "34",
      emergencyContact: "", // Empty means "Not added"
    },
    pending: [
      { item: "ECG report", status: "Paid" },
      { item: "Blood test", status: "Pending" },
    ],
    pendingAmount: {
      outstanding: "₹ 6,600",
      advance: "₹ 3,200",
      bills: "₹ 9,800",
      balance: "₹ 3,400",
    },
    options: ["Add amount", "Book appointment", "Discharge"],
  },
  "0123456789": {
    type: "OP" as const,
    name: "Pooja Nair",
    gdid: "002",
    age: "—",
    gender: "Female",
    lastActivityShort: "Last visit: 2 hr ago — Consultation",
    pendingReports: "Doctor's report pending",
    pendingAmountNote: "",
    options: [
      "Add amount",
      "Book appointment",
      "Payments",
    ],
  },
};
