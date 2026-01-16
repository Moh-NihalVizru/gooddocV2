import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ClaimStepPaymentBankingProps {
  data: any;
  onChange: (data: any) => void;
  errors: string[];
}

export function ClaimStepPaymentBanking({ data, onChange, errors }: ClaimStepPaymentBankingProps) {
  const updateBankDetails = (field: string, value: any) => {
    onChange({
      ...data,
      bankDetails: {
        ...data.bankDetails,
        [field]: value
      }
    });
  };

  // Only show for reimbursement claims
  if (data.claimType !== "Reimbursement") {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          Bank details are not required for {data.claimType || "this"} claims
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Payment & Banking Details</h2>
      
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Please provide bank account details for reimbursement payment
        </p>

        <div>
          <Label htmlFor="accountHolder">Account Holder Name *</Label>
          <Input
            id="accountHolder"
            placeholder="As per bank records"
            className="mt-2"
            value={data.bankDetails?.accountHolder || ""}
            onChange={(e) => updateBankDetails("accountHolder", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="bank">Bank Name *</Label>
          <Input
            id="bank"
            placeholder="e.g., HDFC Bank"
            className="mt-2"
            value={data.bankDetails?.bank || ""}
            onChange={(e) => updateBankDetails("bank", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="accountNo">Account Number *</Label>
          <Input
            id="accountNo"
            placeholder="Enter account number"
            className="mt-2"
            value={data.bankDetails?.accountNo || ""}
            onChange={(e) => updateBankDetails("accountNo", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="ifsc">IFSC Code *</Label>
          <Input
            id="ifsc"
            placeholder="e.g., HDFC0001234"
            className="mt-2"
            value={data.bankDetails?.ifsc || ""}
            onChange={(e) => updateBankDetails("ifsc", e.target.value.toUpperCase())}
            maxLength={11}
          />
        </div>

        <div>
          <Label htmlFor="upi">UPI ID (Optional)</Label>
          <Input
            id="upi"
            placeholder="e.g., name@bankname"
            className="mt-2"
            value={data.bankDetails?.upi || ""}
            onChange={(e) => updateBankDetails("upi", e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
