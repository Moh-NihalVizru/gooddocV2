import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
  Upload,
  Plus,
  Search,
  TestTube,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLabResults, LabResultRow } from "@/hooks/useLabResults";
import { useSampleCollection } from "@/hooks/useSampleCollection";
import { useLabDiagnosticsAI } from "@/hooks/useLabDiagnosticsAI";
import { LabResultsTable } from "@/components/lab-results/LabResultsTable";
import { LabResultsPanelTabs } from "@/components/lab-results/LabResultsPanelTabs";
import { AddTestModal } from "@/components/lab-results/AddTestModal";
import { SampleCollectionSheet } from "@/components/lab-results/SampleCollectionSheet";
import { DiagnosticsAIPanel } from "@/components/lab-results/DiagnosticsAIPanel";
import { PatientContext, Sex, TestDefinition } from "@/types/lab-tests";
import { panelsCatalog, getTestsByPanel, getTestDefinition } from "@/data/tests-catalog";

const mockPatient = {
  name: "Anaya Shah",
  mrn: "MRN-204983",
  age: 34,
  sex: "F" as Sex,
  type: "OPD",
  physician: "Dr. Mehta",
  encounterId: "ENC-45821",
  allergies: ["Penicillin"],
};

const mockOrder = {
  id: "OR-LL-10342",
  priority: "STAT",
  panels: ["Cardiac Panel", "CBC with Diff", "CMP"],
  specimen: {
    type: "Blood (Serum)",
    barcode: "S-000239",
    collected: "Today 10:15 AM",
    received: "Today 10:30 AM",
    collectedBy: "Tech. Kumar",
    analyzer: "Cobas c702",
  },
};

// Initial mock results with prior values
const initialMockResults = [
  {
    id: "1",
    testId: "troponin_i",
    value: "0.85",
    unit: "ng/mL",
    priorValue: "0.02",
  },
  {
    id: "2",
    testId: "hemoglobin",
    value: "13.2",
    unit: "g/dL",
    priorValue: "13.5",
  },
  { id: "3", testId: "wbc", value: "11.5", unit: "10^3/µL", priorValue: "9.2" },
  {
    id: "4",
    testId: "platelets",
    value: "245",
    unit: "10^3/µL",
    priorValue: "268",
  },
  {
    id: "5",
    testId: "sodium",
    value: "138",
    unit: "mmol/L",
    priorValue: "140",
  },
  {
    id: "6",
    testId: "potassium",
    value: "4.2",
    unit: "mmol/L",
    priorValue: "4.1",
  },
  {
    id: "7",
    testId: "creatinine",
    value: "0.9",
    unit: "mg/dL",
    priorValue: "0.8",
  },
  { id: "8", testId: "egfr", value: "", unit: "mL/min/1.73m²", priorValue: "98" },
  { id: "9", testId: "bnp", value: "250", unit: "pg/mL", priorValue: "85" },
  { id: "10", testId: "d_dimer", value: "0.45", unit: "µg/mL FEU", priorValue: "0.32" },
];

export default function LaboratoryResults() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPanel, setSelectedPanel] = useState("all");
  const [findings, setFindings] = useState("");
  const [comments, setComments] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showSampleSheet, setShowSampleSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestRow, setSelectedTestRow] = useState<LabResultRow | null>(
    null
  );

  const patientContext: PatientContext = {
    age: mockPatient.age,
    sex: mockPatient.sex,
  };

  const {
    rows,
    updateValue,
    updateUnit,
    addTest,
    removeTest,
    recalculateAll,
    getRowsByPanel,
    hasCriticalValues,
    dirtyRows,
    markAllSaved,
  } = useLabResults({
    patient: patientContext,
    initialResults: initialMockResults,
  });

  // Sample collection state
  const testIdsForSample = useMemo(() => rows.map((r) => r.testId), [rows]);
  
  const {
    testStatuses,
    collectSample,
    getExistingSampleForTests,
    getSampleForTest,
    hasCollectedTests,
  } = useSampleCollection({
    orderId: mockOrder.id,
    testIds: testIdsForSample,
    specimenType: mockOrder.specimen.type,
  });

  // Build test definitions map
  const testDefinitionsMap = useMemo(() => {
    const map = new Map<string, TestDefinition>();
    rows.forEach((r) => {
      map.set(r.testId, r.testDef);
    });
    return map;
  }, [rows]);

  // Lab Diagnostics AI
  const {
    analyze: analyzeWithAI,
    response: aiResponse,
    isAnalyzing,
    error: aiError,
    getTestDiagnostics,
  } = useLabDiagnosticsAI({
    orderId: mockOrder.id,
    patient: { ...patientContext, mrn: mockPatient.mrn },
    physician: mockPatient.physician,
    panels: mockOrder.panels,
  });

  const handleAnalyze = useCallback(() => {
    analyzeWithAI(rows, testDefinitionsMap);
  }, [analyzeWithAI, rows, testDefinitionsMap]);

  // Create a debounced version of rows to trigger AI analysis
  const rowValuesSignature = useMemo(() => {
    return rows.map(r => `${r.testId}:${r.valueSI}`).join('|');
  }, [rows]);
  
  const debouncedSignature = useDebounce(rowValuesSignature, 1500);
  const hasAnalyzedRef = useRef(false);
  const lastSignatureRef = useRef<string>('');

  // Auto-trigger AI analysis when values change (debounced)
  useEffect(() => {
    // Check if any row has a value
    const hasValues = rows.some(r => r.valueSI !== null && r.valueSI !== undefined);
    
    // Only analyze if signature changed and we have values
    if (hasValues && debouncedSignature !== lastSignatureRef.current) {
      lastSignatureRef.current = debouncedSignature;
      handleAnalyze();
    }
  }, [debouncedSignature, rows, handleAnalyze]);

  const handleApplyNarrative = useCallback((text: string) => {
    setFindings(text);
    toast({
      title: "Narrative Applied",
      description: "AI-suggested narrative has been applied to findings.",
    });
  }, [toast]);

  const handleApplyComments = useCallback((text: string) => {
    setComments(text);
    toast({
      title: "Comments Applied",
      description: "AI-suggested comments have been applied.",
    });
  }, [toast]);

  // Get sample status for display
  const sampleInfo = useMemo(() => {
    // Check if any test has a sample
    for (const row of rows) {
      const sample = getSampleForTest(row.testId);
      if (sample) {
        return sample;
      }
    }
    return null;
  }, [rows, getSampleForTest]);

  // Filter rows by selected panel and search query
  const filteredRows = useMemo(() => {
    let rows = getRowsByPanel(selectedPanel);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.testDef.displayName.toLowerCase().includes(query) ||
          row.testDef.loinc?.toLowerCase().includes(query) ||
          row.testDef.synonyms?.some((s) => s.toLowerCase().includes(query))
      );
    }
    return rows;
  }, [getRowsByPanel, selectedPanel, searchQuery]);

  // Count tests per panel
  const testCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    panelsCatalog.forEach((panel) => {
      counts[panel.id] = getRowsByPanel(panel.id).length;
    });
    return counts;
  }, [getRowsByPanel]);

  // Existing test IDs for AddTestModal
  const existingTestIds = useMemo(() => {
    return new Set(rows.map((r) => r.testId));
  }, [rows]);

  const handleSaveDraft = () => {
    markAllSaved();
    toast({
      title: "Draft Saved",
      description: `${dirtyRows.length} result(s) have been saved as draft.`,
    });
  };

  const handleValidate = () => {
    if (hasCriticalValues) {
      const criticalCount = rows.filter((r) => r.flag === "C").length;
      toast({
        title: "Critical Values Detected",
        description: `${criticalCount} test(s) have critical values requiring attention.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Validation Complete",
        description: "All results are within acceptable ranges.",
      });
    }
  };

  const handleRelease = () => {
    if (hasCriticalValues) {
      toast({
        title: "Critical Values Alert",
        description:
          "Please acknowledge critical values before releasing results.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Results Released",
      description: "Lab results have been released and are now final.",
    });
    setTimeout(() => navigate("/diagnostics"), 1500);
  };

  const handleAddTest = (testId: string) => {
    addTest(testId);
    toast({
      title: "Test Added",
      description: `Test has been added to the results.`,
    });
  };

  // Get selected row for reference panel
  const selectedRowForRef = selectedTestRow || filteredRows[0];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <PageContent>
        <AppHeader breadcrumbs={["Diagnostics", "Lab Results"]} />

        <main
          className="px-6 py-6 pb-24 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 64px)" }}
        >
          {/* Back Link */}
          <button
            onClick={() => navigate("/diagnostics")}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Diagnostics</span>
          </button>

          {/* Patient Card */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Patient</div>
                  <div className="font-medium text-lg">{mockPatient.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {mockPatient.mrn} • {mockPatient.age}y | {mockPatient.sex}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <Badge variant="outline">{mockPatient.type}</Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    Encounter: {mockPatient.encounterId}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Physician</div>
                  <div className="font-medium">{mockPatient.physician}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Allergies</div>
                  <div className="flex gap-1 mt-1">
                    {mockPatient.allergies.map((a) => (
                      <Badge key={a} variant="outline" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Order ID</div>
                  <div className="font-medium">{mockOrder.id}</div>
                  <Badge variant="secondary" className="mt-1">
                    {mockOrder.priority}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Panels</div>
                  {mockOrder.panels.map((p) => (
                    <div key={p} className="text-sm">
                      {p}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Specimen</div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {mockOrder.specimen.type}
                    {sampleInfo ? (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-xs">Sample ID: {sampleInfo.sampleId}</span>
                        <span className="text-muted-foreground">·</span>
                        <Badge
                          variant="default"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                        >
                          Collected
                        </Badge>
                      </>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1 text-muted-foreground text-xs">
                              <AlertCircle className="h-3 w-3" />
                              Not Collected
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Collect sample to proceed with testing.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {sampleInfo && (
                    <div className="text-xs text-muted-foreground">
                      Barcode: {sampleInfo.sampleId}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Collected / Received
                  </div>
                  <div className="text-xs">{mockOrder.specimen.collected}</div>
                  <div className="text-xs">{mockOrder.specimen.received}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Analyzer</div>
                  <div className="text-sm">{mockOrder.specimen.analyzer}</div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="h-3 w-3 mr-1" />
                    Import CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Panel Selector */}
            <LabResultsPanelTabs
              selectedPanel={selectedPanel}
              onPanelChange={setSelectedPanel}
              testCounts={testCounts}
              onCollectSample={() => setShowSampleSheet(true)}
            />

            <div className="grid grid-cols-3 gap-6">
              {/* Results Grid - Left Column (2/3) */}
              <div className="col-span-2 space-y-6">
                {/* Results Table */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-[18px]">Test Results</CardTitle>
                        {hasCriticalValues && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Critical
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search tests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 w-[200px] h-9"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddTestModal(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Test
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredRows.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No tests in this panel.</p>
                        <Button
                          variant="link"
                          onClick={() => setShowAddTestModal(true)}
                        >
                          Add a test
                        </Button>
                      </div>
                    ) : (
                      <LabResultsTable
                        rows={filteredRows}
                        onValueChange={updateValue}
                        onUnitChange={updateUnit}
                        onRemove={removeTest}
                        onRecalculate={recalculateAll}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Narratives */}
                <Card>
                  <CardHeader>
                    <CardTitle>Narratives</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Findings
                      </label>
                      <Textarea
                        value={findings}
                        onChange={(e) => setFindings(e.target.value)}
                        placeholder="Enter key findings..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Comments
                      </label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Additional comments or interpretation..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Other Notes
                      </label>
                      <Textarea
                        value={otherNotes}
                        onChange={(e) => setOtherNotes(e.target.value)}
                        placeholder="Technical notes, limitations, etc..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column (1/3) - AI Panel, QC and Attachments */}
              <div className="space-y-4">
                {/* Diagnostics AI Panel */}
                <DiagnosticsAIPanel
                  response={aiResponse}
                  isAnalyzing={isAnalyzing}
                  error={aiError}
                  onAnalyze={handleAnalyze}
                  onApplyNarrative={handleApplyNarrative}
                  onApplyComments={handleApplyComments}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">QC Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">
                        All QC passed
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Last QC: Today 09:00 AM
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>

            {/* Reference Information - Below Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reference Information</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRowForRef ? (
                  <div className="grid grid-cols-5 gap-6">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Selected Test
                      </div>
                      <div className="text-sm font-medium">
                        {selectedRowForRef.testDef.displayName}
                      </div>
                      {selectedRowForRef.testDef.loinc && (
                        <div className="text-xs text-muted-foreground">
                          LOINC: {selectedRowForRef.testDef.loinc}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Reference Range
                      </div>
                      <div className="text-sm">
                        {selectedRowForRef.refRangeText} {selectedRowForRef.unit}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        For {mockPatient.age}y {mockPatient.sex}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Critical Values
                      </div>
                      {selectedRowForRef.testDef.criticalRanges.length > 0 ? (
                        selectedRowForRef.testDef.criticalRanges.map((crit, i) => (
                          <div key={i} className="text-sm text-destructive">
                            {crit.lowSI !== null && `≤ ${crit.lowSI}`}
                            {crit.lowSI !== null && crit.highSI !== null && " or "}
                            {crit.highSI !== null && `≥ ${crit.highSI}`}{" "}
                            {selectedRowForRef.unit}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">None defined</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Prior Results
                      </div>
                      {selectedRowForRef.priorValue ? (
                        <div className="text-sm">
                          {selectedRowForRef.priorValue} {selectedRowForRef.unit}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No prior results</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Notes
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedRowForRef.testDef.notes || "—"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No test selected</div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-[60px] right-0 bg-background border-t p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            {dirtyRows.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {dirtyRows.length} unsaved change
                {dirtyRows.length !== 1 ? "s" : ""}
              </span>
            )}
            {hasCriticalValues && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Critical values present
              </Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="secondary" onClick={handleValidate}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button onClick={handleRelease}>Release Results</Button>
          </div>
        </div>

        {/* Add Test Modal */}
        <AddTestModal
          open={showAddTestModal}
          onClose={() => setShowAddTestModal(false)}
          onAddTest={handleAddTest}
          existingTestIds={existingTestIds}
        />

        {/* Sample Collection Sheet */}
        <SampleCollectionSheet
          open={showSampleSheet}
          onClose={() => setShowSampleSheet(false)}
          orderId={mockOrder.id}
          specimenType={mockOrder.specimen.type}
          testIds={testIdsForSample}
          testStatuses={testStatuses}
          onCollect={collectSample}
          getExistingSampleForTests={getExistingSampleForTests}
          testDefinitions={testDefinitionsMap}
        />
      </PageContent>
    </div>
  );
}
