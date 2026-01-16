import { useNavigate, useParams } from "react-router-dom";
import { Download, Printer, FileText, AlertCircle, CheckCircle2, Clock, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Visit } from "../VisitListItem";

interface InsuranceTabProps {
  selectedVisit: Visit | null;
}

type ClaimStatus = "draft" | "submitted" | "under_review" | "approved" | "partially_approved" | "paid" | "rejected" | "appealed";
type ClaimType = "cashless" | "reimbursement" | "pre_auth";

interface Claim {
  id: string;
  claimNo: string;
  policyNo: string;
  insurerName: string;
  tpaName: string;
  claimType: ClaimType;
  submissionDate: string;
  submissionTime: string;
  visitId: string;
  service: string;
  serviceCode: string;
  icdCode: string;
  diagnosis: string;
  billedAmount: number;
  approvedAmount: number;
  paidAmount: number;
  copay: number;
  deductible: number;
  patientLiability: number;
  status: ClaimStatus;
  remarks?: string;
  preAuthNo?: string;
  settledDate?: string;
  turnaroundDays?: number;
}

const getStatusBadge = (status: ClaimStatus) => {
  const config: Record<ClaimStatus, { icon: React.ReactNode; label: string; className: string }> = {
    draft: { icon: <FileText className="h-3 w-3" />, label: "Draft", className: "bg-gray-50 text-gray-600 border-gray-200" },
    submitted: { icon: <Clock className="h-3 w-3" />, label: "Submitted", className: "bg-blue-50 text-blue-700 border-blue-200" },
    under_review: { icon: <RefreshCw className="h-3 w-3" />, label: "Under Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { icon: <CheckCircle2 className="h-3 w-3" />, label: "Approved", className: "bg-green-50 text-green-700 border-green-200" },
    partially_approved: { icon: <AlertCircle className="h-3 w-3" />, label: "Partial", className: "bg-orange-50 text-orange-700 border-orange-200" },
    paid: { icon: <CheckCircle2 className="h-3 w-3" />, label: "Settled", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected: { icon: <XCircle className="h-3 w-3" />, label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
    appealed: { icon: <RefreshCw className="h-3 w-3" />, label: "Appealed", className: "bg-purple-50 text-purple-700 border-purple-200" },
  };
  const { icon, label, className } = config[status];
  return (
    <Badge variant="outline" className={`${className} text-xs gap-1`}>
      {icon}
      {label}
    </Badge>
  );
};

const getClaimTypeBadge = (type: ClaimType) => {
  const config: Record<ClaimType, { label: string; className: string }> = {
    cashless: { label: "Cashless", className: "bg-teal-50 text-teal-700 border-teal-200" },
    reimbursement: { label: "Reimbursement", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    pre_auth: { label: "Pre-Auth", className: "bg-violet-50 text-violet-700 border-violet-200" },
  };
  const { label, className } = config[type];
  return <Badge variant="outline" className={`${className} text-xs`}>{label}</Badge>;
};

const mockClaims: Claim[] = [
  // V25-004 claims (Active visit - Cardiology follow-up)
  {
    id: "clm-041",
    claimNo: "CLM521",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "cashless",
    submissionDate: "20 Dec 2025",
    submissionTime: "12:30 PM",
    visitId: "V25-004",
    service: "Cardiology Consultation",
    serviceCode: "CONS-CARD-001",
    icdCode: "I25.9",
    diagnosis: "Chronic Ischemic Heart Disease",
    billedAmount: 2500,
    approvedAmount: 0,
    paidAmount: 0,
    copay: 0,
    deductible: 0,
    patientLiability: 2500,
    status: "submitted",
    remarks: "Awaiting TPA approval",
  },
  {
    id: "clm-042",
    claimNo: "CLM522",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "cashless",
    submissionDate: "20 Dec 2025",
    submissionTime: "12:35 PM",
    visitId: "V25-004",
    service: "12-Lead ECG",
    serviceCode: "DIAG-ECG-001",
    icdCode: "I25.9",
    diagnosis: "Chronic Ischemic Heart Disease",
    billedAmount: 800,
    approvedAmount: 0,
    paidAmount: 0,
    copay: 0,
    deductible: 0,
    patientLiability: 800,
    status: "submitted",
    remarks: "Awaiting TPA approval",
  },
  {
    id: "clm-043",
    claimNo: "CLM523",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "cashless",
    submissionDate: "20 Dec 2025",
    submissionTime: "01:00 PM",
    visitId: "V25-004",
    service: "Lipid Profile",
    serviceCode: "LAB-BIO-003",
    icdCode: "E78.5",
    diagnosis: "Hyperlipidemia",
    billedAmount: 650,
    approvedAmount: 0,
    paidAmount: 0,
    copay: 0,
    deductible: 0,
    patientLiability: 650,
    status: "under_review",
    remarks: "Additional documents requested",
  },
  // V25-002 claims (General Medicine checkup)
  {
    id: "clm-021",
    claimNo: "CLM312",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "cashless",
    submissionDate: "15 Dec 2025",
    submissionTime: "10:00 AM",
    visitId: "V25-002",
    service: "General Consultation",
    serviceCode: "CONS-GEN-001",
    icdCode: "Z00.0",
    diagnosis: "General Health Examination",
    billedAmount: 1500,
    approvedAmount: 1200,
    paidAmount: 1200,
    copay: 150,
    deductible: 150,
    patientLiability: 300,
    status: "paid",
    settledDate: "18 Dec 2025",
    turnaroundDays: 3,
  },
  {
    id: "clm-022",
    claimNo: "CLM313",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "cashless",
    submissionDate: "15 Dec 2025",
    submissionTime: "10:30 AM",
    visitId: "V25-002",
    service: "CBC + Lipid Profile",
    serviceCode: "LAB-PACK-001",
    icdCode: "Z00.0",
    diagnosis: "General Health Examination",
    billedAmount: 2000,
    approvedAmount: 1600,
    paidAmount: 1600,
    copay: 200,
    deductible: 200,
    patientLiability: 400,
    status: "paid",
    settledDate: "18 Dec 2025",
    turnaroundDays: 3,
  },
  // V25-001 claims (Cardiology - Chest pain)
  {
    id: "clm-011",
    claimNo: "CLM101",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "cashless",
    submissionDate: "01 Dec 2025",
    submissionTime: "03:00 PM",
    visitId: "V25-001",
    service: "Cardiology Consultation",
    serviceCode: "CONS-CARD-001",
    icdCode: "R07.9",
    diagnosis: "Chest Pain, Unspecified",
    billedAmount: 2500,
    approvedAmount: 2000,
    paidAmount: 2000,
    copay: 250,
    deductible: 250,
    patientLiability: 500,
    status: "paid",
    settledDate: "05 Dec 2025",
    turnaroundDays: 4,
  },
  {
    id: "clm-012",
    claimNo: "CLM102",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "cashless",
    submissionDate: "01 Dec 2025",
    submissionTime: "03:15 PM",
    visitId: "V25-001",
    service: "12-Lead ECG",
    serviceCode: "DIAG-ECG-001",
    icdCode: "R07.9",
    diagnosis: "Chest Pain, Unspecified",
    billedAmount: 800,
    approvedAmount: 640,
    paidAmount: 640,
    copay: 80,
    deductible: 80,
    patientLiability: 160,
    status: "paid",
    settledDate: "05 Dec 2025",
    turnaroundDays: 4,
  },
  {
    id: "clm-013",
    claimNo: "CLM103",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "cashless",
    submissionDate: "01 Dec 2025",
    submissionTime: "03:30 PM",
    visitId: "V25-001",
    service: "Chest X-Ray PA View",
    serviceCode: "RAD-XRAY-001",
    icdCode: "R07.9",
    diagnosis: "Chest Pain, Unspecified",
    billedAmount: 1500,
    approvedAmount: 0,
    paidAmount: 0,
    copay: 0,
    deductible: 0,
    patientLiability: 1500,
    status: "rejected",
    remarks: "Not covered under policy - requires pre-authorization",
  },
  // V24-089 claims (Orthopedics - Back pain)
  {
    id: "clm-891",
    claimNo: "CLM891",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "pre_auth",
    preAuthNo: "PA-2025-001234",
    submissionDate: "15 Nov 2025",
    submissionTime: "11:00 AM",
    visitId: "V24-089",
    service: "Orthopedics Consultation",
    serviceCode: "CONS-ORTH-001",
    icdCode: "M54.5",
    diagnosis: "Low Back Pain",
    billedAmount: 2000,
    approvedAmount: 1600,
    paidAmount: 1600,
    copay: 200,
    deductible: 200,
    patientLiability: 400,
    status: "paid",
    settledDate: "20 Nov 2025",
    turnaroundDays: 5,
  },
  {
    id: "clm-892",
    claimNo: "CLM892",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "pre_auth",
    preAuthNo: "PA-2025-001234",
    submissionDate: "15 Nov 2025",
    submissionTime: "12:00 PM",
    visitId: "V24-089",
    service: "MRI Lumbar Spine",
    serviceCode: "RAD-MRI-002",
    icdCode: "M54.5",
    diagnosis: "Low Back Pain",
    billedAmount: 8500,
    approvedAmount: 6800,
    paidAmount: 6800,
    copay: 850,
    deductible: 850,
    patientLiability: 1700,
    status: "paid",
    settledDate: "22 Nov 2025",
    turnaroundDays: 7,
  },
  {
    id: "clm-893",
    claimNo: "CLM893",
    policyNo: "ICICI-HLT-789456123",
    insurerName: "ICICI Lombard",
    tpaName: "Medi Assist",
    claimType: "reimbursement",
    submissionDate: "16 Nov 2025",
    submissionTime: "09:30 AM",
    visitId: "V24-089",
    service: "Physiotherapy Session",
    serviceCode: "REHAB-PT-001",
    icdCode: "M54.5",
    diagnosis: "Low Back Pain",
    billedAmount: 1000,
    approvedAmount: 0,
    paidAmount: 0,
    copay: 0,
    deductible: 0,
    patientLiability: 1000,
    status: "appealed",
    remarks: "Initial rejection appealed - waiting period clause disputed",
  },
];

export function InsuranceTab({ selectedVisit }: InsuranceTabProps) {
  if (!selectedVisit) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select a visit to view insurance information.
        </p>
      </div>
    );
  }

  // Filter claims for selected visit
  const visitClaims = mockClaims.filter(
    (claim) => claim.visitId === selectedVisit.visitId
  );

  if (visitClaims.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No insurance claims found for this visit.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totals = visitClaims.reduce(
    (acc, claim) => ({
      billed: acc.billed + claim.billedAmount,
      approved: acc.approved + claim.approvedAmount,
      paid: acc.paid + claim.paidAmount,
      patientLiability: acc.patientLiability + claim.patientLiability,
    }),
    { billed: 0, approved: 0, paid: 0, patientLiability: 0 }
  );

  // Get policy info from first claim
  const policyInfo = visitClaims[0];

  const navigate = useNavigate();
  const { patientId } = useParams();

  const handleGoToInsurance = () => {
    navigate(`/patient-insights/${patientId}/insurance`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Policy Summary Card */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Policy Information</h3>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Policy No.</p>
                <p className="font-mono font-medium text-foreground">{policyInfo.policyNo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Insurer</p>
                <p className="font-medium text-foreground">{policyInfo.insurerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">TPA</p>
                <p className="font-medium text-foreground">{policyInfo.tpaName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Claims this Visit</p>
                <p className="font-medium text-foreground">{visitClaims.length}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleGoToInsurance}>
            <ExternalLink className="h-4 w-4" />
            Go to Insurance
          </Button>
        </div>
      </div>

      {/* Claims Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-foreground">Insurance Claims</h3>
          <p className="text-xs text-muted-foreground">
            Showing {visitClaims.length} claim{visitClaims.length !== 1 ? 's' : ''} for visit {selectedVisit.visitId}
          </p>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">CLAIM NO.</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">TYPE</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">SUBMITTED</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">SERVICE / ICD</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">DIAGNOSIS</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">BILLED</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">APPROVED</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">PAID</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">PATIENT DUE</th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">STATUS</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-card">
                {visitClaims.map((claim) => (
                  <tr key={claim.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <p className="text-sm text-foreground">{claim.claimNo}</p>
                      {claim.preAuthNo && (
                        <p className="text-xs text-muted-foreground mt-0.5">PA: {claim.preAuthNo}</p>
                      )}
                    </td>
                    <td className="p-3">
                      {getClaimTypeBadge(claim.claimType)}
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-foreground">{claim.submissionDate}</div>
                      <div className="text-xs text-muted-foreground">{claim.submissionTime}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-foreground">{claim.service}</div>
                      <div className="text-xs text-muted-foreground">{claim.icdCode}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-foreground max-w-[150px] truncate block" title={claim.diagnosis}>
                        {claim.diagnosis}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm text-foreground">₹{claim.billedAmount.toLocaleString()}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-sm ${claim.approvedAmount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {claim.approvedAmount > 0 ? `₹${claim.approvedAmount.toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-sm ${claim.paidAmount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {claim.paidAmount > 0 ? `₹${claim.paidAmount.toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-sm ${claim.patientLiability > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        ₹{claim.patientLiability.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-col items-center space-y-1">
                        {getStatusBadge(claim.status)}
                        {claim.settledDate && (
                          <p className="text-[10px] text-muted-foreground">Settled: {claim.settledDate}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Print">
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary Footer */}
              <tfoot className="bg-muted/40 border-t-2">
                <tr>
                  <td colSpan={5} className="p-3 text-right">
                    <span className="text-sm font-semibold text-foreground">Totals:</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-semibold text-foreground">₹{totals.billed.toLocaleString()}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-semibold text-green-600">₹{totals.approved.toLocaleString()}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-semibold text-emerald-600">₹{totals.paid.toLocaleString()}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-semibold text-orange-600">₹{totals.patientLiability.toLocaleString()}</span>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
