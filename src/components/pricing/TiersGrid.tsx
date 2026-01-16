import { useFormContext } from "react-hook-form";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PricingItemFormData } from "@/types/pricing-item";
import { suggestTiers } from "@/lib/priceUtils";

export function TiersGrid() {
  const { watch, setValue } = useFormContext<PricingItemFormData>();
  
  const netPrice = watch("pricing.netPrice");
  const cashTier = watch("pricing.tiers.cash");
  const insuranceTier = watch("pricing.tiers.insurance");
  const corporateTier = watch("pricing.tiers.corporate");

  const handleResetFromNet = () => {
    const suggested = suggestTiers(netPrice);
    setValue("pricing.tiers.cash", suggested.cash);
    setValue("pricing.tiers.insurance", suggested.insurance);
    setValue("pricing.tiers.corporate", suggested.corporate);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Price Tiers (Optional)</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResetFromNet}
          className="h-8 text-xs gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset from Net
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tier-cash" className="text-xs text-muted-foreground">
            Cash Price
          </Label>
          <Input
            id="tier-cash"
            type="number"
            step="0.01"
            value={cashTier || ""}
            onChange={(e) =>
              setValue("pricing.tiers.cash", e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className="mt-1"
            placeholder="₹"
          />
        </div>

        <div>
          <Label htmlFor="tier-insurance" className="text-xs text-muted-foreground">
            Insurance Price
          </Label>
          <Input
            id="tier-insurance"
            type="number"
            step="0.01"
            value={insuranceTier || ""}
            onChange={(e) =>
              setValue("pricing.tiers.insurance", e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className="mt-1"
            placeholder="₹"
          />
        </div>

        <div>
          <Label htmlFor="tier-corporate" className="text-xs text-muted-foreground">
            Corporate Price
          </Label>
          <Input
            id="tier-corporate"
            type="number"
            step="0.01"
            value={corporateTier || ""}
            onChange={(e) =>
              setValue("pricing.tiers.corporate", e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className="mt-1"
            placeholder="₹"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Suggested: Cash = Net, Insurance = 92% of Net, Corporate = 96% of Net
      </p>
    </div>
  );
}
