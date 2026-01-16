import { useEffect, useCallback, useRef } from 'react';
import { Wifi, WifiOff, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePaymentStateMachine } from '@/hooks/usePaymentStateMachine';
import { PaymentProcessingIndicator } from './PaymentProcessingIndicator';
import { PaymentStatusView } from './PaymentStatusView';
import { ReceiptView } from './ReceiptView';
import { NumericTimer } from './NumericTimer';
import {
  connectPOS,
  createPaymentAttempt,
  processCardPayment,
  trackPaymentEvent,
} from '@/services/paymentService';
import { TIMEOUTS, ERROR_MESSAGES } from '@/types/payment-intent';
import type { PaymentIntent, PaymentAttempt } from '@/types/payment-intent';
import { formatINR } from '@/utils/currency';

interface CardPaymentFlowProps {
  intent: PaymentIntent;
  onSuccess: (attempt: PaymentAttempt) => void;
  onCancel: () => void;
  onSwitchMethod: () => void;
  hasNextPayment?: boolean;
  nextPaymentLabel?: string;
  onNextPayment?: () => void;
  className?: string;
}

export function CardPaymentFlow({
  intent,
  onSuccess,
  onCancel,
  onSwitchMethod,
  hasNextPayment,
  nextPaymentLabel,
  onNextPayment,
  className,
}: CardPaymentFlowProps) {
  const processingRef = useRef(false);
  
  const { state, actions, isProcessing, canRetry } = usePaymentStateMachine({
    onSuccess: (attempt) => {
      trackPaymentEvent('payment_attempt_succeeded', {
        intentId: intent.id,
        method: 'card',
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

  // Initialize POS connection
  const initializePOS = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    actions.start('card');
    trackPaymentEvent('payment_attempt_started', { intentId: intent.id, method: 'card' });

    try {
      // Create attempt record
      await createPaymentAttempt(intent.id, 'card', 'pos');
      
      // Connect to POS device
      const { connected } = await connectPOS();
      
      if (connected) {
        actions.sdkReady();
        actions.startTimeout(TIMEOUTS.CARD_READING);
      } else {
        actions.paymentFailed('pos_disconnected', ERROR_MESSAGES.pos_disconnected);
      }
    } catch (error) {
      actions.paymentFailed('network_error', ERROR_MESSAGES.network_error);
    } finally {
      processingRef.current = false;
    }
  }, [intent.id, actions]);

  // Start on mount
  useEffect(() => {
    if (state.flowState === 'idle') {
      initializePOS();
    }
  }, [state.flowState, initializePOS]);

  // Simulate card detection (in real app, this comes from POS SDK callbacks)
  const handleCardDetection = async (cardType: 'tap' | 'insert' | 'swipe') => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    actions.cardDetected(cardType);
    actions.clearTimers();
    
    // Simulate processing
    setTimeout(() => {
      actions.processingStarted();
    }, 500);

    try {
      const attempt = await processCardPayment(intent.id, cardType);
      
      if (attempt.status === 'succeeded') {
        actions.paymentSuccess(attempt);
      } else {
        actions.paymentFailed(
          attempt.failureCode || 'bank_declined',
          ERROR_MESSAGES[attempt.failureCode || 'bank_declined'] || attempt.failureMessage || 'Payment failed'
        );
      }
    } catch (error) {
      actions.paymentFailed('network_error', ERROR_MESSAGES.network_error);
    } finally {
      processingRef.current = false;
    }
  };

  const handleRetry = () => {
    processingRef.current = false;
    actions.retry();
    initializePOS();
  };

  const handleCancel = () => {
    actions.cancel();
    onCancel();
  };

  const handleTimeout = () => {
    actions.timeout();
    trackPaymentEvent('payment_attempt_timed_out', { intentId: intent.id, stage: state.flowState });
  };

  // Render based on state
  const renderContent = () => {
    switch (state.flowState) {
      case 'idle':
      case 'initializing':
        return (
          <PaymentProcessingIndicator stepText={state.stepText || 'Connecting to card reader…'} />
        );

      case 'awaiting_input':
        return (
          <div className="flex flex-col items-center py-6 gap-6">
            {/* Device status */}
            <div className="flex items-center gap-2">
              <Badge variant={state.deviceConnected ? 'default' : 'destructive'} className="gap-1.5">
                {state.deviceConnected ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {state.deviceConnected ? 'Reader Connected' : 'Reader Disconnected'}
              </Badge>
            </div>

            {/* Amount display */}
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{formatINR(intent.amount)}</p>
              <p className="text-sm text-muted-foreground mt-1">GoodDoc Hospital</p>
            </div>

            {/* Card action buttons */}
            <div className="w-full space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Tap, insert, or swipe your card
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCardDetection('tap')}
                  disabled={!state.deviceConnected}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-xs">Tap</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCardDetection('insert')}
                  disabled={!state.deviceConnected}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs">Insert</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCardDetection('swipe')}
                  disabled={!state.deviceConnected}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <CreditCard className="w-6 h-6 rotate-90" />
                  <span className="text-xs">Swipe</span>
                </Button>
              </div>
            </div>

            {/* Timer */}
            <NumericTimer
              durationSeconds={TIMEOUTS.CARD_READING / 1000}
              onExpire={handleTimeout}
              size="sm"
            />
          </div>
        );

      case 'processing':
        return (
          <div className="py-6">
            <PaymentProcessingIndicator stepText={state.stepText} />
            
            {state.cardDetectionType && (
              <div className="mt-4 text-center">
                <Badge variant="outline" className="capitalize">
                  {state.cardDetectionType} detected
                </Badge>
              </div>
            )}
          </div>
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
                  Retry
                </Button>
              )}
              <Button variant="outline" onClick={onSwitchMethod} className="flex-1">
                Switch to UPI
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
