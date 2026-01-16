import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Calculator, Beaker } from "lucide-react";
import { TestDefinition } from "@/types/lab-tests";
import { searchTests } from "@/data/tests-catalog";

interface AddTestModalProps {
  open: boolean;
  onClose: () => void;
  onAddTest: (testId: string) => void;
  existingTestIds: Set<string>;
}

export function AddTestModal({
  open,
  onClose,
  onAddTest,
  existingTestIds,
}: AddTestModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTests = useMemo(() => {
    const results = searchTests(searchQuery);
    return results.filter((t) => !existingTestIds.has(t.id));
  }, [searchQuery, existingTestIds]);

  const handleAdd = (test: TestDefinition) => {
    onAddTest(test.id);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Test</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by test name, LOINC, or synonym..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredTests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No tests found matching your search"
                    : "All available tests have been added"}
                </div>
              ) : (
                filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {test.kind === "calculated" ? (
                          <Calculator className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Beaker className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-medium truncate">
                          {test.displayName}
                        </span>
                        {test.kind === "calculated" && (
                          <Badge variant="secondary" className="text-xs">
                            Calculated
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {test.loinc && <span>LOINC: {test.loinc}</span>}
                        {test.panels.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{test.panels.join(", ")}</span>
                          </>
                        )}
                        {test.synonyms.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {test.synonyms.slice(0, 2).join(", ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleAdd(test)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {filteredTests.length} test{filteredTests.length !== 1 ? "s" : ""}{" "}
              available
            </span>
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
