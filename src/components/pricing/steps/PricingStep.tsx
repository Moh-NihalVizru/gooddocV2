import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Calculator, Info } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
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
import { PricingItemFormData } from "@/types/pricing-item";
import { calcNetPrice, getPriceBreakdown } from "@/lib/priceUtils";
import { TiersGrid } from "../TiersGrid";
import { BranchOverrides } from "../BranchOverrides";
import { cn } from "@/lib/utils";

export function PricingStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PricingItemFormData>();

  const currency = watch("pricing.currency");
  const cost = watch("pricing.cost") || 0;
  const basePrice = watch("pricing.basePrice") || 0;
  const markupPct = watch("pricing.markupPct") || 0;
  const discountPct = watch("pricing.discountPct") || 0;
  const taxPct = watch("pricing.taxPct") || 0;
  const autoCalcNet = watch("autoCalcNet");
  const effectiveFrom = watch("pricing.effectiveFrom");
  const effectiveTo = watch("pricing.effectiveTo");

  // Auto-calculate net price when auto-calc is enabled
  useEffect(() => {
    if (autoCalcNet) {
      const netPrice = calcNetPrice({
        basePrice,
        markupPct,
        discountPct,
        taxPct,
      });
      setValue("pricing.netPrice", netPrice);
    }
  }, [basePrice, markupPct, discountPct, taxPct, autoCalcNet, setValue]);

  const breakdown = getPriceBreakdown({
    basePrice,
    markupPct,
    discountPct,
    taxPct,
  });

  const handleEffectiveFromChange = (date: Date | undefined) => {
    setValue("pricing.effectiveFrom", date ? format(date, "yyyy-MM-dd") : undefined);
  };

  const handleEffectiveToChange = (date: Date | undefined) => {
    setValue("pricing.effectiveTo", date ? format(date, "yyyy-MM-dd") : null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Base Pricing</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Currency */}
          <div>
            <Label htmlFor="currency">
              Currency <span className="text-destructive">*</span>
            </Label>
            <Select
              value={currency}
              onValueChange={(value) => setValue("pricing.currency", value as any)}
            >
              <SelectTrigger id="currency" className="mt-1">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
            {errors.pricing?.currency && (
              <p className="text-xs text-destructive mt-1">{errors.pricing.currency.message}</p>
            )}
          </div>

          {/* Internal Cost */}
          <div>
            <Label htmlFor="cost" className="flex items-center gap-1">
              Internal Cost (Optional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Your internal cost for this item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              {...register("pricing.cost", { valueAsNumber: true })}
              placeholder="0.00"
              className="mt-1"
            />
          </div>

          {/* Base Price */}
          <div>
            <Label htmlFor="basePrice">
              Base Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              min="0.01"
              {...register("pricing.basePrice", { valueAsNumber: true })}
              placeholder="0.00"
              className="mt-1"
            />
            {errors.pricing?.basePrice && (
              <p className="text-xs text-destructive mt-1">{errors.pricing.basePrice.message}</p>
            )}
          </div>

          {/* Markup % */}
          <div>
            <Label htmlFor="markupPct" className="flex items-center gap-1">
              Markup %
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Percentage added to base price</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative mt-1">
              <Input
                id="markupPct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("pricing.markupPct", { valueAsNumber: true })}
                placeholder="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </div>

          {/* Discount % */}
          <div>
            <Label htmlFor="discountPct" className="flex items-center gap-1">
              Discount %
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Percentage discount applied</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative mt-1">
              <Input
                id="discountPct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("pricing.discountPct", { valueAsNumber: true })}
                placeholder="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </div>

          {/* Tax % */}
          <div>
            <Label htmlFor="taxPct" className="flex items-center gap-1">
              Tax %
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Tax percentage (e.g., GST)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative mt-1">
              <Input
                id="taxPct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("pricing.taxPct", { valueAsNumber: true })}
                placeholder="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Net Price Calculation</h3>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="autoCalcNet" className="text-sm font-normal">
              Auto-calculate
            </Label>
            <Switch
              id="autoCalcNet"
              checked={autoCalcNet}
              onCheckedChange={(checked) => setValue("autoCalcNet", checked)}
            />
          </div>
        </div>

        {/* Calculation Breakdown */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="space-y-1 text-sm">
            {breakdown.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "flex justify-between",
                  line.startsWith("= Net") && "font-semibold text-primary pt-2 border-t"
                )}
              >
                <span>{line.split(":")[0]}</span>
                <span>{line.split(": ")[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Net Price Input/Display */}
        <div>
          <Label htmlFor="netPrice">
            Net Price <span className="text-destructive">*</span>
          </Label>
          {autoCalcNet ? (
            <div className="mt-1">
              <Badge variant="secondary" className="text-base px-4 py-2">
                ₹{watch("pricing.netPrice")?.toFixed(2) || "0.00"}
              </Badge>
            </div>
          ) : (
            <Input
              id="netPrice"
              type="number"
              step="0.01"
              min="0"
              {...register("pricing.netPrice", { valueAsNumber: true })}
              placeholder="0.00"
              className="mt-1"
            />
          )}
          {errors.pricing?.netPrice && (
            <p className="text-xs text-destructive mt-1">{errors.pricing.netPrice.message}</p>
          )}
        </div>
      </Card>

      {/* Price Tiers */}
      <Card className="p-6">
        <TiersGrid />
      </Card>

      {/* Effective Dates */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Effective Dates</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Effective From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !effectiveFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {effectiveFrom ? format(new Date(effectiveFrom), "dd MMM yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={effectiveFrom ? new Date(effectiveFrom) : undefined}
                  onSelect={handleEffectiveFromChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Effective To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !effectiveTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {effectiveTo ? format(new Date(effectiveTo), "dd MMM yyyy") : "No end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={effectiveTo ? new Date(effectiveTo) : undefined}
                  onSelect={handleEffectiveToChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(date) => {
                    if (effectiveFrom) {
                      return date < new Date(effectiveFrom);
                    }
                    return false;
                  }}
                />
              </PopoverContent>
            </Popover>
            {errors.pricing?.effectiveTo && (
              <p className="text-xs text-destructive mt-1">{errors.pricing.effectiveTo.message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Branch Overrides */}
      <Card className="p-6">
        <BranchOverrides />
      </Card>
    </div>
  );
}
