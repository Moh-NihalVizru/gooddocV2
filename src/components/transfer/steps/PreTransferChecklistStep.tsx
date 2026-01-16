import { useState } from "react";
import { Check, AlertCircle, FileText, Stethoscope, Truck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ChecklistItem } from "@/types/transfer";

interface PreTransferChecklistStepProps {
  checklist: ChecklistItem[];
  onChecklistChange: (checklist: ChecklistItem[]) => void;
  priority: string;
}

const categoryConfig = {
  clinical: { icon: Stethoscope, label: "Clinical", color: "text-blue-600" },
  operational: { icon: Truck, label: "Operational", color: "text-purple-600" },
  documentation: { icon: FileText, label: "Documentation", color: "text-amber-600" },
};

export function PreTransferChecklistStep({ 
  checklist, 
  onChecklistChange,
  priority 
}: PreTransferChecklistStepProps) {
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);

  const handleToggleItem = (itemId: string) => {
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onChecklistChange(updated);
  };

  const handleNoteChange = (itemId: string, notes: string) => {
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, notes } : item
    );
    onChecklistChange(updated);
  };

  const toggleNotes = (itemId: string) => {
    setExpandedNotes((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const totalItems = checklist.length;
  const completedItems = checklist.filter((item) => item.checked).length;
  const requiredItems = checklist.filter((item) => item.required);
  const completedRequired = requiredItems.filter((item) => item.checked).length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const allRequiredComplete = completedRequired === requiredItems.length;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium text-foreground">Checklist Progress</h3>
            <p className="text-sm text-muted-foreground">
              {completedItems} of {totalItems} items completed
            </p>
          </div>
          <div className="text-right">
            <Badge 
              variant="secondary"
              className={cn(
                allRequiredComplete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}
            >
              {completedRequired}/{requiredItems.length} Required
            </Badge>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {priority === 'stat' && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>STAT transfer: Some items can be completed after transfer. Document any bypassed items.</p>
        </div>
      )}

      {/* Checklist Sections */}
      <div className="space-y-6">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((category) => {
          const items = groupedChecklist[category];
          if (!items || items.length === 0) return null;

          const config = categoryConfig[category];
          const Icon = config.icon;
          const categoryCompleted = items.filter((item) => item.checked).length;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className={cn("w-5 h-5", config.color)} />
                <h4 className="font-medium text-foreground">{config.label}</h4>
                <Badge variant="outline" className="text-xs">
                  {categoryCompleted}/{items.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      item.checked && "bg-muted/50 border-border",
                      !item.checked && item.required && "border-amber-200 bg-amber-50/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={item.id}
                          className={cn(
                            "text-sm font-medium cursor-pointer",
                            item.checked && "text-muted-foreground line-through"
                          )}
                        >
                          {item.label}
                          {item.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        
                        {expandedNotes.includes(item.id) && (
                          <Input
                            placeholder="Add notes..."
                            value={item.notes || ""}
                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                            className="mt-2 text-sm"
                          />
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => toggleNotes(item.id)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {expandedNotes.includes(item.id) ? "Hide" : "Notes"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Status */}
      {!allRequiredComplete && (
        <div className="flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Required items incomplete</p>
            <p className="text-sm mt-1">
              Complete all required items (marked with *) before proceeding to review.
            </p>
          </div>
        </div>
      )}

      {allRequiredComplete && (
        <div className="flex items-start gap-2 p-4 bg-emerald-50 rounded-lg text-emerald-700">
          <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">All required items complete</p>
            <p className="text-sm mt-1">
              You can proceed to review and confirm the transfer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
