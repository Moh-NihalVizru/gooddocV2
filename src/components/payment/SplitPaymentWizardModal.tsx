import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, CreditCard, Smartphone, AlertTriangle, ChevronRight, Banknote } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CardPaymentFlow } from './CardPaymentFlow';
import { UPIPaymentFlow } from './UPIPaymentFlow';
import { createPaymentIntent, trackPaymentEvent } from '@/services/paymentService';
import { formatINR } from '@/utils/currency';
import type { PaymentIntent, PaymentMethod, PaymentPurpose, PaymentAttempt } from '@/types/payment-intent';

export interface SplitPaymentStep {
  id: string;
  method: 'cash' | 'card' | 'upi';
  amount: number; // in paise
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  attempt?: PaymentAttempt;
}

interface SplitPaymentWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Patient/Context info
  patientId: string;
  patientName: string;
  mrn: string;
  // Payment info
  orderId: string;
  totalAmount: number; // in paise
  purpose: PaymentPurpose;
  // Split steps - only Card and UPI with amount > 0
  steps: SplitPaymentStep[];
  // Callbacks
  onComplete?: (steps: SplitPaymentStep[]) => void;
  onPartialComplete?: (steps: SplitPaymentStep[]) => void;
  onCancel?: () => void;
}

type WizardState = 'not_started' | 'in_progress' | 'completed' | 'partial';

export function SplitPaymentWizardModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  mrn,
  orderId,
  totalAmount,
  purpose,
  steps: initialSteps,
  onComplete,
  onPartialComplete,
  onCancel,
}: SplitPaymentWizardModalProps) {
  const [steps, setSteps] = useState<SplitPaymentStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>('not_started');
  const initRef = useRef(false);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const hasSucceededSteps = steps.some(s => s.status === 'succeeded');
  const allSucceeded = steps.every(s => s.status === 'succeeded');

  // Reset state when modal opens
  useEffect(() => {
    if (open && !initRef.current) {
      initRef.current = true;
      setSteps(initialSteps.map(s => ({ ...s, status: 'pending' })));
      setCurrentStepIndex(0);
      setWizardState('not_started');
      initializeIntent();
    }
    if (!open) {
      initRef.current = false;
      setIntent(null);
    }
  }, [open, initialSteps]);

  const initializeIntent = async () => {
    setIsLoading(true);
    try {
      const newIntent = await createPaymentIntent({
        orderId,
        patientId,
        patientName,
        mrn,
        amount: totalAmount,
        purpose,
        method: initialSteps[0]?.method || 'card',
      });
      setIntent(newIntent);
      setWizardState('in_progress');
      trackPaymentEvent('split_payment_wizard_opened', { 
        totalAmount, 
        stepsCount: initialSteps.length 
      });
    } catch (error) {
      console.error('Failed to create payment intent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepSuccess = useCallback((attempt: PaymentAttempt) => {
    setSteps(prev => prev.map((s, idx) => 
      idx === currentStepIndex 
        ? { ...s, status: 'succeeded', attempt }
        : s
    ));
    
    trackPaymentEvent('split_payment_step_succeeded', {
      stepIndex: currentStepIndex,
      method: currentStep.method,
      amount: currentStep.amount,
    });
  }, [currentStepIndex, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      // All done!
      setWizardState('completed');
      onComplete?.(steps.map((s, idx) => 
        idx === currentStepIndex ? { ...s, status: 'succeeded' } : s
      ));
      onOpenChange(false);
    } else {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
      // Create new intent for next step
      createIntentForStep(currentStepIndex + 1);
    }
  };

  const createIntentForStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return;
    
    setIsLoading(true);
    try {
      const newIntent = await createPaymentIntent({
        orderId: `${orderId}-${stepIndex + 1}`,
        patientId,
        patientName,
        mrn,
        amount: step.amount,
        purpose,
        method: step.method,
      });
      setIntent(newIntent);
    } catch (error) {
      console.error('Failed to create intent for step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasSucceededSteps) {
      setShowCancelConfirm(true);
    } else {
      closeModal(false);
    }
  };

  const closeModal = (partial: boolean) => {
    if (partial && hasSucceededSteps) {
      setWizardState('partial');
      onPartialComplete?.(steps);
    } else {
      onCancel?.();
    }
    trackPaymentEvent('split_payment_wizard_closed', { 
      state: partial ? 'partial' : 'cancelled',
      completedSteps: steps.filter(s => s.status === 'succeeded').length
    });
    onOpenChange(false);
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

  const isCurrentStepSucceeded = currentStep?.status === 'succeeded';

  return (
    <>
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent 
          className="max-w-lg p-0 gap-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleCancel();
          }}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-lg font-semibold">
              Process Payment — Split
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {getPurposeLabel(purpose)} • {formatINR(totalAmount)}
            </p>
          </DialogHeader>

          {/* Stepper */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isCompleted = step.status === 'succeeded';
                const isPending = step.status === 'pending' && idx > currentStepIndex;
                
                return (
                  <div key={step.id} className="flex items-center gap-2 flex-1">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg flex-1 border-2 transition-all",
                      isActive && !isCompleted && "border-primary bg-primary/5",
                      isCompleted && "border-green-500 bg-green-50",
                      isPending && "border-muted bg-muted/30 opacity-60"
                    )}>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        isActive && !isCompleted && "bg-primary text-primary-foreground",
                        isCompleted && "bg-green-500 text-white",
                        isPending && "bg-muted-foreground/30 text-muted-foreground"
                      )}>
                        {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {step.method === 'card' ? (
                            <CreditCard className="w-3.5 h-3.5" />
                          ) : step.method === 'upi' ? (
                            <Smartphone className="w-3.5 h-3.5" />
                          ) : (
                            <Banknote className="w-3.5 h-3.5" />
                          )}
                          <span className="text-xs font-medium capitalize">{step.method}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatINR(step.amount)}
                        </p>
                      </div>
                    </div>
                    {idx < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Context summary */}
          <div className="px-6 py-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">{patientName}</p>
                  <p className="text-xs text-muted-foreground">MRN: {mrn}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    Step {currentStepIndex + 1}: {formatINR(currentStep?.amount || 0)}
                  </p>
                  <Badge variant="outline" className="text-xs capitalize mt-1">
                    {currentStep?.method === 'card' ? 'Card' : currentStep?.method === 'upi' ? 'UPI' : 'Cash'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Flow Content */}
          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : intent && currentStep ? (
              <>
                {currentStep.method === 'card' ? (
                  <CardPaymentFlow
                    intent={{ ...intent, amount: currentStep.amount }}
                    onSuccess={handleStepSuccess}
                    onCancel={handleCancel}
                    onSwitchMethod={() => {}} // Disabled in wizard mode
                    hasNextPayment={!isLastStep && isCurrentStepSucceeded}
                    nextPaymentLabel={
                      !isLastStep && steps[currentStepIndex + 1]
                        ? `Next: ${steps[currentStepIndex + 1].method.toUpperCase()} ${formatINR(steps[currentStepIndex + 1].amount)}`
                        : undefined
                    }
                    onNextPayment={handleNext}
                  />
                ) : currentStep.method === 'upi' ? (
                  <UPIPaymentFlow
                    intent={{ ...intent, amount: currentStep.amount }}
                    onSuccess={handleStepSuccess}
                    onCancel={handleCancel}
                    onSwitchMethod={() => {}} // Disabled in wizard mode
                    hasNextPayment={!isLastStep && isCurrentStepSucceeded}
                    nextPaymentLabel={
                      !isLastStep && steps[currentStepIndex + 1]
                        ? `Next: ${steps[currentStepIndex + 1].method.toUpperCase()} ${formatINR(steps[currentStepIndex + 1].amount)}`
                        : undefined
                    }
                    onNextPayment={handleNext}
                  />
                ) : (
                  // Cash step - simple confirmation UI
                  <div className="space-y-6">
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Banknote className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Collect Cash</h3>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {formatINR(currentStep.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Collect cash from patient and confirm receipt
                      </p>
                    </div>
                    
                    {!isCurrentStepSucceeded && (
                      <Button 
                        onClick={() => {
                          const mockAttempt: PaymentAttempt = {
                            id: `cash_${Date.now()}`,
                            intentId: intent.id,
                            method: 'cash',
                            provider: 'pos',
                            status: 'succeeded',
                            startedAt: new Date().toISOString(),
                            completedAt: new Date().toISOString(),
                          };
                          handleStepSuccess(mockAttempt);
                        }}
                        className="w-full"
                        size="lg"
                      >
                        Confirm Cash Received
                      </Button>
                    )}
                    
                    {isCurrentStepSucceeded && (
                      <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Cash collected successfully</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}

            {/* Wizard footer buttons */}
            {isCurrentStepSucceeded && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleNext}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isLastStep ? (
                    <>
                      <Check className="w-4 h-4" />
                      Finish & Close
                    </>
                  ) : (
                    <>
                      Next: {steps[currentStepIndex + 1]?.method.toUpperCase()} Payment
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation for partial payment */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Payment Incomplete
            </AlertDialogTitle>
            <AlertDialogDescription>
              {steps.filter(s => s.status === 'succeeded').length} of {steps.length} payments completed. 
              Closing now will leave the remaining amount unpaid. You can collect it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Payment</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => closeModal(true)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Close (Partial Payment)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
