import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PricingItemFormData } from "@/types/pricing-item";
import { useBranches } from "@/api/pricingApi";
import { calcNetPrice } from "@/lib/priceUtils";
import { useEffect } from "react";

export function BranchOverrides() {
  const { control, watch, setValue } = useFormContext<PricingItemFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "branchOverrides",
  });

  const { data: branches, isLoading } = useBranches();

  const handleAddOverride = () => {
    append({
      branchId: "",
      branchName: "",
      currency: "INR",
      basePrice: 0,
      taxPct: 0,
      netPrice: 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Branch-Specific Pricing</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Override pricing for specific branches
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOverride}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Override
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                  BRANCH
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                  BASE PRICE (₹)
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                  TAX (%)
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                  NET PRICE (₹)
                </th>
                <th className="w-12 p-3"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <BranchOverrideRow
                  key={field.id}
                  index={index}
                  branches={branches || []}
                  isLoading={isLoading}
                  onRemove={() => remove(index)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface BranchOverrideRowProps {
  index: number;
  branches: Array<{ id: string; name: string }>;
  isLoading: boolean;
  onRemove: () => void;
}

function BranchOverrideRow({ index, branches, isLoading, onRemove }: BranchOverrideRowProps) {
  const { watch, setValue, register } = useFormContext<PricingItemFormData>();

  const branchId = watch(`branchOverrides.${index}.branchId`);
  const basePrice = watch(`branchOverrides.${index}.basePrice`) || 0;
  const taxPct = watch(`branchOverrides.${index}.taxPct`) || 0;

  // Auto-calculate net price for branch override
  useEffect(() => {
    const netPrice = calcNetPrice({
      basePrice,
      markupPct: 0,
      discountPct: 0,
      taxPct,
    });
    setValue(`branchOverrides.${index}.netPrice`, netPrice);
  }, [basePrice, taxPct, index, setValue]);

  const handleBranchChange = (value: string) => {
    const branch = branches.find((b) => b.id === value);
    setValue(`branchOverrides.${index}.branchId`, value);
    setValue(`branchOverrides.${index}.branchName`, branch?.name || "");
  };

  return (
    <tr className="border-t hover:bg-muted/20">
      <td className="p-3">
        <Select value={branchId} onValueChange={handleBranchChange} disabled={isLoading}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        <Input
          type="number"
          step="0.01"
          min="0"
          {...register(`branchOverrides.${index}.basePrice`, { valueAsNumber: true })}
          className="h-9"
        />
      </td>
      <td className="p-3">
        <Input
          type="number"
          step="0.01"
          min="0"
          max="100"
          {...register(`branchOverrides.${index}.taxPct`, { valueAsNumber: true })}
          className="h-9"
        />
      </td>
      <td className="p-3">
        <div className="font-medium text-sm">
          ₹{watch(`branchOverrides.${index}.netPrice`)?.toFixed(2) || "0.00"}
        </div>
      </td>
      <td className="p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </td>
    </tr>
  );
}
