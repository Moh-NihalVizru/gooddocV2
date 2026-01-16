import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Visit } from "../VisitListItem";

interface TimelineTabProps {
  selectedVisit?: Visit | null;
}

interface TransferHistoryItem {
  id: string;
  visitId: string;
  transferDate: string;
  transferTime: string;
  fromWard: string;
  fromRoom: string;
  fromBed: string;
  toWard: string;
  toRoom: string;
  toBed: string;
  reason: string;
  authorizedBy: string;
  status: "Completed" | "In Progress" | "Cancelled";
}

// Mock transfer history data with visitId
const allTransferHistory: TransferHistoryItem[] = [
  // V25-004 transfers (Active visit - Cardiology follow-up)
  {
    id: "t-041",
    visitId: "V25-004",
    transferDate: "2025-12-20",
    transferTime: "10:15",
    fromWard: "Ward A",
    fromRoom: "Room 102",
    fromBed: "WA-102-1",
    toWard: "ICU",
    toRoom: "ICU Bay 1",
    toBed: "IC-01",
    reason: "Scheduled consultation",
    authorizedBy: "Front Desk",
    status: "Completed",
  },
  // V25-002 transfers (General Medicine checkup)
  {
    id: "t-021",
    visitId: "V25-002",
    transferDate: "2025-12-15",
    transferTime: "09:00",
    fromWard: "Reception",
    fromRoom: "",
    fromBed: "",
    toWard: "General Medicine",
    toRoom: "Room 5",
    toBed: "GM-05-A",
    reason: "Annual checkup",
    authorizedBy: "Front Desk",
    status: "Completed",
  },
  {
    id: "t-022",
    visitId: "V25-002",
    transferDate: "2025-12-15",
    transferTime: "09:45",
    fromWard: "General Medicine",
    fromRoom: "Room 5",
    fromBed: "GM-05-A",
    toWard: "Laboratory",
    toRoom: "",
    toBed: "",
    reason: "Blood tests ordered",
    authorizedBy: "Dr. Priya Menon",
    status: "Completed",
  },
  // V25-001 transfers (Cardiology - Chest pain)
  {
    id: "t-011",
    visitId: "V25-001",
    transferDate: "2025-12-01",
    transferTime: "10:30",
    fromWard: "Emergency",
    fromRoom: "ER Bay 1",
    fromBed: "ER-03",
    toWard: "Cardiology",
    toRoom: "Room 8",
    toBed: "CARD-08-1",
    reason: "Chest pain evaluation",
    authorizedBy: "Dr. Emergency",
    status: "Completed",
  },
  {
    id: "t-012",
    visitId: "V25-001",
    transferDate: "2025-12-01",
    transferTime: "11:30",
    fromWard: "Cardiology",
    fromRoom: "Room 8",
    fromBed: "CARD-08-1",
    toWard: "ECG Lab",
    toRoom: "",
    toBed: "",
    reason: "ECG ordered",
    authorizedBy: "Dr. Meera Nair",
    status: "Completed",
  },
  {
    id: "t-013",
    visitId: "V25-001",
    transferDate: "2025-12-01",
    transferTime: "12:00",
    fromWard: "ECG Lab",
    fromRoom: "",
    fromBed: "",
    toWard: "Radiology",
    toRoom: "",
    toBed: "",
    reason: "Chest X-Ray ordered",
    authorizedBy: "Dr. Meera Nair",
    status: "Completed",
  },
  // V24-089 transfers (Orthopedics - Back pain)
  {
    id: "t-891",
    visitId: "V24-089",
    transferDate: "2025-11-15",
    transferTime: "14:00",
    fromWard: "Reception",
    fromRoom: "",
    fromBed: "",
    toWard: "Orthopedics",
    toRoom: "Room 15",
    toBed: "ORTH-15-1",
    reason: "Back pain consultation",
    authorizedBy: "Front Desk",
    status: "Completed",
  },
  {
    id: "t-892",
    visitId: "V24-089",
    transferDate: "2025-11-15",
    transferTime: "15:00",
    fromWard: "Orthopedics",
    fromRoom: "Room 15",
    fromBed: "ORTH-15-1",
    toWard: "MRI Center",
    toRoom: "",
    toBed: "",
    reason: "MRI Spine ordered",
    authorizedBy: "Dr. Arun Kumar",
    status: "Completed",
  },
  {
    id: "t-893",
    visitId: "V24-089",
    transferDate: "2025-11-16",
    transferTime: "10:00",
    fromWard: "Reception",
    fromRoom: "",
    fromBed: "",
    toWard: "Physiotherapy",
    toRoom: "PT Room",
    toBed: "PT-2",
    reason: "Physiotherapy session",
    authorizedBy: "Dr. Arun Kumar",
    status: "Completed",
  },
];

export function TimelineTab({ selectedVisit }: TimelineTabProps) {
  if (!selectedVisit) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select a visit to view transfer history.
        </p>
      </div>
    );
  }

  // Filter transfers for selected visit
  const visitTransfers = allTransferHistory.filter(
    (transfer) => transfer.visitId === selectedVisit.visitId
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (visitTransfers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No transfer history found for this visit.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 pb-4">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-foreground">Transfer History</h3>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white dark:bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-medium">Visit ID</TableHead>
              <TableHead className="text-xs font-medium">Date & Time</TableHead>
              <TableHead className="text-xs font-medium">From</TableHead>
              <TableHead className="text-xs font-medium">To</TableHead>
              <TableHead className="text-xs font-medium">Reason</TableHead>
              <TableHead className="text-xs font-medium">Ordering Clinician</TableHead>
              <TableHead className="text-xs font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitTransfers.map((transfer) => (
              <TableRow key={transfer.id} className="hover:bg-muted/30">
                <TableCell className="py-3">
                  <p className="text-sm text-foreground">{transfer.visitId}</p>
                </TableCell>
                <TableCell className="py-3">
                  <div className="text-sm text-foreground">
                    {format(new Date(transfer.transferDate), "dd MMM yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {transfer.transferTime}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="text-sm text-foreground">{transfer.fromWard}</div>
                  {(transfer.fromRoom || transfer.fromBed) && (
                    <div className="text-xs text-muted-foreground">
                      {transfer.fromRoom && transfer.fromBed 
                        ? `${transfer.fromRoom} • ${transfer.fromBed}`
                        : transfer.fromRoom || transfer.fromBed}
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <div className="text-sm text-foreground">{transfer.toWard}</div>
                  {(transfer.toRoom || transfer.toBed) && (
                    <div className="text-xs text-muted-foreground">
                      {transfer.toRoom && transfer.toBed 
                        ? `${transfer.toRoom} • ${transfer.toBed}`
                        : transfer.toRoom || transfer.toBed}
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-sm text-foreground max-w-[200px] truncate" title={transfer.reason}>
                    {transfer.reason}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-sm text-foreground">{transfer.authorizedBy}</span>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant={getStatusVariant(transfer.status)} className="text-xs">
                    {transfer.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
