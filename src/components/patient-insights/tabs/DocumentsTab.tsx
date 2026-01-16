import { Download, Printer, Trash2, Upload, FileText, Image, FileSpreadsheet, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Visit } from "../VisitListItem";

interface DocumentsTabProps {
  selectedVisit: Visit | null;
}

type DocumentType = "report" | "prescription" | "image" | "lab" | "consent" | "discharge";
type DocumentStatus = "final" | "preliminary" | "amended" | "pending";

interface Document {
  id: string;
  documentNo: string;
  name: string;
  type: DocumentType;
  date: string;
  time: string;
  visitId: string;
  service: string;
  orderedBy: string;
  preparedBy: string;
  verifiedBy?: string;
  size: string;
  format: string;
  status: DocumentStatus;
  version: number;
}

const getDocumentIcon = (type: DocumentType, format: string) => {
  if (format === "PDF") return <FileText className="h-4 w-4 text-red-500" />;
  if (format === "DICOM" || format === "JPEG") return <Image className="h-4 w-4 text-blue-500" />;
  if (format === "CSV" || format === "XLS") return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

const getStatusBadge = (status: DocumentStatus) => {
  switch (status) {
    case "final":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Final</Badge>;
    case "preliminary":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Preliminary</Badge>;
    case "amended":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Amended</Badge>;
    case "pending":
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">Pending</Badge>;
    default:
      return null;
  }
};

const getTypeBadge = (type: DocumentType) => {
  const colors: Record<DocumentType, string> = {
    report: "bg-purple-50 text-purple-700 border-purple-200",
    prescription: "bg-teal-50 text-teal-700 border-teal-200",
    image: "bg-blue-50 text-blue-700 border-blue-200",
    lab: "bg-orange-50 text-orange-700 border-orange-200",
    consent: "bg-gray-50 text-gray-700 border-gray-200",
    discharge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  const labels: Record<DocumentType, string> = {
    report: "Report",
    prescription: "Rx",
    image: "Image",
    lab: "Lab",
    consent: "Consent",
    discharge: "Discharge",
  };
  return <Badge variant="outline" className={`${colors[type]} text-xs`}>{labels[type]}</Badge>;
};

const allDocuments: Document[] = [
  // V25-004 documents (Active visit - Cardiology follow-up)
  {
    id: "doc-041",
    documentNo: "DOC521",
    name: "Cardiology Consultation Notes",
    type: "report",
    date: "20 Dec 2025",
    time: "10:45 AM",
    visitId: "V25-004",
    service: "Cardiology OPD",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "Dr. Meera Nair",
    verifiedBy: "Dr. Meera Nair",
    size: "156.2 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-042",
    documentNo: "DOC522",
    name: "12-Lead ECG Report",
    type: "report",
    date: "20 Dec 2025",
    time: "11:15 AM",
    visitId: "V25-004",
    service: "Cardiology Diagnostics",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "ECG Tech - Ramesh K",
    verifiedBy: "Dr. Meera Nair",
    size: "892.4 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-043",
    documentNo: "DOC523",
    name: "ECG Tracing Image",
    type: "image",
    date: "20 Dec 2025",
    time: "11:10 AM",
    visitId: "V25-004",
    service: "Cardiology Diagnostics",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "ECG Tech - Ramesh K",
    size: "1.2 MB",
    format: "JPEG",
    status: "final",
    version: 1,
  },
  {
    id: "doc-044",
    documentNo: "RXN845",
    name: "Prescription",
    type: "prescription",
    date: "20 Dec 2025",
    time: "11:30 AM",
    visitId: "V25-004",
    service: "Cardiology OPD",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "Dr. Meera Nair",
    size: "45.8 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-045",
    documentNo: "LAB456",
    name: "Lipid Profile Report",
    type: "lab",
    date: "20 Dec 2025",
    time: "12:00 PM",
    visitId: "V25-004",
    service: "Clinical Biochemistry",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "Lab Tech - Anita S",
    verifiedBy: "Dr. Sunita Rao (Pathologist)",
    size: "124.5 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  // V25-002 documents (General Medicine checkup)
  {
    id: "doc-021",
    documentNo: "DOC412",
    name: "Health Checkup Report",
    type: "report",
    date: "15 Dec 2025",
    time: "09:30 AM",
    visitId: "V25-002",
    service: "General Medicine OPD",
    orderedBy: "Dr. Priya Menon",
    preparedBy: "Dr. Priya Menon",
    verifiedBy: "Dr. Priya Menon",
    size: "324.6 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-022",
    documentNo: "LAB234",
    name: "Complete Blood Count (CBC)",
    type: "lab",
    date: "15 Dec 2025",
    time: "10:00 AM",
    visitId: "V25-002",
    service: "Hematology",
    orderedBy: "Dr. Priya Menon",
    preparedBy: "Lab Tech - Ravi M",
    verifiedBy: "Dr. Sunita Rao (Pathologist)",
    size: "189.3 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-023",
    documentNo: "LAB235",
    name: "Lipid Profile Report",
    type: "lab",
    date: "15 Dec 2025",
    time: "10:15 AM",
    visitId: "V25-002",
    service: "Clinical Biochemistry",
    orderedBy: "Dr. Priya Menon",
    preparedBy: "Lab Tech - Anita S",
    verifiedBy: "Dr. Sunita Rao (Pathologist)",
    size: "145.8 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-024",
    documentNo: "RXN712",
    name: "Prescription",
    type: "prescription",
    date: "15 Dec 2025",
    time: "11:00 AM",
    visitId: "V25-002",
    service: "General Medicine OPD",
    orderedBy: "Dr. Priya Menon",
    preparedBy: "Dr. Priya Menon",
    size: "98.2 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  // V25-001 documents (Cardiology - Chest pain)
  {
    id: "doc-011",
    documentNo: "DOC201",
    name: "Cardiology Consultation Notes",
    type: "report",
    date: "01 Dec 2025",
    time: "02:00 PM",
    visitId: "V25-001",
    service: "Cardiology OPD",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "Dr. Meera Nair",
    verifiedBy: "Dr. Meera Nair",
    size: "278.5 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-012",
    documentNo: "DOC202",
    name: "12-Lead ECG Report",
    type: "report",
    date: "01 Dec 2025",
    time: "02:30 PM",
    visitId: "V25-001",
    service: "Cardiology Diagnostics",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "ECG Tech - Ramesh K",
    verifiedBy: "Dr. Meera Nair",
    size: "756.2 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-013",
    documentNo: "RAD456",
    name: "Chest X-Ray (PA View)",
    type: "image",
    date: "01 Dec 2025",
    time: "03:00 PM",
    visitId: "V25-001",
    service: "Radiology",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "Radiographer - Suresh P",
    verifiedBy: "Dr. Vinod Kumar (Radiologist)",
    size: "2.1 MB",
    format: "DICOM",
    status: "final",
    version: 1,
  },
  {
    id: "doc-014",
    documentNo: "RXN456",
    name: "Prescription",
    type: "prescription",
    date: "01 Dec 2025",
    time: "03:30 PM",
    visitId: "V25-001",
    service: "Cardiology OPD",
    orderedBy: "Dr. Meera Nair",
    preparedBy: "Dr. Meera Nair",
    size: "112.4 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  // V24-089 documents (Orthopedics - Back pain)
  {
    id: "doc-891",
    documentNo: "DOC890",
    name: "Orthopedics Consultation Notes",
    type: "report",
    date: "15 Nov 2025",
    time: "10:00 AM",
    visitId: "V24-089",
    service: "Orthopedics OPD",
    orderedBy: "Dr. Arun Kumar",
    preparedBy: "Dr. Arun Kumar",
    verifiedBy: "Dr. Arun Kumar",
    size: "234.7 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-892",
    documentNo: "RAD234",
    name: "MRI Lumbar Spine",
    type: "image",
    date: "15 Nov 2025",
    time: "11:30 AM",
    visitId: "V24-089",
    service: "Radiology - MRI",
    orderedBy: "Dr. Arun Kumar",
    preparedBy: "MRI Tech - Kiran D",
    verifiedBy: "Dr. Vinod Kumar (Radiologist)",
    size: "4.8 MB",
    format: "DICOM",
    status: "final",
    version: 1,
  },
  {
    id: "doc-893",
    documentNo: "DOC891",
    name: "Physiotherapy Treatment Plan",
    type: "report",
    date: "16 Nov 2025",
    time: "09:00 AM",
    visitId: "V24-089",
    service: "Physical Medicine & Rehab",
    orderedBy: "Dr. Arun Kumar",
    preparedBy: "PT - Lakshmi R",
    size: "156.3 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
  {
    id: "doc-894",
    documentNo: "RXN234",
    name: "Prescription",
    type: "prescription",
    date: "15 Nov 2025",
    time: "10:30 AM",
    visitId: "V24-089",
    service: "Orthopedics OPD",
    orderedBy: "Dr. Arun Kumar",
    preparedBy: "Dr. Arun Kumar",
    size: "89.5 KB",
    format: "PDF",
    status: "final",
    version: 1,
  },
];

export function DocumentsTab({ selectedVisit }: DocumentsTabProps) {
  if (!selectedVisit) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select a visit to view documents.
        </p>
      </div>
    );
  }

  // Filter documents for selected visit
  const visitDocuments = allDocuments.filter(
    (doc) => doc.visitId === selectedVisit.visitId
  );

  if (visitDocuments.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No documents found for this visit.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-foreground">Visit Documents</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-card">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 w-[100px] uppercase">DOCUMENT NO.</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 w-[200px] uppercase">DOCUMENT NAME</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 w-[120px] uppercase">DATE & TIME</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 w-[160px] uppercase">SERVICE</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 w-[200px] uppercase">PREPARED / VERIFIED BY</th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3 w-[120px] uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card">
              {visitDocuments.map((doc) => (
                <tr key={doc.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <p className="text-sm text-foreground">{doc.documentNo}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.type, doc.format)}
                      <span className="text-sm text-foreground truncate">{doc.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-foreground">{doc.date}</div>
                    <div className="text-xs text-muted-foreground">{doc.time}</div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-foreground">{doc.service}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">{doc.preparedBy}</span>
                      {doc.verifiedBy && (
                        <span className="text-xs text-muted-foreground mt-0.5">{doc.verifiedBy}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Print">
                        <Printer className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Total: {visitDocuments.length} documents</span>
        <span>
          Total size: {visitDocuments.reduce((acc, doc) => {
            const size = parseFloat(doc.size);
            const unit = doc.size.includes('MB') ? 1024 : 1;
            return acc + (size * unit);
          }, 0).toFixed(1)} KB
        </span>
      </div>
    </div>
  );
}
