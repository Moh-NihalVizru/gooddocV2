import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentFlowState, PaymentAttempt, CardMetadata, UPIMetadata } from '@/types/payment-intent';
import { formatINR } from '@/utils/currency';

interface PaymentStatusViewProps {
  status: PaymentFlowState;
  amount: number;
  attempt?: PaymentAttempt | null;
  errorMessage?: string;
  className?: string;
}

export function PaymentStatusView({
  status,
  amount,
  attempt,
  errorMessage,
  className,
}: PaymentStatusViewProps) {
  const isCard = attempt?.method === 'card';
  const cardMeta = attempt?.metadata as CardMetadata | undefined;
  const upiMeta = attempt?.metadata as UPIMetadata | undefined;

  if (status === 'succeeded') {
    return (
      <div className={cn('flex flex-col items-center py-6 gap-4', className)}>
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Payment Successful!</h3>
          <p className="text-2xl font-bold text-emerald-600">{formatINR(amount)}</p>
        </div>
        
        {/* Transaction details */}
        <div className="w-full mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
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
              {cardMeta.rrn && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RRN</span>
                  <span className="font-mono">{cardMeta.rrn}</span>
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
                  <span className="font-mono">{upiMeta.utr}</span>
                </div>
              )}
              {upiMeta.rrn && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RRN</span>
                  <span className="font-mono">{upiMeta.rrn}</span>
                </div>
              )}
            </>
          )}
          
          {attempt?.completedAt && (
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Time</span>
              <span>{new Date(attempt.completedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={cn('flex flex-col items-center py-6 gap-4', className)}>
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Payment Failed</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {errorMessage || 'Something went wrong. Please try again.'}
          </p>
        </div>
        
        {attempt?.failureCode && (
          <div className="w-full mt-2 p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-700 text-center">
              Error code: {attempt.failureCode}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (status === 'timed_out') {
    return (
      <div className={cn('flex flex-col items-center py-6 gap-4', className)}>
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Payment Timed Out</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {errorMessage || 'No activity detected. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className={cn('flex flex-col items-center py-6 gap-4', className)}>
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Payment Cancelled</h3>
          <p className="text-sm text-muted-foreground">
            This payment was cancelled.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
