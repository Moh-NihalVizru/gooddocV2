import { Download, Printer, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatINR } from '@/utils/currency';
import type { PaymentAttempt, CardMetadata, UPIMetadata } from '@/types/payment-intent';

interface ReceiptViewProps {
  patientName: string;
  mrn: string;
  amount: number;
  orderId: string;
  attempt: PaymentAttempt;
  className?: string;
  onDownload?: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
  onSMS?: () => void;
  onDone?: () => void;
}

export function ReceiptView({
  patientName,
  mrn,
  amount,
  orderId,
  attempt,
  className,
  onDownload,
  onPrint,
  onEmail,
  onSMS,
  onDone,
}: ReceiptViewProps) {
  const isCard = attempt.method === 'card';
  const cardMeta = attempt.metadata as CardMetadata | undefined;
  const upiMeta = attempt.metadata as UPIMetadata | undefined;
  const completedDate = attempt.completedAt ? new Date(attempt.completedAt) : new Date();

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Success header */}
      <div className="flex flex-col items-center py-4 gap-2">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Payment Successful</h3>
      </div>

      {/* Receipt card */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        {/* Amount */}
        <div className="text-center pb-3 border-b border-border">
          <p className="text-3xl font-bold text-foreground">{formatINR(amount)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {completedDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })} at {completedDate.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patient</span>
            <span className="font-medium">{patientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">MRN</span>
            <span className="font-mono">{mrn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono text-xs">{orderId}</span>
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium capitalize">{attempt.method}</span>
          </div>
          
          {isCard && cardMeta && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Card</span>
                <span className="font-medium capitalize">{cardMeta.cardBrand} •••• {cardMeta.last4}</span>
              </div>
              {cardMeta.authCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auth Code</span>
                  <span className="font-mono">{cardMeta.authCode}</span>
                </div>
              )}
            </>
          )}
          
          {!isCard && upiMeta && (
            <>
              {upiMeta.payerVpa && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payer VPA</span>
                  <span className="font-medium">{upiMeta.payerVpa}</span>
                </div>
              )}
              {upiMeta.utr && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTR</span>
                  <span className="font-mono text-xs">{upiMeta.utr}</span>
                </div>
              )}
            </>
          )}
          
          {(cardMeta?.rrn || upiMeta?.rrn) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">RRN</span>
              <span className="font-mono text-xs">{cardMeta?.rrn || upiMeta?.rrn}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs">Download</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Printer className="w-4 h-4" />
          <span className="text-xs">Print</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEmail}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Mail className="w-4 h-4" />
          <span className="text-xs">Email</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSMS}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs">SMS</span>
        </Button>
      </div>

      {/* Done button */}
      <Button onClick={onDone} className="w-full mt-4">
        Done
      </Button>
    </div>
  );
}
