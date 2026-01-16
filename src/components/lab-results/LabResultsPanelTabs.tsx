import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TestTube } from "lucide-react";
import { panelsCatalog } from "@/data/tests-catalog";

interface LabResultsPanelTabsProps {
  selectedPanel: string;
  onPanelChange: (panel: string) => void;
  testCounts?: Record<string, number>;
  onCollectSample?: () => void;
}

export function LabResultsPanelTabs({
  selectedPanel,
  onPanelChange,
  testCounts,
  onCollectSample,
}: LabResultsPanelTabsProps) {
  return (
    <div className="flex items-center justify-between">
      <Tabs value={selectedPanel} onValueChange={onPanelChange}>
        <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start w-auto">
          {panelsCatalog.map((panel) => (
            <TabsTrigger
              key={panel.id}
              value={panel.id}
              className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3 relative"
            >
              {panel.name}
              {testCounts && testCounts[panel.id] !== undefined && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({testCounts[panel.id]})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {onCollectSample && (
        <Button variant="outline" size="sm" onClick={onCollectSample} className="gap-2">
          <TestTube className="h-4 w-4" />
          Collect Sample
        </Button>
      )}
    </div>
  );
}
