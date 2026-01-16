import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/utils/currency";

interface ClaimSummaryDrawerProps {
  data: any;
}

export function ClaimSummaryDrawer({ data }: ClaimSummaryDrawerProps) {
  const calculateTotals = () => {
    const services = data.services || [];
    const subtotal = services.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
    const tax = services.reduce((sum: number, s: any) => sum + (s.tax || 0), 0);
    const discount = services.reduce((sum: number, s: any) => sum + (s.discount || 0), 0);
    const total = subtotal + tax - discount;

    return { subtotal, tax, discount, total };
  };

  const totals = calculateTotals();

  return (
    <Card className="p-6 sticky top-6">
      <h3 className="font-semibold text-foreground mb-4">Claim Summary</h3>
      
      {/* Patient Info */}
      {data.patient && (
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">Patient</div>
          <div className="font-medium">{data.patient.name}</div>
          <div className="text-sm text-muted-foreground">{data.patient.phone}</div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Payer/Policy Info */}
      {(data.payer || data.policy) && (
        <>
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-1">
              {data.policy ? "Policy" : "Payer"}
            </div>
            {data.policy && (
              <>
                <div className="font-medium">{data.policy.policyNo}</div>
                <div className="text-sm text-muted-foreground">{data.payer?.name}</div>
              </>
            )}
            {!data.policy && data.payer && (
              <div className="font-medium">{data.payer.name}</div>
            )}
          </div>
          <Separator className="my-4" />
        </>
      )}

      {/* Claim Type */}
      {data.claimType && (
        <>
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-1">Claim Type</div>
            <div className="font-medium">{data.claimType}</div>
          </div>
          <Separator className="my-4" />
        </>
      )}

      {/* Service Count */}
      {data.services && data.services.length > 0 && (
        <>
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-1">Services</div>
            <div className="font-medium">{data.services.length} item(s)</div>
          </div>
          <Separator className="my-4" />
        </>
      )}

      {/* Totals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatINR(totals.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">{formatINR(totals.tax)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-medium text-red-600">-{formatINR(totals.discount)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total Billed</span>
          <span className="text-lg font-bold text-foreground">
            {formatINR(totals.total)}
          </span>
        </div>
      </div>

      {/* Documents Count */}
      {data.documents && data.documents.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="text-sm text-muted-foreground">
            {data.documents.length} document(s) uploaded
          </div>
        </>
      )}
    </Card>
  );
}
