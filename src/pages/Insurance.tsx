import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Download, FileDown } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClaimsTable } from "@/components/insurance/ClaimsTable";
import { ClaimFilters } from "@/components/insurance/ClaimFilters";
import { PoliciesTab } from "@/components/insurance/PoliciesTab";
import { PayersTab } from "@/components/insurance/PayersTab";
import { ReportsTab } from "@/components/insurance/ReportsTab";
import { mockClaims } from "@/data/insurance.mock";
import { Claim, ClaimStatus, ServiceType } from "@/types/insurance";
import { formatINR } from "@/utils/currency";
import { toast } from "@/hooks/use-toast";

const Insurance = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "All">("All");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType | "All">("All");

  // Filter claims
  const filteredClaims = useMemo(() => {
    return mockClaims.filter((claim) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesClaimNo = claim.claimNo.toLowerCase().includes(query);
        const matchesPatient = claim.patient?.name.toLowerCase().includes(query);
        const matchesPolicy = claim.policy?.policyNo.toLowerCase().includes(query);
        
        if (!matchesClaimNo && !matchesPatient && !matchesPolicy) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "All" && claim.status !== statusFilter) {
        return false;
      }

      // Service type filter
      if (serviceTypeFilter !== "All") {
        const hasServiceType = claim.services.some(
          (service) => service.type === serviceTypeFilter
        );
        if (!hasServiceType) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, statusFilter, serviceTypeFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredClaims.reduce(
      (acc, claim) => ({
        billed: acc.billed + claim.amounts.billed,
        insurancePaid: acc.insurancePaid + claim.amounts.insurancePaid,
        balance: acc.balance + claim.amounts.balance,
      }),
      { billed: 0, insurancePaid: 0, balance: 0 }
    );
  }, [filteredClaims]);

  const handleViewClaim = (claim: Claim) => {
    toast({
      title: "View Claim",
      description: `Viewing claim ${claim.claimNo}`,
    });
  };

  const handleEditClaim = (claim: Claim) => {
    toast({
      title: "Edit Claim",
      description: `Editing claim ${claim.claimNo}`,
    });
  };

  const handleDeleteClaim = (claim: Claim) => {
    toast({
      title: "Delete Claim",
      description: `Deleting claim ${claim.claimNo}`,
      variant: "destructive",
    });
  };

  const handleAddPayment = (claim: Claim) => {
    toast({
      title: "Add Payment",
      description: `Adding payment to claim ${claim.claimNo}`,
    });
  };

  const handleAddDocument = (claim: Claim) => {
    toast({
      title: "Add Document",
      description: `Adding document to claim ${claim.claimNo}`,
    });
  };

  const handleDownloadPDF = (claim: Claim) => {
    toast({
      title: "Downloading PDF",
      description: `Downloading ${claim.claimNo}.pdf`,
    });
  };

  const handleNewClaim = () => {
    navigate("/insurance/claims/new");
  };

  const handleExportCSV = () => {
    toast({
      title: "Exporting CSV",
      description: "Claims list will be exported to CSV",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Exporting PDF",
      description: "Claims list will be exported to PDF",
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setServiceTypeFilter("All");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={["Appointments", "Patient Insights", "Insurance"]} />
        
        <main className="p-6 space-y-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/patient-insights/${patientId}/payments`)}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-semibold">Back to Payments</span>
          </button>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Insurance</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage insurance claims, policies, and payers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={handleNewClaim} className="gap-2">
                <Plus className="h-4 w-4" />
                New Claim
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Claims</div>
              <div className="text-2xl font-bold text-foreground">
                {filteredClaims.length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Billed</div>
              <div className="text-2xl font-bold text-foreground">
                {formatINR(totals.billed)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Insurance Paid</div>
              <div className="text-2xl font-bold text-green-600">
                {formatINR(totals.insurancePaid)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Balance</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatINR(totals.balance)}
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="claims" className="w-full">
            <TabsList className="h-auto bg-transparent p-0 gap-8 rounded-none justify-start border-0 border-b border-border">
              <TabsTrigger 
                value="claims"
                className="tab-trigger bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 text-base font-normal data-[state=active]:font-medium border-b-0"
              >
                Claims
              </TabsTrigger>
              <TabsTrigger 
                value="policies"
                className="tab-trigger bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 text-base font-normal data-[state=active]:font-medium border-b-0"
              >
                Policies
              </TabsTrigger>
              <TabsTrigger 
                value="payers"
                className="tab-trigger bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 text-base font-normal data-[state=active]:font-medium border-b-0"
              >
                Payers
              </TabsTrigger>
              <TabsTrigger 
                value="reports"
                className="tab-trigger bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 text-base font-normal data-[state=active]:font-medium border-b-0"
              >
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Claims Tab */}
            <TabsContent value="claims" className="mt-6">
              <Card className="p-6">
                <ClaimFilters
                  onSearchChange={setSearchQuery}
                  onStatusChange={setStatusFilter}
                  onServiceTypeChange={setServiceTypeFilter}
                  onClearFilters={handleClearFilters}
                />
                
                <div className="mt-6">
                  <ClaimsTable
                    claims={filteredClaims}
                    onViewClaim={handleViewClaim}
                    onEditClaim={handleEditClaim}
                    onDeleteClaim={handleDeleteClaim}
                    onAddPayment={handleAddPayment}
                    onAddDocument={handleAddDocument}
                    onDownloadPDF={handleDownloadPDF}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="mt-6">
              <PoliciesTab />
            </TabsContent>

            {/* Payers Tab */}
            <TabsContent value="payers" className="mt-6">
              <PayersTab />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="mt-6">
              <ReportsTab />
            </TabsContent>
          </Tabs>
        </main>
      </PageContent>
    </div>
  );
};

export default Insurance;
