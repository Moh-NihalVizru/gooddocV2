import { ClaimInvoicesList } from "@/components/insurance/ClaimInvoicesList";

interface ClaimStepServicesProps {
  data: any;
  onChange: (data: any) => void;
  errors: string[];
}

export function ClaimStepServices({ data, onChange, errors }: ClaimStepServicesProps) {
  return (
    <ClaimInvoicesList />
  );
}
