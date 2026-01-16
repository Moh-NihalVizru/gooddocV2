import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TrendingUp,
  TrendingDown,
  Lock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { LabResultRow } from "@/hooks/useLabResults";
import { FlagType } from "@/types/lab-tests";
import { cn } from "@/lib/utils";

interface LabResultsTableProps {
  rows: LabResultRow[];
  onValueChange: (rowId: string, value: string) => void;
  onUnitChange: (rowId: string, unit: string) => void;
  onRemove?: (rowId: string) => void;
  onRecalculate?: () => void;
}

const flagStyles: Record<FlagType, string> = {
  N: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  L: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  H: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  C: "bg-destructive text-destructive-foreground",
};

const flagLabels: Record<FlagType, string> = {
  N: "Normal",
  L: "Low",
  H: "High",
  C: "Critical",
};

export function LabResultsTable({
  rows,
  onValueChange,
  onUnitChange,
  onRemove,
  onRecalculate,
}: LabResultsTableProps) {
  // Track if we need to recalculate
  const [needsRecalc, setNeedsRecalc] = useState(false);

  useEffect(() => {
    if (needsRecalc && onRecalculate) {
      const timer = setTimeout(() => {
        onRecalculate();
        setNeedsRecalc(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [needsRecalc, onRecalculate]);

  const handleValueChange = (rowId: string, value: string) => {
    onValueChange(rowId, value);
    setNeedsRecalc(true);
  };

  const getDeltaIndicator = (deltaPct: number | null) => {
    if (deltaPct === null) return null;
    const isPositive = deltaPct > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive
      ? "text-orange-600 dark:text-orange-400"
      : "text-blue-600 dark:text-blue-400";

    return (
      <span className={cn("flex items-center gap-1 text-xs", color)}>
        <Icon className="h-3 w-3" />
        {Math.abs(deltaPct)}%
      </span>
    );
  };

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px]">Test Name</TableHead>
            <TableHead className="w-[120px]">Value</TableHead>
            <TableHead className="w-[140px]">Unit</TableHead>
            <TableHead className="w-[140px]">Reference Range</TableHead>
            <TableHead className="w-[80px]">Flag</TableHead>
            <TableHead className="w-[120px]">Delta</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(
                row.flag === "C" && "bg-destructive/5",
                row.isDirty && "bg-amber-50/50 dark:bg-amber-900/10"
              )}
            >
              {/* Test Name */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {row.testDef.kind === "calculated" && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Calculated field</p>
                        {row.testDef.dependencies && (
                          <p className="text-xs text-muted-foreground">
                            Depends on: {row.testDef.dependencies.join(", ")}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <div>
                    <div className="font-medium">{row.testDef.displayName}</div>
                    {row.testDef.loinc && (
                      <div className="text-xs text-muted-foreground">
                        {row.testDef.loinc}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Value */}
              <TableCell>
                {row.testDef.kind === "calculated" ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-mono",
                        row.flag === "C" && "text-destructive font-semibold"
                      )}
                    >
                      {row.value || "—"}
                    </span>
                  </div>
                ) : row.testDef.kind === "categorical" ? (
                  <Select
                    value={row.value}
                    onValueChange={(v) => handleValueChange(row.id, v)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {row.testDef.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={row.value}
                    onChange={(e) => handleValueChange(row.id, e.target.value)}
                    className={cn(
                      "w-24 font-mono",
                      row.flag === "C" &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    type="text"
                    inputMode="decimal"
                    aria-label={`Value for ${row.testDef.displayName}`}
                  />
                )}
              </TableCell>

              {/* Unit */}
              <TableCell>
                {row.testDef.units.length > 1 ? (
                  <Select
                    value={row.unit}
                    onValueChange={(v) => onUnitChange(row.id, v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {row.testDef.units.map((u) => (
                        <SelectItem key={u.code} value={u.code}>
                          {u.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {row.unit}
                  </span>
                )}
              </TableCell>

              {/* Reference Range */}
              <TableCell className="text-sm text-muted-foreground">
                {row.refRangeText}
              </TableCell>

              {/* Flag */}
              <TableCell>
                {row.value && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        className={cn(
                          "min-w-[28px] justify-center",
                          flagStyles[row.flag]
                        )}
                      >
                        {row.flag === "C" && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {row.flag}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{flagLabels[row.flag]}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TableCell>

              {/* Delta */}
              <TableCell>
                {row.priorValue && (
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">
                      Prior: {row.priorValue}
                    </div>
                    {getDeltaIndicator(row.deltaPct)}
                  </div>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell>
                {onRemove && row.testDef.kind !== "calculated" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(row.id)}
                    aria-label={`Remove ${row.testDef.displayName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
