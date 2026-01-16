import { useReducer, useCallback, useRef, useEffect } from 'react';
import type {
  PaymentFlowState,
  PaymentEvent,
  PaymentMethod,
  PaymentIntent,
  PaymentAttempt,
  TIMEOUTS,
} from '@/types/payment-intent';

interface PaymentState {
  flowState: PaymentFlowState;
  method: PaymentMethod | null;
  intent: PaymentIntent | null;
  currentAttempt: PaymentAttempt | null;
  error: { code: string; message: string } | null;
  stepText: string;
  cardDetectionType: 'tap' | 'insert' | 'swipe' | null;
  deviceConnected: boolean;
  qrPayload: string | null;
  deepLink: string | null;
  timeoutId: number | null;
}

const initialState: PaymentState = {
  flowState: 'idle',
  method: null,
  intent: null,
  currentAttempt: null,
  error: null,
  stepText: '',
  cardDetectionType: null,
  deviceConnected: false,
  qrPayload: null,
  deepLink: null,
  timeoutId: null,
};

function paymentReducer(state: PaymentState, event: PaymentEvent): PaymentState {
  switch (event.type) {
    case 'START':
      return {
        ...state,
        flowState: 'initializing',
        method: event.payload.method,
        error: null,
        stepText: event.payload.method === 'card' 
          ? 'Connecting to card reader…' 
          : 'Generating QR code…',
      };

    case 'SDK_READY':
      return {
        ...state,
        flowState: 'awaiting_input',
        deviceConnected: true,
        stepText: 'Tap, insert, or swipe your card',
      };

    case 'QR_GENERATED':
      return {
        ...state,
        flowState: 'awaiting_input',
        qrPayload: event.payload.qrPayload,
        deepLink: event.payload.deepLink,
        stepText: 'Scan QR with any UPI app',
      };

    case 'CARD_DETECTED':
      return {
        ...state,
        flowState: 'processing',
        cardDetectionType: event.payload.cardType,
        stepText: 'Reading card…',
      };

    case 'UPI_SCAN_STARTED':
      return {
        ...state,
        flowState: 'processing',
        stepText: 'Payment initiated… waiting for confirmation',
      };

    case 'PROCESSING_STARTED':
      return {
        ...state,
        stepText: state.method === 'card' 
          ? 'Requesting bank authorization…' 
          : 'Waiting for bank confirmation…',
      };

    case 'PAYMENT_SUCCESS':
      return {
        ...state,
        flowState: 'succeeded',
        currentAttempt: event.payload.attempt,
        stepText: 'Payment successful!',
        error: null,
      };

    case 'PAYMENT_FAILED':
      return {
        ...state,
        flowState: 'failed',
        error: { code: event.payload.code, message: event.payload.message },
        stepText: 'Payment failed',
      };

    case 'TIMEOUT':
      return {
        ...state,
        flowState: 'timed_out',
        stepText: state.method === 'card' 
          ? 'No activity detected. The attempt timed out.' 
          : 'This QR has expired.',
        error: { code: 'timeout', message: 'Payment timed out' },
      };

    case 'CANCEL':
      return {
        ...state,
        flowState: 'cancelled',
        stepText: 'Payment cancelled',
      };

    case 'RETRY':
      return {
        ...state,
        flowState: 'initializing',
        error: null,
        currentAttempt: null,
        stepText: state.method === 'card' 
          ? 'Connecting to card reader…' 
          : 'Generating QR code…',
      };

    case 'DEVICE_DISCONNECTED':
      return {
        ...state,
        deviceConnected: false,
        flowState: 'failed',
        error: { code: 'pos_disconnected', message: 'Reader disconnected. Reconnect to continue.' },
        stepText: 'Card reader disconnected',
      };

    case 'DEVICE_RECONNECTED':
      return {
        ...state,
        deviceConnected: true,
        flowState: 'awaiting_input',
        error: null,
        stepText: 'Tap, insert, or swipe your card',
      };

    default:
      return state;
  }
}

interface UsePaymentStateMachineOptions {
  onSuccess?: (attempt: PaymentAttempt) => void;
  onFailed?: (error: { code: string; message: string }) => void;
  onTimeout?: () => void;
  onCancelled?: () => void;
}

export function usePaymentStateMachine(options: UsePaymentStateMachineOptions = {}) {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const timeoutRef = useRef<number | null>(null);
  const pollingRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Handle state-based callbacks
  useEffect(() => {
    if (state.flowState === 'succeeded' && state.currentAttempt) {
      options.onSuccess?.(state.currentAttempt);
    } else if (state.flowState === 'failed' && state.error) {
      options.onFailed?.(state.error);
    } else if (state.flowState === 'timed_out') {
      options.onTimeout?.();
    } else if (state.flowState === 'cancelled') {
      options.onCancelled?.();
    }
  }, [state.flowState, state.currentAttempt, state.error, options]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startTimeout = useCallback((duration: number) => {
    clearTimers();
    timeoutRef.current = window.setTimeout(() => {
      dispatch({ type: 'TIMEOUT' });
    }, duration);
  }, [clearTimers]);

  const start = useCallback((method: PaymentMethod) => {
    clearTimers();
    dispatch({ type: 'START', payload: { method } });
  }, [clearTimers]);

  const sdkReady = useCallback(() => {
    dispatch({ type: 'SDK_READY' });
  }, []);

  const qrGenerated = useCallback((qrPayload: string, deepLink: string) => {
    dispatch({ type: 'QR_GENERATED', payload: { qrPayload, deepLink } });
  }, []);

  const cardDetected = useCallback((cardType: 'tap' | 'insert' | 'swipe') => {
    dispatch({ type: 'CARD_DETECTED', payload: { cardType } });
  }, []);

  const upiScanStarted = useCallback(() => {
    dispatch({ type: 'UPI_SCAN_STARTED' });
  }, []);

  const processingStarted = useCallback(() => {
    dispatch({ type: 'PROCESSING_STARTED' });
  }, []);

  const paymentSuccess = useCallback((attempt: PaymentAttempt) => {
    clearTimers();
    dispatch({ type: 'PAYMENT_SUCCESS', payload: { attempt } });
  }, [clearTimers]);

  const paymentFailed = useCallback((code: string, message: string) => {
    clearTimers();
    dispatch({ type: 'PAYMENT_FAILED', payload: { code, message } });
  }, [clearTimers]);

  const timeout = useCallback(() => {
    clearTimers();
    dispatch({ type: 'TIMEOUT' });
  }, [clearTimers]);

  const cancel = useCallback(() => {
    clearTimers();
    dispatch({ type: 'CANCEL' });
  }, [clearTimers]);

  const retry = useCallback(() => {
    clearTimers();
    dispatch({ type: 'RETRY' });
  }, [clearTimers]);

  const deviceDisconnected = useCallback(() => {
    dispatch({ type: 'DEVICE_DISCONNECTED' });
  }, []);

  const deviceReconnected = useCallback(() => {
    dispatch({ type: 'DEVICE_RECONNECTED' });
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: 'CANCEL' }); // Reset to initial-like state
  }, [clearTimers]);

  return {
    state,
    actions: {
      start,
      sdkReady,
      qrGenerated,
      cardDetected,
      upiScanStarted,
      processingStarted,
      paymentSuccess,
      paymentFailed,
      timeout,
      cancel,
      retry,
      deviceDisconnected,
      deviceReconnected,
      reset,
      startTimeout,
      clearTimers,
    },
    // Convenience computed values
    isProcessing: state.flowState === 'processing' || state.flowState === 'initializing',
    isCompleted: state.flowState === 'succeeded' || state.flowState === 'failed' || state.flowState === 'timed_out' || state.flowState === 'cancelled',
    canRetry: state.flowState === 'failed' || state.flowState === 'timed_out',
    canCancel: state.flowState !== 'succeeded' && state.flowState !== 'cancelled',
  };
}
