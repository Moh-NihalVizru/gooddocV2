import { useState, useMemo, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TestTube, Printer, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TestDefinition } from "@/types/lab-tests";
import { Sample, TestSampleStatus, TECHNICIANS } from "@/types/sample-collection";
import { panelsCatalog, getTestsByPanel } from "@/data/tests-catalog";

// Generate a compact barcode SVG for individual tests
function generateTestBarcode(sampleId: string, testId: string): string {
  const combined = `${sampleId}-${testId.slice(0, 4)}`;
  const bars: string[] = [];
  const barWidth = 1.5;
  let x = 5;
  
  for (let i = 0; i < combined.length; i++) {
    const charCode = combined.charCodeAt(i);
    const pattern = charCode.toString(2).padStart(8, "0");
    
    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] === "1") {
        bars.push(`<rect x="${x}" y="2" width="${barWidth}" height="28" fill="black"/>`);
      }
      x += barWidth;
    }
    x += barWidth;
  }
  
  const width = x + 5;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 32" width="${Math.min(width, 120)}" height="32">
    <rect x="0" y="0" width="${width}" height="32" fill="white"/>
    ${bars.join("")}
  </svg>`;
}

interface SampleCollectionSheetProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  specimenType: string;
  testIds: string[];
  testStatuses: Map<string, TestSampleStatus>;
  onCollect: (
    selectedTestIds: string[],
    collectedBy: string,
    collectedAt: Date
  ) => { sample: Sample; barcodeSvg: string } | null;
  getExistingSampleForTests: (testIds: string[]) => Sample | null;
  testDefinitions: Map<string, TestDefinition>;
}

export function SampleCollectionSheet({
  open,
  onClose,
  orderId,
  specimenType,
  testIds,
  testStatuses,
  onCollect,
  getExistingSampleForTests,
  testDefinitions,
}: SampleCollectionSheetProps) {
  const { toast } = useToast();
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [collectedBy, setCollectedBy] = useState("");
  const [collectionTime, setCollectionTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [collectedSample, setCollectedSample] = useState<Sample | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Group tests by panel
  const testsByPanel = useMemo(() => {
    const groups: { panelId: string; panelName: string; tests: TestDefinition[] }[] = [];

    panelsCatalog.forEach((panel) => {
      if (panel.id === "all") return;

      const panelTests = testIds
        .map((id) => testDefinitions.get(id))
        .filter((t): t is TestDefinition => t !== undefined && t.panels.includes(panel.id));

      if (panelTests.length > 0) {
        groups.push({
          panelId: panel.id,
          panelName: panel.name,
          tests: panelTests,
        });
      }
    });

    return groups;
  }, [testIds, testDefinitions]);

  // Check if all tests share same specimen type (they do in this mock)
  const allSameSpecimen = true;

  // Pre-select pending tests if all same specimen
  useEffect(() => {
    if (open) {
      if (allSameSpecimen) {
        const pendingTests = testIds.filter((id) => {
          const status = testStatuses.get(id);
          return status?.status !== "collected";
        });
        setSelectedTests(new Set(pendingTests));
      } else {
        setSelectedTests(new Set());
      }
      // Only reset collectedSample if there are pending tests to collect
      const hasPendingTests = testIds.some((id) => {
        const status = testStatuses.get(id);
        return status?.status !== "collected";
      });
      if (hasPendingTests) {
        setCollectedSample(null);
      }
      setValidationError(null);
      setCollectionTime(new Date().toISOString().slice(0, 16));
    }
  }, [open, testIds, testStatuses, allSameSpecimen]);

  // Check for existing sample - check all tests if none are pending
  const existingSample = useMemo(() => {
    // Check if all tests are already collected
    const allCollected = testIds.every((id) => {
      const status = testStatuses.get(id);
      return status?.status === "collected";
    });
    
    // If all tests are collected, find the sample for them
    if (allCollected) {
      return getExistingSampleForTests(testIds);
    }
    
    // Otherwise check selected tests
    const selectedArray = Array.from(selectedTests);
    return getExistingSampleForTests(selectedArray);
  }, [selectedTests, testIds, testStatuses, getExistingSampleForTests]);

  const handleToggleTest = (testId: string) => {
    const status = testStatuses.get(testId);
    if (status?.status === "collected") return; // Can't deselect collected tests

    setSelectedTests((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
    setValidationError(null);
  };

  const handleCollect = async () => {
    if (selectedTests.size === 0) {
      setValidationError("Select at least one test to proceed.");
      return;
    }

    if (!collectedBy) {
      setValidationError("Select a technician.");
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const collectedAt = new Date(collectionTime);
      const result = onCollect(Array.from(selectedTests), collectedBy, collectedAt);

      if (result) {
        setCollectedSample(result.sample);
        toast({
          title: `Sample ${result.sample.sampleId} collected`,
          description: "Label ready to print.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Couldn't complete collection. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const sample = collectedSample || existingSample;
    if (!sample?.barcodeSvg) return;

    // Create print window
    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sample Label - ${sample.sampleId}</title>
            <style>
              body { 
                font-family: monospace; 
                padding: 20px; 
                text-align: center;
              }
              .label {
                border: 1px solid #000;
                padding: 10px;
                display: inline-block;
              }
              .sample-id {
                font-size: 16px;
                font-weight: bold;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="label">
              ${sample.barcodeSvg}
              <div class="sample-id">Sample ID: ${sample.sampleId}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      toast({
        title: "Label sent to printer",
      });
    }
  };

  const showBarcodePreview = collectedSample || existingSample;
  const sampleToShow = collectedSample || existingSample;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-[450px] sm:max-w-[450px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>Sample Collection – {orderId}</SheetTitle>
          <SheetDescription>
            {allSameSpecimen
              ? `Specimen: ${specimenType}`
              : "Select tests that will use the same tube/specimen."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {showBarcodePreview && sampleToShow ? (
            // Barcode Preview Mode - Individual barcodes per test
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Sample Labels</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {sampleToShow.testIds.map((testId) => {
                  const testDef = testDefinitions.get(testId);
                  const testBarcode = generateTestBarcode(sampleToShow.sampleId, testId);
                  return (
                    <div
                      key={testId}
                      className="bg-white border rounded-lg p-3 flex items-center gap-3"
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: testBarcode }}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {testDef?.displayName || testId}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {sampleToShow.sampleId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-1 text-xs pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collected by</span>
                  <span className="font-medium">{sampleToShow.collectedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collection time</span>
                  <span className="font-medium">
                    {new Date(sampleToShow.collectedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Test Selection Mode
            <div className="space-y-6">
              {testsByPanel.map((group) => (
                <div key={group.panelId}>
                  <h3 className="text-sm font-semibold mb-3">{group.panelName}</h3>
                  <div className="space-y-2">
                    {group.tests.map((test) => {
                      const status = testStatuses.get(test.id);
                      const isCollected = status?.status === "collected";
                      const isChecked = selectedTests.has(test.id) || isCollected;

                      return (
                        <div
                          key={test.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCollected
                              ? "bg-muted/50 border-muted"
                              : "bg-background border-border hover:border-primary/50"
                          } transition-colors`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`test-${test.id}`}
                              checked={isChecked}
                              onCheckedChange={() => handleToggleTest(test.id)}
                              disabled={isCollected}
                              aria-label={`Select ${test.displayName}`}
                            />
                            <div className="flex items-center gap-2">
                              <TestTube className="h-4 w-4 text-muted-foreground" />
                              <Label
                                htmlFor={`test-${test.id}`}
                                className={`text-sm cursor-pointer ${
                                  isCollected ? "text-muted-foreground" : ""
                                }`}
                              >
                                {test.displayName}{" "}
                                <span className="text-muted-foreground">(Serum)</span>
                              </Label>
                            </div>
                          </div>
                          <Badge
                            variant={isCollected ? "default" : "secondary"}
                            className={
                              isCollected
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-muted text-muted-foreground"
                            }
                            aria-label={`Status: ${isCollected ? "Collected" : "Pending"}`}
                          >
                            {isCollected ? "Collected" : "Pending"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="p-6 space-y-4">
          {!showBarcodePreview && (
            <>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="collected-by">Collected by</Label>
                  <Select value={collectedBy} onValueChange={setCollectedBy}>
                    <SelectTrigger id="collected-by">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {TECHNICIANS.map((tech) => (
                        <SelectItem key={tech.id} value={tech.name}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection-time">Collection time</Label>
                  <Input
                    id="collection-time"
                    type="datetime-local"
                    value={collectionTime}
                    onChange={(e) => setCollectionTime(e.target.value)}
                  />
                </div>
              </div>

              {validationError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {validationError}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3">
            {showBarcodePreview ? (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Done
                </Button>
                <Button onClick={handlePrint} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Label
                </Button>
              </>
            ) : existingSample ? (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setCollectedSample(existingSample)} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Reprint Barcode Label
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCollect}
                  disabled={selectedTests.size === 0 || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Collecting..." : "Mark as Collected & Generate Barcode"}
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
