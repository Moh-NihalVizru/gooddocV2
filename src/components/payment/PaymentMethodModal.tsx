import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Smartphone, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CardPaymentFlow } from './CardPaymentFlow';
import { UPIPaymentFlow } from './UPIPaymentFlow';
import { createPaymentIntent, trackPaymentEvent } from '@/services/paymentService';
import { formatINR } from '@/utils/currency';
import type { PaymentIntent, PaymentMethod, PaymentPurpose, PaymentAttempt } from '@/types/payment-intent';

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Patient/Context info
  patientId: string;
  patientName: string;
  mrn: string;
  // Payment info
  orderId: string;
  amount: number; // in paise
  purpose: PaymentPurpose;
  // Optional: pre-selected method
  defaultMethod?: PaymentMethod;
  // Split payment flow - show "Next" button after success if true
  hasNextPayment?: boolean;
  nextPaymentLabel?: string; // e.g., "Next: UPI ₹2,000"
  // Callbacks
  onSuccess?: (attempt: PaymentAttempt) => void;
  onCancel?: () => void;
}

export function PaymentMethodModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  mrn,
  orderId,
  amount,
  purpose,
  defaultMethod,
  hasNextPayment,
  nextPaymentLabel,
  onSuccess,
  onCancel,
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(defaultMethod || 'card');
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync selected method with defaultMethod when modal opens
  useEffect(() => {
    if (open && defaultMethod) {
      setSelectedMethod(defaultMethod);
    }
  }, [open, defaultMethod]);

  // Create payment intent when modal opens
  useEffect(() => {
    if (open && !intent) {
      initializeIntent();
    }
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIntent(null);
      setIsProcessing(false);
    }
  }, [open]);

  const initializeIntent = async () => {
    setIsLoading(true);
    try {
      const newIntent = await createPaymentIntent({
        orderId,
        patientId,
        patientName,
        mrn,
        amount,
        purpose,
        method: selectedMethod,
      });
      setIntent(newIntent);
      trackPaymentEvent('payment_modal_opened', { method: selectedMethod, amount });
    } catch (error) {
      console.error('Failed to create payment intent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = (method: string) => {
    if (isProcessing) return;
    setSelectedMethod(method as PaymentMethod);
    trackPaymentEvent('switch_method_clicked', { from: selectedMethod, to: method });
  };

  const handleSuccess = useCallback((attempt: PaymentAttempt) => {
    setIsProcessing(false);
    onSuccess?.(attempt);
  }, [onSuccess]);

  const handleCancel = () => {
    if (isProcessing) {
      setShowCancelConfirm(true);
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    trackPaymentEvent('modal_closed', { method: selectedMethod, stage: isProcessing ? 'processing' : 'idle' });
    onCancel?.();
    onOpenChange(false);
  };

  const handleSwitchMethod = () => {
    setSelectedMethod(prev => prev === 'card' ? 'upi' : 'card');
    // Reset intent to create a new one with new method
    setIntent(null);
    initializeIntent();
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
  };

  const getPurposeLabel = (purpose: PaymentPurpose) => {
    switch (purpose) {
      case 'settlement': return 'Bill Settlement';
      case 'advance': return 'Advance Collection';
      case 'dues': return 'Dues Payment';
      case 'refund': return 'Refund';
      default: return 'Payment';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent 
          className="max-w-md p-0 gap-0"
          onInteractOutside={(e) => {
            if (isProcessing) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (isProcessing) {
              e.preventDefault();
              setShowCancelConfirm(true);
            }
          }}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg">
                {selectedMethod === 'card' ? (
                  <CreditCard className="w-5 h-5 text-primary" />
                ) : (
                  <Smartphone className="w-5 h-5 text-primary" />
                )}
                {selectedMethod === 'card' ? 'Card Payment' : 'UPI Payment'}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Context summary */}
          <div className="px-6 pb-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">{patientName}</p>
                  <p className="text-xs text-muted-foreground">MRN: {mrn}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{formatINR(amount)}</p>
                  <p className="text-xs text-muted-foreground">{getPurposeLabel(purpose)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Order: <span className="font-mono">{orderId}</span>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment method tabs */}
          <div className="px-6 py-4">
            <Tabs value={selectedMethod} onValueChange={handleMethodChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card" disabled={isProcessing} className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="upi" disabled={isProcessing} className="gap-2">
                  <Smartphone className="w-4 h-4" />
                  UPI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="mt-4">
                {intent && (
                  <CardPaymentFlow
                    intent={intent}
                    onSuccess={handleSuccess}
                    onCancel={closeModal}
                    onSwitchMethod={handleSwitchMethod}
                    hasNextPayment={hasNextPayment}
                    nextPaymentLabel={nextPaymentLabel}
                    onNextPayment={() => onSuccess?.(intent.attempts?.[0] || { id: '', intentId: intent.id, method: 'card', provider: 'pos', status: 'succeeded', startedAt: new Date().toISOString() } as PaymentAttempt)}
                  />
                )}
              </TabsContent>

              <TabsContent value="upi" className="mt-4">
                {intent && (
                  <UPIPaymentFlow
                    intent={intent}
                    onSuccess={handleSuccess}
                    onCancel={closeModal}
                    onSwitchMethod={handleSwitchMethod}
                    hasNextPayment={hasNextPayment}
                    nextPaymentLabel={nextPaymentLabel}
                    onNextPayment={() => onSuccess?.(intent.attempts?.[0] || { id: '', intentId: intent.id, method: 'upi', provider: 'upi_generic', status: 'succeeded', startedAt: new Date().toISOString() } as PaymentAttempt)}
                  />
                )}
              </TabsContent>
            </Tabs>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Cancel Payment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A payment is currently in progress. Are you sure you want to cancel? 
              This may result in an incomplete transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Payment</AlertDialogCancel>
            <AlertDialogAction onClick={closeModal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
