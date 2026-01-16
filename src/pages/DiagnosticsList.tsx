import { ListPageLayout, Column, Filter, RowAction } from "@/components/overview/ListPageLayout";
import { Badge } from "@/components/ui/badge";
import { PatientCell } from "@/components/overview/PatientCell";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { formatINR } from "@/utils/currency";
import { PaymentDetailsPopup } from "@/components/billing/PaymentDetailsPopup";

interface DiagnosticsOrder {
  id: string;
  patientId: string;
  patientName: string;
  gdid: string;
  ageSex: string;
  visitId: string;
  location: string;
  ward?: string;
  bed?: string;
  tests: string;
  type: "Laboratory" | "Radiology";
  specimenType?: string;
  modality?: string;
  status: string;
  collectedAt?: Date;
  scheduledAt?: Date;
  resultEta?: string;
  criticalResult: boolean;
  imagingLocation?: string;
  contrast?: boolean;
  orderedDoctor: string;
  department: string;
  // Payment details
  billAmount?: number;
  advancePaid?: number;
  totalPaid?: number;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
};

// Combined mock data - interleaved lab and radiology
const diagnosticsOrders: DiagnosticsOrder[] = [
  { id: "L001", patientId: "P000", patientName: "Anjali Kumar", gdid: "000", ageSex: "50 | M", visitId: "V25-100", location: "Ward-A", bed: "Bed 1", tests: "CBC", type: "Laboratory", specimenType: "Blood", status: "Pending", resultEta: "17:48", criticalResult: true, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R001", patientId: "P100", patientName: "Anjali Gupta", gdid: "100", ageSex: "41 | M", visitId: "V25-400", location: "Ward-A", bed: "Bed 1", tests: "Chest X-ray", type: "Radiology", modality: "X-ray", status: "Pending", scheduledAt: new Date("2025-12-18T08:00:00"), imagingLocation: "RAD-1", contrast: true, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
  { id: "L002", patientId: "P001", patientName: "Karthik Kumar", gdid: "001", ageSex: "49 | F", visitId: "V25-101", location: "OP", tests: "BMP", type: "Laboratory", specimenType: "Urine", status: "Pending", collectedAt: new Date("2025-12-18T15:19:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Suresh Patel", department: "General Medicine" },
  { id: "R002", patientId: "P101", patientName: "Karthik Gupta", gdid: "101", ageSex: "68 | F", visitId: "V25-401", location: "OP", tests: "CT Abdomen", type: "Radiology", modality: "CT", status: "Pending", scheduledAt: new Date("2025-12-18T08:15:00"), imagingLocation: "RAD-2", contrast: false, criticalResult: false, orderedDoctor: "Dr. Priya Sharma", department: "Gastroenterology" },
  { id: "L003", patientId: "P002", patientName: "Divya Kumar", gdid: "002", ageSex: "41 | M", visitId: "V25-102", location: "OP", tests: "CMP", type: "Laboratory", specimenType: "Stool", status: "Pending", collectedAt: new Date("2025-12-18T16:11:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Amit Singh", department: "Neurology" },
  { id: "R003", patientId: "P102", patientName: "Divya Gupta", gdid: "102", ageSex: "32 | M", visitId: "V25-402", location: "OP", tests: "MRI Brain", type: "Radiology", modality: "MRI", status: "Pending", scheduledAt: new Date("2025-12-18T08:30:00"), imagingLocation: "RAD-3", contrast: false, criticalResult: false, orderedDoctor: "Dr. Kavitha Menon", department: "Oncology" },
  { id: "L004", patientId: "P003", patientName: "Suresh Kumar", gdid: "003", ageSex: "60 | F", visitId: "V25-103", location: "Ward-A", bed: "Bed 4", tests: "Lipid Panel", type: "Laboratory", specimenType: "Swab", status: "Completed", collectedAt: new Date("2025-12-18T16:01:00"), criticalResult: false, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R004", patientId: "P103", patientName: "Suresh Gupta", gdid: "103", ageSex: "74 | F", visitId: "V25-403", location: "Ward-A", bed: "Bed 4", tests: "US Abdomen", type: "Radiology", modality: "US", status: "Completed", scheduledAt: new Date("2025-12-18T08:45:00"), imagingLocation: "RAD-4", contrast: false, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
  { id: "L005", patientId: "P004", patientName: "Lakshmi Kumar", gdid: "004", ageSex: "28 | M", visitId: "V25-104", location: "OP", tests: "LFT", type: "Laboratory", specimenType: "CSF", status: "Completed", collectedAt: new Date("2025-12-18T15:19:00"), criticalResult: false, orderedDoctor: "Dr. Suresh Patel", department: "General Medicine" },
  { id: "R005", patientId: "P104", patientName: "Lakshmi Gupta", gdid: "104", ageSex: "82 | M", visitId: "V25-404", location: "OP", tests: "CT Chest", type: "Radiology", modality: "Fluoro", status: "Completed", scheduledAt: new Date("2025-12-18T09:00:00"), imagingLocation: "RAD-1", contrast: true, criticalResult: false, orderedDoctor: "Dr. Priya Sharma", department: "Gastroenterology" },
  { id: "L006", patientId: "P005", patientName: "Rajan Kumar", gdid: "005", ageSex: "80 | F", visitId: "V25-105", location: "OP", tests: "TFT", type: "Laboratory", specimenType: "Sputum", status: "Pending", resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Amit Singh", department: "Neurology" },
  { id: "R006", patientId: "P105", patientName: "Rajan Gupta", gdid: "105", ageSex: "57 | F", visitId: "V25-405", location: "OP", tests: "MRI Spine", type: "Radiology", modality: "Mammo", status: "Pending", scheduledAt: new Date("2025-12-18T09:15:00"), imagingLocation: "RAD-2", contrast: false, criticalResult: false, orderedDoctor: "Dr. Kavitha Menon", department: "Oncology" },
  { id: "L007", patientId: "P006", patientName: "Meena Kumar", gdid: "006", ageSex: "40 | M", visitId: "V25-106", location: "Ward-A", bed: "Bed 7", tests: "Coagulation", type: "Laboratory", specimenType: "Blood", status: "Pending", collectedAt: new Date("2025-12-18T15:59:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R007", patientId: "P106", patientName: "Meena Gupta", gdid: "106", ageSex: "52 | M", visitId: "V25-406", location: "Ward-A", bed: "Bed 7", tests: "X-ray Knee", type: "Radiology", modality: "X-ray", status: "Pending", scheduledAt: new Date("2025-12-18T09:30:00"), imagingLocation: "RAD-3", contrast: false, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
  { id: "L008", patientId: "P007", patientName: "Arjun Kumar", gdid: "007", ageSex: "49 | F", visitId: "V25-107", location: "OP", tests: "Cardiac Markers", type: "Laboratory", specimenType: "Urine", status: "Pending", collectedAt: new Date("2025-12-18T16:11:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Suresh Patel", department: "General Medicine" },
  { id: "R008", patientId: "P107", patientName: "Arjun Gupta", gdid: "107", ageSex: "62 | F", visitId: "V25-407", location: "OP", tests: "CT Head", type: "Radiology", modality: "CT", status: "Pending", scheduledAt: new Date("2025-12-18T09:45:00"), imagingLocation: "RAD-4", contrast: false, criticalResult: false, orderedDoctor: "Dr. Priya Sharma", department: "Gastroenterology" },
  { id: "L009", patientId: "P008", patientName: "Kavitha Kumar", gdid: "008", ageSex: "22 | M", visitId: "V25-108", location: "OP", tests: "Urinalysis", type: "Laboratory", specimenType: "Stool", status: "Completed", collectedAt: new Date("2025-12-18T15:21:00"), criticalResult: false, orderedDoctor: "Dr. Amit Singh", department: "Neurology" },
  { id: "R009", patientId: "P108", patientName: "Kavitha Gupta", gdid: "108", ageSex: "64 | M", visitId: "V25-408", location: "OP", tests: "Chest X-ray", type: "Radiology", modality: "MRI", status: "Completed", scheduledAt: new Date("2025-12-18T10:00:00"), imagingLocation: "RAD-1", contrast: true, criticalResult: false, orderedDoctor: "Dr. Kavitha Menon", department: "Oncology" },
  { id: "L010", patientId: "P009", patientName: "Sanjay Kumar", gdid: "009", ageSex: "61 | F", visitId: "V25-109", location: "Ward-A", bed: "Bed 10", tests: "CBC", type: "Laboratory", specimenType: "Swab", status: "Completed", collectedAt: new Date("2025-12-18T15:51:00"), criticalResult: false, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R010", patientId: "P109", patientName: "Sanjay Gupta", gdid: "109", ageSex: "23 | F", visitId: "V25-409", location: "Ward-A", bed: "Bed 10", tests: "CT Abdomen", type: "Radiology", modality: "US", status: "Completed", scheduledAt: new Date("2025-12-18T10:15:00"), imagingLocation: "RAD-2", contrast: false, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
  { id: "L011", patientId: "P010", patientName: "Amit Singh", gdid: "010", ageSex: "67 | M", visitId: "V25-110", location: "OP", tests: "BMP", type: "Laboratory", specimenType: "CSF", status: "Pending", resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Suresh Patel", department: "General Medicine" },
  { id: "R011", patientId: "P110", patientName: "Amit Gupta", gdid: "110", ageSex: "45 | M", visitId: "V25-410", location: "OP", tests: "MRI Brain", type: "Radiology", modality: "MRI", status: "Pending", scheduledAt: new Date("2025-12-18T10:30:00"), imagingLocation: "RAD-3", contrast: false, criticalResult: false, orderedDoctor: "Dr. Priya Sharma", department: "Gastroenterology" },
  { id: "L012", patientId: "P011", patientName: "Priya Singh", gdid: "011", ageSex: "23 | F", visitId: "V25-111", location: "OP", tests: "CMP", type: "Laboratory", specimenType: "Sputum", status: "Pending", collectedAt: new Date("2025-12-18T16:13:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Amit Singh", department: "Neurology" },
  { id: "R012", patientId: "P111", patientName: "Priya Gupta", gdid: "111", ageSex: "38 | F", visitId: "V25-411", location: "OP", tests: "US Abdomen", type: "Radiology", modality: "US", status: "Pending", scheduledAt: new Date("2025-12-18T10:45:00"), imagingLocation: "RAD-4", contrast: false, criticalResult: false, orderedDoctor: "Dr. Kavitha Menon", department: "Oncology" },
  { id: "L013", patientId: "P012", patientName: "Rahul Singh", gdid: "012", ageSex: "54 | M", visitId: "V25-112", location: "Ward-A", bed: "Bed 3", tests: "Lipid Panel", type: "Laboratory", specimenType: "Blood", status: "Pending", collectedAt: new Date("2025-12-18T15:47:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R013", patientId: "P112", patientName: "Rahul Gupta", gdid: "112", ageSex: "52 | M", visitId: "V25-412", location: "Ward-A", bed: "Bed 3", tests: "CT Chest", type: "Radiology", modality: "CT", status: "Pending", scheduledAt: new Date("2025-12-18T11:00:00"), imagingLocation: "RAD-1", contrast: true, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
  { id: "L014", patientId: "P013", patientName: "Sneha Singh", gdid: "013", ageSex: "57 | F", visitId: "V25-113", location: "OP", tests: "LFT", type: "Laboratory", specimenType: "Urine", status: "Completed", collectedAt: new Date("2025-12-18T15:51:00"), criticalResult: false, orderedDoctor: "Dr. Suresh Patel", department: "General Medicine" },
  { id: "R014", patientId: "P113", patientName: "Sneha Gupta", gdid: "113", ageSex: "29 | F", visitId: "V25-413", location: "OP", tests: "MRI Spine", type: "Radiology", modality: "MRI", status: "Completed", scheduledAt: new Date("2025-12-18T11:15:00"), imagingLocation: "RAD-2", contrast: false, criticalResult: false, orderedDoctor: "Dr. Priya Sharma", department: "Gastroenterology" },
  { id: "L015", patientId: "P014", patientName: "Vikram Singh", gdid: "014", ageSex: "36 | M", visitId: "V25-114", location: "OP", tests: "TFT", type: "Laboratory", specimenType: "Stool", status: "Completed", collectedAt: new Date("2025-12-18T16:11:00"), criticalResult: false, orderedDoctor: "Dr. Amit Singh", department: "Neurology" },
  { id: "R015", patientId: "P114", patientName: "Vikram Gupta", gdid: "114", ageSex: "44 | M", visitId: "V25-414", location: "OP", tests: "X-ray Knee", type: "Radiology", modality: "X-ray", status: "Completed", scheduledAt: new Date("2025-12-18T11:30:00"), imagingLocation: "RAD-3", contrast: false, criticalResult: false, orderedDoctor: "Dr. Kavitha Menon", department: "Oncology" },
  { id: "L016", patientId: "P015", patientName: "Anjali Singh", gdid: "015", ageSex: "69 | F", visitId: "V25-115", location: "Ward-A", bed: "Bed 6", tests: "Coagulation", type: "Laboratory", specimenType: "Swab", status: "Pending", resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R016", patientId: "P115", patientName: "Anjali Sharma", gdid: "115", ageSex: "55 | F", visitId: "V25-415", location: "Ward-A", bed: "Bed 6", tests: "CT Head", type: "Radiology", modality: "CT", status: "Pending", scheduledAt: new Date("2025-12-18T11:45:00"), imagingLocation: "RAD-4", contrast: false, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
  { id: "L017", patientId: "P016", patientName: "Karthik Singh", gdid: "016", ageSex: "76 | M", visitId: "V25-116", location: "OP", tests: "Cardiac Markers", type: "Laboratory", specimenType: "CSF", status: "Pending", collectedAt: new Date("2025-12-18T16:04:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Suresh Patel", department: "General Medicine" },
  { id: "R017", patientId: "P116", patientName: "Karthik Sharma", gdid: "116", ageSex: "61 | M", visitId: "V25-416", location: "OP", tests: "Chest X-ray", type: "Radiology", modality: "X-ray", status: "Pending", scheduledAt: new Date("2025-12-18T12:00:00"), imagingLocation: "RAD-1", contrast: true, criticalResult: false, orderedDoctor: "Dr. Priya Sharma", department: "Gastroenterology" },
  { id: "L018", patientId: "P017", patientName: "Divya Singh", gdid: "017", ageSex: "46 | F", visitId: "V25-117", location: "OP", tests: "Urinalysis", type: "Laboratory", specimenType: "Sputum", status: "Pending", collectedAt: new Date("2025-12-18T15:44:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Amit Singh", department: "Neurology" },
  { id: "R018", patientId: "P117", patientName: "Divya Sharma", gdid: "117", ageSex: "33 | F", visitId: "V25-417", location: "OP", tests: "CT Abdomen", type: "Radiology", modality: "CT", status: "Pending", scheduledAt: new Date("2025-12-18T12:15:00"), imagingLocation: "RAD-2", contrast: false, criticalResult: false, orderedDoctor: "Dr. Kavitha Menon", department: "Oncology" },
  { id: "L019", patientId: "P018", patientName: "Suresh Singh", gdid: "018", ageSex: "30 | M", visitId: "V25-118", location: "Ward-A", bed: "Bed 9", tests: "CBC", type: "Laboratory", specimenType: "Blood", status: "Completed", collectedAt: new Date("2025-12-18T16:01:00"), criticalResult: false, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R019", patientId: "P118", patientName: "Suresh Sharma", gdid: "118", ageSex: "21 | M", visitId: "V25-418", location: "Ward-A", bed: "Bed 9", tests: "MRI Brain", type: "Radiology", modality: "MRI", status: "Completed", scheduledAt: new Date("2025-12-18T12:30:00"), imagingLocation: "RAD-3", contrast: false, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
  { id: "L020", patientId: "P019", patientName: "Lakshmi Singh", gdid: "019", ageSex: "45 | F", visitId: "V25-119", location: "OP", tests: "BMP", type: "Laboratory", specimenType: "Urine", status: "Completed", collectedAt: new Date("2025-12-18T15:41:00"), criticalResult: false, orderedDoctor: "Dr. Suresh Patel", department: "General Medicine" },
  { id: "R020", patientId: "P119", patientName: "Lakshmi Sharma", gdid: "119", ageSex: "48 | F", visitId: "V25-419", location: "OP", tests: "US Abdomen", type: "Radiology", modality: "US", status: "Completed", scheduledAt: new Date("2025-12-18T12:45:00"), imagingLocation: "RAD-4", contrast: false, criticalResult: false, orderedDoctor: "Dr. Priya Sharma", department: "Gastroenterology" },
  { id: "L021", patientId: "P020", patientName: "Rajan Singh", gdid: "020", ageSex: "42 | M", visitId: "V25-120", location: "OP", tests: "CMP", type: "Laboratory", specimenType: "Stool", status: "Pending", resultEta: "17:48", criticalResult: true, orderedDoctor: "Dr. Amit Singh", department: "Neurology" },
  { id: "R021", patientId: "P120", patientName: "Rajan Sharma", gdid: "120", ageSex: "58 | M", visitId: "V25-420", location: "OP", tests: "CT Chest", type: "Radiology", modality: "CT", status: "Pending", scheduledAt: new Date("2025-12-18T13:00:00"), imagingLocation: "RAD-1", contrast: true, criticalResult: true, orderedDoctor: "Dr. Kavitha Menon", department: "Oncology" },
  { id: "L022", patientId: "P021", patientName: "Meena Singh", gdid: "021", ageSex: "48 | F", visitId: "V25-121", location: "Ward-A", bed: "Bed 2", tests: "Lipid Panel", type: "Laboratory", specimenType: "Swab", status: "Pending", collectedAt: new Date("2025-12-18T15:30:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R022", patientId: "P121", patientName: "Meena Sharma", gdid: "121", ageSex: "39 | F", visitId: "V25-421", location: "Ward-A", bed: "Bed 2", tests: "MRI Spine", type: "Radiology", modality: "MRI", status: "Pending", scheduledAt: new Date("2025-12-18T13:15:00"), imagingLocation: "RAD-2", contrast: false, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
  { id: "L023", patientId: "P022", patientName: "Arjun Singh", gdid: "022", ageSex: "71 | M", visitId: "V25-122", location: "OP", tests: "LFT", type: "Laboratory", specimenType: "CSF", status: "Pending", collectedAt: new Date("2025-12-18T15:40:00"), resultEta: "17:48", criticalResult: false, orderedDoctor: "Dr. Suresh Patel", department: "General Medicine" },
  { id: "R023", patientId: "P122", patientName: "Arjun Sharma", gdid: "122", ageSex: "66 | M", visitId: "V25-422", location: "OP", tests: "X-ray Knee", type: "Radiology", modality: "X-ray", status: "Pending", scheduledAt: new Date("2025-12-18T13:30:00"), imagingLocation: "RAD-3", contrast: false, criticalResult: false, orderedDoctor: "Dr. Priya Sharma", department: "Gastroenterology" },
  { id: "L024", patientId: "P023", patientName: "Kavitha Singh", gdid: "023", ageSex: "59 | F", visitId: "V25-123", location: "OP", tests: "TFT", type: "Laboratory", specimenType: "Sputum", status: "Completed", collectedAt: new Date("2025-12-18T16:17:00"), criticalResult: false, orderedDoctor: "Dr. Amit Singh", department: "Neurology" },
  { id: "R024", patientId: "P123", patientName: "Kavitha Sharma", gdid: "123", ageSex: "47 | F", visitId: "V25-423", location: "OP", tests: "CT Head", type: "Radiology", modality: "CT", status: "Completed", scheduledAt: new Date("2025-12-18T13:45:00"), imagingLocation: "RAD-4", contrast: false, criticalResult: false, orderedDoctor: "Dr. Kavitha Menon", department: "Oncology" },
  { id: "L025", patientId: "P024", patientName: "Sanjay Singh", gdid: "024", ageSex: "65 | M", visitId: "V25-124", location: "Ward-A", bed: "Bed 5", tests: "Coagulation", type: "Laboratory", specimenType: "Blood", status: "Completed", collectedAt: new Date("2025-12-18T15:55:00"), criticalResult: false, orderedDoctor: "Dr. Rajesh Kumar", department: "Orthopedics" },
  { id: "R025", patientId: "P124", patientName: "Sanjay Sharma", gdid: "124", ageSex: "20 | M", visitId: "V25-424", location: "Ward-A", bed: "Bed 5", tests: "Chest X-ray", type: "Radiology", modality: "X-ray", status: "Completed", scheduledAt: new Date("2025-12-18T14:00:00"), imagingLocation: "RAD-1", contrast: true, criticalResult: false, orderedDoctor: "Dr. Meera Nair", department: "Cardiology" },
];

export default function DiagnosticsList() {
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get("type");
  const [selectedOrder, setSelectedOrder] = useState<DiagnosticsOrder | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  
  // Filter data based on URL param
  const filteredData = typeFilter 
    ? diagnosticsOrders.filter(order => order.type === typeFilter)
    : diagnosticsOrders;
  
  // Dynamic title based on filter
  const title = typeFilter || "Diagnostics";

  const columns: Column<DiagnosticsOrder>[] = [
    {
      key: "patient",
      label: "Patient",
      render: (row) => (
        <PatientCell
          patientId={row.patientId}
          name={row.patientName}
          gdid={row.gdid}
          ageSex={row.ageSex}
          fromPage="diagnostics"
        />
      ),
    },
    {
      key: "visitId",
      label: "Visit ID",
      render: (row) => <span className="font-medium text-sm">{row.visitId}</span>,
    },
    {
      key: "location",
      label: "Patient Type",
      render: (row) => (
        <span className="text-sm">{row.location === "OP" ? "OP" : "IP"}</span>
      ),
    },
    {
      key: "orderedDoctor",
      label: "Ordered Doctor",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm">{row.orderedDoctor}</span>
          <span className="text-xs text-muted-foreground">{row.department}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <span className="text-sm">{row.type}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <Badge className={`${statusStyles[row.status] || "bg-gray-100 text-gray-700"} min-w-[120px] justify-center`}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "billAmount",
      label: "Payment Details",
      render: (row) => {
        // Generate bill amount based on id for variety
        const billAmounts = [500, 800, 1200, 1500, 2000, 2500, 3000, 1800, 2200, 900];
        const numericPart = parseInt(row.id.replace(/\D/g, '')) || 0;
        const billAmount = row.billAmount ?? billAmounts[numericPart % billAmounts.length];
        const advance = row.advancePaid ?? row.totalPaid ?? 0;
        const balance = billAmount - advance;
        
        return (
          <div className="flex flex-col text-xs space-y-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Bill:</span>
              <span className="font-medium">{formatINR(billAmount * 100)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Advance:</span>
              <span className="text-green-600">{formatINR(advance * 100)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Balance:</span>
              <span className={balance > 0 ? "text-amber-600 font-medium" : "text-green-600"}>{formatINR(balance * 100)}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "orderedTime",
      label: "Ordered Time",
      render: (row) => {
        const dateTime = row.type === "Laboratory" ? row.collectedAt : row.scheduledAt;
        if (!dateTime) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col">
            <span className="text-sm">{format(dateTime, "HH:mm")}</span>
            <span className="text-xs text-muted-foreground">{format(dateTime, "dd-MMM-yyyy")}</span>
          </div>
        );
      },
    },
  ];

  const filters: Filter[] = [
    {
      key: "type",
      label: "Type",
      value: "all",
      options: [
        { label: "Laboratory", value: "Laboratory" },
        { label: "Radiology", value: "Radiology" },
      ],
    },
    {
      key: "status",
      label: "Status",
      value: "all",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Completed", value: "Completed" },
      ],
    },
  ];

  const rowActions: RowAction<DiagnosticsOrder>[] = [
    { 
      label: "Payment Details", 
      onClick: (row) => {
        setSelectedOrder(row);
        setSummaryOpen(true);
      }
    },
    { label: "Patient Insight", onClick: (row) => console.log("Patient insight", row.patientId) },
  ];

  const getPatientBillAmount = (order: DiagnosticsOrder) => {
    const billAmounts = [800, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
    const numericPart = parseInt(order.gdid.replace(/\D/g, '')) || 0;
    return order.billAmount ?? billAmounts[numericPart % billAmounts.length];
  };

  return (
    <>
      <ListPageLayout
        title={title}
        count={filteredData.length}
        columns={columns}
        data={filteredData}
        filters={filters}
        rowActions={rowActions}
        searchPlaceholder="Search by patient name, visit ID, test..."
        breadcrumbs={["Overview", title]}
        emptyMessage="No diagnostics orders found"
        getRowId={(row) => row.id}
        pageKey="diagnostics"
      />

      {selectedOrder && (
        <PaymentDetailsPopup
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
          patientName={selectedOrder.patientName}
          gdid={selectedOrder.gdid}
          ageSex={selectedOrder.ageSex}
          billAmount={getPatientBillAmount(selectedOrder)}
          advancePaid={selectedOrder.advancePaid ?? selectedOrder.totalPaid ?? 0}
          unbilledAmount={500}
        />
      )}
    </>
  );
}
