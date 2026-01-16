import { Download, Edit, FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Claim, ClaimStatus } from "@/types/insurance";
import { formatINR } from "@/utils/currency";
import { format } from "date-fns";

interface ClaimsTableProps {
  claims: Claim[];
  onViewClaim: (claim: Claim) => void;
  onEditClaim: (claim: Claim) => void;
  onDeleteClaim: (claim: Claim) => void;
  onAddPayment: (claim: Claim) => void;
  onAddDocument: (claim: Claim) => void;
  onDownloadPDF: (claim: Claim) => void;
}

const getStatusColor = (status: ClaimStatus): string => {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-700 border-gray-300";
    case "Submitted":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "In Review":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "Paid":
      return "bg-green-100 text-green-700 border-green-300";
    case "Partially Paid":
      return "bg-teal-100 text-teal-700 border-teal-300";
    case "Denied":
      return "bg-red-100 text-red-700 border-red-300";
    case "Rejected":
      return "bg-red-100 text-red-700 border-red-300";
    case "Needs Info":
      return "bg-orange-100 text-orange-700 border-orange-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export function ClaimsTable({
  claims,
  onViewClaim,
  onEditClaim,
  onDeleteClaim,
  onAddPayment,
  onAddDocument,
  onDownloadPDF,
}: ClaimsTableProps) {
  if (claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No claims yet
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first claim to get started
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Claim
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>CLAIM NO</TableHead>
              <TableHead>DATE OF SERVICE</TableHead>
              <TableHead>PATIENT</TableHead>
              <TableHead>SERVICE</TableHead>
              <TableHead className="text-right">BILLED</TableHead>
              <TableHead className="text-right">INSURANCE PAID</TableHead>
              <TableHead className="text-right">BALANCE</TableHead>
              <TableHead className="text-center">STATUS</TableHead>
              <TableHead className="text-center">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => {
              const dateOfService = claim.encounter?.dateOfService 
                ? format(new Date(claim.encounter.dateOfService), "dd MMM yyyy")
                : "—";
              
              const primaryService = claim.services[0]?.type || "—";

              return (
                <TableRow key={claim.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm">{claim.claimNo}</TableCell>
                  <TableCell className="text-sm">{dateOfService}</TableCell>
                  <TableCell className="text-sm">
                    {claim.patient?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm">{primaryService}</TableCell>
                  <TableCell className="text-right text-sm">
                    {formatINR(claim.amounts.billed)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-emerald-600">
                    {formatINR(claim.amounts.insurancePaid)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-orange-600">
                    {formatINR(claim.amounts.balance)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(claim.status)} font-medium`}
                    >
                      {claim.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditClaim(claim)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDownloadPDF(claim)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download PDF</TooltipContent>
                      </Tooltip>

                      {claim.status === "Draft" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onDeleteClaim(claim)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
