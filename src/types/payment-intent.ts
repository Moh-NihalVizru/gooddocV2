// Payment Intent Types - Good Doc Payment System
// These types model the complete payment flow for Card and UPI payments

export type PaymentMethod = 'cash' | 'card' | 'upi';
export type PaymentPurpose = 'settlement' | 'advance' | 'dues' | 'refund';

export type PaymentIntentStatus = 
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'timed_out'
  | 'cancelled';

export type PaymentAttemptStatus = 
  | 'initiated'
  | 'awaiting_input'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'timed_out'
  | 'cancelled';

export type PaymentProvider = 'pos' | 'upi_razorpay' | 'upi_phonepe' | 'upi_generic';

// Card-specific metadata
export interface CardMetadata {
  deviceId?: string;
  last4?: string;
  cardBrand?: 'visa' | 'mastercard' | 'rupay' | 'amex' | 'unknown';
  authCode?: string;
  arn?: string;
  rrn?: string;
}

// UPI-specific metadata
export interface UPIMetadata {
  payerVpa?: string;
  utr?: string;
  rrn?: string;
  npciTxnId?: string;
}

export interface PaymentAttempt {
  id: string;
  intentId: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  providerTxnId?: string;
  status: PaymentAttemptStatus;
  failureCode?: string;
  failureMessage?: string;
  startedAt: string;
  completedAt?: string;
  metadata?: CardMetadata | UPIMetadata;
}

export interface PaymentIntent {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  amount: number; // in paise (INR)
  currency: 'INR';
  purpose: PaymentPurpose;
  method?: PaymentMethod;
  status: PaymentIntentStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  attempts: PaymentAttempt[];
  // UPI-specific fields
  qrPayload?: string;
  deepLink?: string;
  pollingToken?: string;
}

// State machine states
export type PaymentFlowState = 
  | 'idle'
  | 'initializing'
  | 'awaiting_input'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'timed_out'
  | 'cancelled';

// Events that can trigger state transitions
export type PaymentEvent = 
  | { type: 'START'; payload: { method: PaymentMethod } }
  | { type: 'SDK_READY' }
  | { type: 'QR_GENERATED'; payload: { qrPayload: string; deepLink: string } }
  | { type: 'CARD_DETECTED'; payload: { cardType: 'tap' | 'insert' | 'swipe' } }
  | { type: 'UPI_SCAN_STARTED' }
  | { type: 'PROCESSING_STARTED' }
  | { type: 'PAYMENT_SUCCESS'; payload: { attempt: PaymentAttempt } }
  | { type: 'PAYMENT_FAILED'; payload: { code: string; message: string } }
  | { type: 'TIMEOUT' }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }
  | { type: 'DEVICE_DISCONNECTED' }
  | { type: 'DEVICE_RECONNECTED' };

// POS SDK Events
export type POSEvent = 
  | 'onDeviceConnected'
  | 'onDeviceDisconnected'
  | 'onCardDetected'
  | 'onPinEntryRequired'
  | 'onProcessing'
  | 'onApproved'
  | 'onDeclined'
  | 'onError'
  | 'onTimeout';

// Error code mappings
export const ERROR_MESSAGES: Record<string, string> = {
  network_error: 'Network issue. Check connection and retry.',
  card_removed: 'Card removed too early. Please try again.',
  pos_disconnected: 'Reader disconnected. Reconnect to continue.',
  bank_declined: 'Declined by bank. Try another card or method.',
  insufficient_funds: 'Insufficient funds. Try another payment method.',
  invalid_card: 'Invalid card. Please try another card.',
  expired_card: 'Card has expired. Please use a valid card.',
  payer_cancelled: 'Payment was cancelled by the payer.',
  upi_timeout: 'UPI payment timed out. Please try again.',
  gateway_error: 'Payment gateway error. Please try again.',
  qr_expired: 'QR code has expired. Generate a new one.',
};

// Timeout configurations (in milliseconds)
export const TIMEOUTS = {
  CARD_READING: 45000,
  CARD_PROCESSING: 60000,
  UPI_QR_VALIDITY: 180000, // 3 minutes
  UPI_POLLING_INTERVAL: 4000,
  UPI_OVERALL: 300000, // 5 minutes
} as const;

// UPI deep link app configs
export const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', packageName: 'com.google.android.apps.nbu.paisa.user', scheme: 'gpay' },
  { id: 'phonepe', name: 'PhonePe', packageName: 'com.phonepe.app', scheme: 'phonepe' },
  { id: 'paytm', name: 'Paytm', packageName: 'net.one97.paytm', scheme: 'paytm' },
  { id: 'bhim', name: 'BHIM', packageName: 'in.org.npci.upiapp', scheme: 'upi' },
] as const;
