import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  Printer,
  FileText,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  BillMode, 
  RoundingOption, 
  IncludeCharges,
  InterimPreviewResponse,
} from "@/types/interim-bill";
import {
  mockFetchEligibleCharges,
  mockGenerateInterimBill,
  MOCK_DEPARTMENTS,
  MOCK_PAYERS,
} from "@/data/interim-bill.mock";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const GenerateInterimBill = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const fromPage = searchParams.get("from") || "ip-patients";
  const totalPayable = searchParams.get("amount") || "₹4,000";
  const admissionId = searchParams.get("admissionId") || "ADM-2026-001";
  const patientName = searchParams.get("name") || "Harish Kalyan";
  const admissionDate = "2026-01-02T09:00:00";
  
  // Breadcrumb config
  const breadcrumbConfig: Record<string, { label: string; path: string }> = {
    "ip-patients": { label: "IP Patients", path: "/patients/ip" },
    "patient-insights": { label: "Patient Insight", path: `/patient-insights/${patientId}?from=${fromPage}` },
  };
  
  const backPath = `/patient-insights/${patientId}?from=${fromPage}`;
  
  // Form state
  const [cutoffDate, setCutoffDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [cutoffTime, setCutoffTime] = useState<string>(format(new Date(), "HH:mm"));
  const [mode, setMode] = useState<BillMode>("periodic");
  const [include, setInclude] = useState<IncludeCharges>({
    postedServices: true,
    roomBed: true,
    pharmacy: true,
    diagnostics: true,
    professional: true,
  });
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [payerId, setPayerId] = useState<string>("SELF");
  const [includeOnlyPosted, setIncludeOnlyPosted] = useState(true);
  const [rounding, setRounding] = useState<RoundingOption>("nearest");
  const [notes, setNotes] = useState("");
  
  // Preview state
  const [previewData, setPreviewData] = useState<InterimPreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  
  // Generate state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<{ billId: string; billNumber: string } | null>(null);
  
  // Debounced cutoff for preview fetch
  const cutoffAt = useMemo(() => {
    return `${cutoffDate}T${cutoffTime}:00`;
  }, [cutoffDate, cutoffTime]);
  const debouncedCutoff = useDebounce(cutoffAt, 500);
  
  // Debounce include changes
  const includeKey = JSON.stringify(include);
  const debouncedIncludeKey = useDebounce(includeKey, 300);
  
  // Set current date/time on now chip click
  const handleSetNow = () => {
    const now = new Date();
    setCutoffDate(format(now, "yyyy-MM-dd"));
    setCutoffTime(format(now, "HH:mm"));
  };
  
  // Initialize with current date/time on mount
  useEffect(() => {
    handleSetNow();
  }, []);
  
  // Fetch preview data
  const fetchPreview = useCallback(async () => {
    if (!patientId) return;
    setIsLoadingPreview(true);
    try {
      const response = await mockFetchEligibleCharges(
        patientId,
        admissionId,
        debouncedCutoff,
        include,
        departmentIds,
        includeOnlyPosted,
        mode,
        payerId
      );
      setPreviewData(response);
    } catch (error) {
      console.error("Failed to fetch preview:", error);
      toast({
        title: "Preview Error",
        description: "Could not load preview data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  }, [patientId, admissionId, debouncedCutoff, debouncedIncludeKey, departmentIds, includeOnlyPosted, mode, payerId, toast]);
  
  // Trigger preview fetch on relevant changes
  useEffect(() => {
    if (!generatedBill) {
      fetchPreview();
    }
  }, [debouncedCutoff, debouncedIncludeKey, mode, payerId, includeOnlyPosted, fetchPreview, generatedBill]);
  
  // Validation
  const admissionStart = new Date(admissionDate);
  const cutoffDateTime = new Date(cutoffAt);
  const isCutoffValid = cutoffDateTime >= admissionStart;
  const hasEligibleCharges = previewData && (previewData.lines.length > 0 || previewData.roomBedSegments.length > 0);
  const canGenerate = !isLoadingPreview && isCutoffValid && hasEligibleCharges && !generatedBill;
  
  // Handle include checkbox change
  const handleIncludeChange = (key: keyof IncludeCharges) => {
    setInclude(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  // Generate interim bill
  const handleGenerate = async () => {
    if (!canGenerate || !patientId) return;
    
    setIsGenerating(true);
    try {
      const result = await mockGenerateInterimBill({
        patientId,
        admissionId,
        cutoffAt,
        mode,
        include,
        departmentIds,
        includeOnlyPosted,
        payerId,
        rounding,
        notes,
      });
      
      setGeneratedBill(result);
      
      toast({
        title: "Interim bill generated",
        description: `Bill ${result.billNumber} has been created.`,
      });
    } catch (error) {
      console.error("Failed to generate interim bill:", error);
      toast({
        title: "Generation Failed",
        description: "Couldn't generate interim bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      
      <PageContent className="flex flex-col overflow-hidden">
        <AppHeader 
          breadcrumbs={[
            { label: "Patient Insight", onClick: () => navigate(backPath) },
            "Generate Interim Bill"
          ]} 
        />
        
        {/* Patient Header Bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(backPath)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-semibold">Generate Interim Bill</h1>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Context Banner */}
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Total Payable now: {totalPayable}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    This is an estimate. Interim will snapshot charges up to the selected cutoff.
                  </p>
                </div>
              </div>
            </Card>
            
            {generatedBill ? (
              /* Success State */
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Interim Bill Generated</h3>
                    <p className="text-sm text-muted-foreground">
                      Bill Number: <span className="font-mono font-medium">{generatedBill.billNumber}</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {
                      toast({ title: "Opening bill view...", description: generatedBill.billNumber });
                    }}>
                      <FileText className="w-4 h-4 mr-2" />
                      View Bill
                    </Button>
                    <Button onClick={() => {
                      toast({ title: "Opening print dialog...", description: generatedBill.billNumber });
                    }}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(backPath)}
                    className="mt-4"
                  >
                    Back to Patient Insight
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Panel */}
                <Card className="lg:col-span-4 p-6 space-y-6">
                  <h2 className="font-semibold text-lg">Bill Configuration</h2>
                  
                  {/* Cutoff Date & Time */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Cutoff Date & Time</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={handleSetNow}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Now
                      </Button>
                    </div>
                    <div className="flex gap-3" data-testid="interim-cutoff">
                      <div className="flex-1">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={cutoffDate}
                            onChange={(e) => setCutoffDate(e.target.value)}
                            min={format(admissionStart, "yyyy-MM-dd")}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="time"
                            value={cutoffTime}
                            onChange={(e) => setCutoffTime(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    {!isCutoffValid && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Cutoff must be on or after admission start ({format(admissionStart, "dd MMM yyyy, HH:mm")})
                      </p>
                    )}
                  </div>
                  
                  {/* Mode */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Mode</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">
                              <strong>Periodic</strong> includes only new items since the last interim.<br/>
                              <strong>Cumulative</strong> shows all to date but posts only the delta.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <RadioGroup
                      value={mode}
                      onValueChange={(v) => setMode(v as BillMode)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="periodic" id="mode-periodic" data-testid="interim-mode-periodic" />
                        <Label htmlFor="mode-periodic" className="text-sm font-normal cursor-pointer">
                          Periodic
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cumulative" id="mode-cumulative" data-testid="interim-mode-cumulative" />
                        <Label htmlFor="mode-cumulative" className="text-sm font-normal cursor-pointer">
                          Cumulative
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Include Charges */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Include Charges</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-services"
                          checked={include.postedServices}
                          onCheckedChange={() => handleIncludeChange("postedServices")}
                          data-testid="interim-include-services"
                        />
                        <Label htmlFor="include-services" className="text-sm font-normal cursor-pointer">
                          Posted Services
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-room"
                          checked={include.roomBed}
                          onCheckedChange={() => handleIncludeChange("roomBed")}
                          data-testid="interim-include-room-bed"
                        />
                        <Label htmlFor="include-room" className="text-sm font-normal cursor-pointer">
                          Room/Bed Charges
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-pharmacy"
                          checked={include.pharmacy}
                          onCheckedChange={() => handleIncludeChange("pharmacy")}
                        />
                        <Label htmlFor="include-pharmacy" className="text-sm font-normal cursor-pointer">
                          Pharmacy & Consumables
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-diagnostics"
                          checked={include.diagnostics}
                          onCheckedChange={() => handleIncludeChange("diagnostics")}
                        />
                        <Label htmlFor="include-diagnostics" className="text-sm font-normal cursor-pointer">
                          Diagnostics (Lab/Radiology)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-professional"
                          checked={include.professional}
                          onCheckedChange={() => handleIncludeChange("professional")}
                        />
                        <Label htmlFor="include-professional" className="text-sm font-normal cursor-pointer">
                          Professional/Doctor Fees
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Department Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Department Filter (optional)</Label>
                    <Select value={departmentIds[0] || "all"} onValueChange={(v) => setDepartmentIds(v === "all" ? [] : [v])}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {MOCK_DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Payer */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Payer</Label>
                    <Select value={payerId} onValueChange={setPayerId} data-testid="interim-payer">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_PAYERS.map((payer) => (
                          <SelectItem key={payer.id} value={payer.id}>
                            {payer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {previewData?.payerSplit && payerId !== "SELF" && (
                      <p className="text-xs text-muted-foreground">
                        Payer split applied: {previewData.payerSplit.insurerPortion}% Insurer / {previewData.payerSplit.patientPortion}% Patient
                      </p>
                    )}
                  </div>
                  
                  {/* Include Only Posted */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="only-posted"
                      checked={includeOnlyPosted}
                      onCheckedChange={(checked) => setIncludeOnlyPosted(checked === true)}
                    />
                    <Label htmlFor="only-posted" className="text-sm font-normal cursor-pointer">
                      Include only posted/approved items
                    </Label>
                  </div>
                  
                  {/* Rounding */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Rounding</Label>
                    <Select value={rounding} onValueChange={(v) => setRounding(v as RoundingOption)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="nearest">Round to Nearest</SelectItem>
                        <SelectItem value="up">Round Up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Notes (optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes for this interim bill..."
                      rows={2}
                    />
                  </div>
                </Card>
                
                {/* Preview Panel */}
                <Card className="lg:col-span-8 p-6 space-y-4">
                  <Collapsible open={isPreviewExpanded} onOpenChange={setIsPreviewExpanded}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center justify-between w-full text-left">
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-lg">Preview</h2>
                          {!isLoadingPreview && previewData && (
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {previewData.lines.length + previewData.roomBedSegments.length} items
                              </Badge>
                              <Badge variant="outline" className="text-xs font-mono">
                                {formatCurrency(previewData.totals.estimatedNetDue)}
                              </Badge>
                            </div>
                          )}
                        </div>
                        {isPreviewExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pt-4 space-y-4" data-testid="interim-preview-table">
                      {isLoadingPreview ? (
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : previewData ? (
                        <>
                          {/* Header chips */}
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {previewData.lines.length} unbilled items
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              As of {format(new Date(cutoffAt), "dd MMM yyyy, HH:mm")}
                            </Badge>
                          </div>
                          
                          {/* Bill Documents Table */}
                          {previewData.lines.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">Bill Documents</Label>
                              <div className="border rounded-md overflow-hidden">
                                <div className="max-h-60 overflow-y-auto">
                                  <table className="w-full text-xs table-fixed">
                                    <thead className="bg-muted sticky top-0 z-10">
                                      <tr>
                                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase w-[100px]">DOCUMENT NO.</th>
                                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">DOCUMENT NAME</th>
                                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase w-[100px]">DATE & TIME</th>
                                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase w-[110px]">SERVICE</th>
                                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase w-[140px]">PREPARED BY</th>
                                        <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground uppercase w-[80px]">ACTIONS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {previewData.lines.map((line, index) => {
                                        const docPrefix = line.department === "Laboratory" ? "LAB" : 
                                                         line.department === "Radiology" ? "RAD" :
                                                         line.department === "Pharmacy" ? "RX" : "DOC";
                                        const docNo = `${docPrefix}${String(100 + index).padStart(3, '0')}`;
                                        return (
                                          <tr key={line.id} className="border-t border-border/50">
                                            <td className="py-2 px-3 text-foreground">{docNo}</td>
                                            <td className="py-2 px-3 truncate">{line.itemName}</td>
                                            <td className="py-2 px-3">
                                              <div className="flex flex-col">
                                                <span>{line.date.split(',')[0]}</span>
                                                <span className="text-muted-foreground text-[10px]">10:00 AM</span>
                                              </div>
                                            </td>
                                            <td className="py-2 px-3 truncate">{line.department}</td>
                                            <td className="py-2 px-3 truncate">Dr. Arun Kumar</td>
                                            <td className="py-2 px-3">
                                              <div className="flex items-center justify-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                  <FileText className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                  <Printer className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Room/Bed Segments */}
                          {previewData.roomBedSegments.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">Room & Bed Pro-ration</Label>
                              <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-muted/50">
                                    <tr>
                                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">LOCATION</th>
                                      <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase">DURATION</th>
                                      <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase">AMOUNT</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {previewData.roomBedSegments.map((seg) => (
                                      <tr key={seg.id} className="border-t border-border/50">
                                        <td className="py-2 px-3">
                                          {seg.locationName}
                                          <span className="text-muted-foreground ml-1">• {seg.bedNumber}</span>
                                        </td>
                                        <td className="py-2 px-3 text-right">{seg.durationText}</td>
                                        <td className="py-2 px-3 text-right tabular-nums font-medium">{formatCurrency(seg.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          
                          {/* Warnings */}
                          {previewData.warnings && previewData.warnings.length > 0 && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-amber-700 dark:text-amber-300">
                                {previewData.warnings.map((w, i) => (
                                  <p key={i}>{w}</p>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Totals Summary */}
                          <Card className="p-4 bg-muted/30">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Gross Total</span>
                                <span className="tabular-nums">{formatCurrency(previewData.totals.gross)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="tabular-nums text-green-600">−{formatCurrency(previewData.totals.discount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="tabular-nums">{formatCurrency(previewData.totals.tax)}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-medium">
                                <span>Net Total</span>
                                <span className="tabular-nums">{formatCurrency(previewData.totals.net)}</span>
                              </div>
                              {previewData.totals.depositsApplied > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Deposits Applied</span>
                                  <span className="tabular-nums text-green-600">−{formatCurrency(previewData.totals.depositsApplied)}</span>
                                </div>
                              )}
                              <Separator className="my-2" />
                              <div className="flex justify-between font-semibold text-base">
                                <span>Estimated Net Due</span>
                                <span className={cn(
                                  "tabular-nums",
                                  previewData.totals.estimatedNetDue < 0 ? "text-green-600" : "text-primary"
                                )}>
                                  {previewData.totals.estimatedNetDue < 0 && "Credit: "}
                                  {formatCurrency(Math.abs(previewData.totals.estimatedNetDue))}
                                </span>
                              </div>
                            </div>
                          </Card>
                          
                          {/* Info note */}
                          <p className="text-xs text-muted-foreground italic">
                            This is a preview. Final interim snapshot is captured on Generate.
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No preview data available.
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </div>
            )}
          </div>
        </main>
        
        {/* Sticky Footer */}
        {!generatedBill && (
          <div className="border-t bg-background p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(backPath)}
              >
                Cancel
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        onClick={handleGenerate}
                        disabled={!canGenerate || isGenerating}
                        data-testid="interim-generate-btn"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate Interim Bill"
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canGenerate && !isGenerating && (
                    <TooltipContent>
                      {!isCutoffValid 
                        ? "Invalid cutoff date/time" 
                        : !hasEligibleCharges 
                          ? "No eligible items up to selected cutoff"
                          : "Loading preview..."}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </PageContent>
    </div>
  );
};

export default GenerateInterimBill;
