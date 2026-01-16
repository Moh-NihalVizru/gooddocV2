import { useFormContext } from "react-hook-form";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PricingItemFormData } from "@/types/pricing-item";

export function ReviewStep() {
  const { watch, formState: { errors } } = useFormContext<PricingItemFormData>();

  const formData = watch();
  const hasErrors = Object.keys(errors).length > 0;

  const errorList = Object.entries(errors).flatMap(([key, value]) => {
    if (typeof value === "object" && value !== null && "message" in value) {
      return [`${key}: ${value.message}`];
    }
    return [];
  });

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      {hasErrors ? (
        <Card className="p-4 border-destructive bg-destructive/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-2">
                Please fix the following errors:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                {errorList.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-green-600 bg-green-50">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">All required fields are complete!</span>
          </div>
        </Card>
      )}

      {/* Basic Information Summary */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Basic Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item Name:</span>
            <span className="font-medium">{formData.name || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <Badge variant="secondary">{formData.category || "-"}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Department:</span>
            <span className="font-medium">{formData.department || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Internal Code:</span>
            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {formData.codes?.internal || "-"}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unit:</span>
            <span className="font-medium capitalize">{formData.unit || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Visibility:</span>
            <Badge variant="outline" className="capitalize">
              {formData.visibility || "-"}
            </Badge>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Pricing Summary */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Pricing Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Currency:</span>
            <span className="font-medium">{formData.pricing?.currency || "-"}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Price:</span>
            <span className="font-medium">
              {formData.pricing?.currency === "INR" ? "₹" : "$"}
              {formData.pricing?.basePrice?.toFixed(2) || "0.00"}
            </span>
          </div>
          {formData.pricing?.markupPct !== undefined && formData.pricing.markupPct > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">+ Markup:</span>
              <span>{formData.pricing.markupPct}%</span>
            </div>
          )}
          {formData.pricing?.discountPct !== undefined && formData.pricing.discountPct > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">- Discount:</span>
              <span>{formData.pricing.discountPct}%</span>
            </div>
          )}
          {formData.pricing?.taxPct !== undefined && formData.pricing.taxPct > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">+ Tax:</span>
              <span>{formData.pricing.taxPct}%</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-base">
            <span className="font-semibold">Net Price:</span>
            <span className="font-bold text-primary">
              {formData.pricing?.currency === "INR" ? "₹" : "$"}
              {formData.pricing?.netPrice?.toFixed(2) || "0.00"}
            </span>
          </div>
          {formData.pricing?.tiers && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Price Tiers:</span>
                {formData.pricing.tiers.cash && (
                  <div className="flex justify-between text-xs">
                    <span>Cash:</span>
                    <span>₹{formData.pricing.tiers.cash.toFixed(2)}</span>
                  </div>
                )}
                {formData.pricing.tiers.insurance && (
                  <div className="flex justify-between text-xs">
                    <span>Insurance:</span>
                    <span>₹{formData.pricing.tiers.insurance.toFixed(2)}</span>
                  </div>
                )}
                {formData.pricing.tiers.corporate && (
                  <div className="flex justify-between text-xs">
                    <span>Corporate:</span>
                    <span>₹{formData.pricing.tiers.corporate.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </>
          )}
          {formData.pricing?.effectiveFrom && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Effective From:</span>
              <span>{formData.pricing.effectiveFrom}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Operational Details */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Operational Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Turnaround Time:</span>
            <span className="font-medium">{formData.turnaroundTime || "Not specified"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requires Doctor Order:</span>
            <Badge variant={formData.requiresDoctorOrder ? "default" : "secondary"}>
              {formData.requiresDoctorOrder ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Availability:</span>
            <Badge
              variant={formData.availability === "In Stock" ? "default" : "secondary"}
            >
              {formData.availability}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Branch Overrides */}
      {formData.branchOverrides && formData.branchOverrides.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">
            Branch Overrides ({formData.branchOverrides.length})
          </h3>
          <div className="space-y-3 text-sm">
            {formData.branchOverrides.map((override, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium mb-2">{override.branchName || `Branch ${index + 1}`}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Base:</span> ₹
                    {override.basePrice?.toFixed(2) || "0.00"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Net:</span> ₹
                    {override.netPrice?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
