import { useEffect, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePaymentStateMachine } from '@/hooks/usePaymentStateMachine';
import { PaymentProcessingIndicator } from './PaymentProcessingIndicator';
import { PaymentStatusView } from './PaymentStatusView';
import { ReceiptView } from './ReceiptView';
import { QRCodeView } from './QRCodeView';
import { NumericTimer } from './NumericTimer';
import {
  createPaymentAttempt,
  generateUPIPayload,
  pollUPIStatus,
  trackPaymentEvent,
  resetPollCount,
} from '@/services/paymentService';
import { TIMEOUTS, ERROR_MESSAGES } from '@/types/payment-intent';
import type { PaymentIntent, PaymentAttempt } from '@/types/payment-intent';

interface UPIPaymentFlowProps {
  intent: PaymentIntent;
  onSuccess: (attempt: PaymentAttempt) => void;
  onCancel: () => void;
  onSwitchMethod: () => void;
  hasNextPayment?: boolean;
  nextPaymentLabel?: string;
  onNextPayment?: () => void;
  className?: string;
}

export function UPIPaymentFlow({
  intent,
  onSuccess,
  onCancel,
  onSwitchMethod,
  hasNextPayment,
  nextPaymentLabel,
  onNextPayment,
  className,
}: UPIPaymentFlowProps) {
  const processingRef = useRef(false);
  const pollingRef = useRef<number | null>(null);
  
  const { state, actions, canRetry } = usePaymentStateMachine({
    onSuccess: (attempt) => {
      trackPaymentEvent('payment_attempt_succeeded', {
        intentId: intent.id,
        method: 'upi',
        duration_ms: Date.now() - new Date(attempt.startedAt).getTime(),
      });
      onSuccess(attempt);
    },
    onFailed: (error) => {
      trackPaymentEvent('payment_attempt_failed', {
        intentId: intent.id,
        failure_code: error.code,
      });
    },
  });

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Start UPI flow
  const initializeUPI = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    actions.start('upi');
    resetPollCount(); // Reset for demo
    trackPaymentEvent('payment_attempt_started', { intentId: intent.id, method: 'upi' });

    try {
      // Create attempt record
      await createPaymentAttempt(intent.id, 'upi', 'upi_generic');
      
      // Generate QR payload
      const { qrPayload, deepLink } = await generateUPIPayload(intent.id);
      
      actions.qrGenerated(qrPayload, deepLink);
      
      // Start polling for payment status
      pollingRef.current = window.setInterval(async () => {
        try {
          const result = await pollUPIStatus(intent.id);
          
          if (result.status === 'success' && result.attempt) {
            stopPolling();
            actions.paymentSuccess(result.attempt);
          } else if (result.status === 'failed') {
            stopPolling();
            actions.paymentFailed('payer_cancelled', ERROR_MESSAGES.payer_cancelled);
          }
          // status === 'pending' -> continue polling
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, TIMEOUTS.UPI_POLLING_INTERVAL);
      
    } catch (error) {
      actions.paymentFailed('network_error', ERROR_MESSAGES.network_error);
    } finally {
      processingRef.current = false;
    }
  }, [intent.id, actions, stopPolling]);

  // Start on mount
  useEffect(() => {
    if (state.flowState === 'idle') {
      initializeUPI();
    }
    
    return () => {
      stopPolling();
    };
  }, [state.flowState, initializeUPI, stopPolling]);

  const handleRetry = () => {
    processingRef.current = false;
    stopPolling();
    actions.retry();
    initializeUPI();
  };

  const handleCancel = () => {
    stopPolling();
    actions.cancel();
    onCancel();
  };

  const handleTimeout = () => {
    stopPolling();
    actions.timeout();
    trackPaymentEvent('payment_attempt_timed_out', { intentId: intent.id, stage: state.flowState });
  };

  const handleRefreshStatus = async () => {
    try {
      const result = await pollUPIStatus(intent.id);
      if (result.status === 'success' && result.attempt) {
        stopPolling();
        actions.paymentSuccess(result.attempt);
      }
    } catch (error) {
      console.error('Manual refresh error:', error);
    }
  };

  // Render based on state
  const renderContent = () => {
    switch (state.flowState) {
      case 'idle':
      case 'initializing':
        return (
          <PaymentProcessingIndicator stepText={state.stepText || 'Generating QR code…'} />
        );

      case 'awaiting_input':
        return (
          <div className="flex flex-col items-center py-4 gap-4">
            {/* QR Code */}
            <QRCodeView
              qrPayload={state.qrPayload!}
              amount={intent.amount}
              payeeName="GoodDoc Hospital"
            />

            {/* Timer */}
            <div className="w-full max-w-xs">
              <p className="text-xs text-center text-muted-foreground mb-2">
                QR expires in:
              </p>
              <NumericTimer
                durationSeconds={TIMEOUTS.UPI_QR_VALIDITY / 1000}
                onExpire={handleTimeout}
                size="md"
              />
            </div>

            {/* Refresh status button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshStatus}
              className="gap-2 text-muted-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </Button>
          </div>
        );

      case 'processing':
        return (
          <PaymentProcessingIndicator stepText={state.stepText} />
        );

      case 'succeeded':
        return (
          <div className="space-y-4">
            <ReceiptView
              patientName={intent.patientName}
              mrn={intent.mrn}
              amount={intent.amount}
              orderId={intent.orderId}
              attempt={state.currentAttempt!}
              onDownload={() => console.log('Download receipt')}
              onPrint={() => window.print()}
              onEmail={() => console.log('Email receipt')}
              onSMS={() => console.log('SMS receipt')}
              onDone={hasNextPayment ? undefined : onCancel}
            />
            {hasNextPayment && onNextPayment && (
              <Button onClick={onNextPayment} className="w-full gap-2">
                {nextPaymentLabel || 'Next Payment'}
                <span className="text-xs opacity-70">→</span>
              </Button>
            )}
          </div>
        );

      case 'failed':
      case 'timed_out':
      case 'cancelled':
        return (
          <div className="py-4">
            <PaymentStatusView
              status={state.flowState}
              amount={intent.amount}
              attempt={state.currentAttempt}
              errorMessage={state.error?.message}
            />
            
            <div className="flex gap-3 mt-6">
              {canRetry && (
                <Button onClick={handleRetry} className="flex-1">
                  {state.flowState === 'timed_out' ? 'Generate New QR' : 'Retry'}
                </Button>
              )}
              <Button variant="outline" onClick={onSwitchMethod} className="flex-1">
                Switch to Card
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {renderContent()}
      
      {/* Cancel button - only show when not completed */}
      {state.flowState !== 'succeeded' && state.flowState !== 'cancelled' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={state.flowState === 'processing'}
          className="mt-4 text-muted-foreground"
        >
          Cancel Payment
        </Button>
      )}
    </div>
  );
}
