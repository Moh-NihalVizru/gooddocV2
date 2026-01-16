// Payment Service - Mock implementation for Good Doc
// This service provides mock APIs for payment processing
// In production, replace with actual API calls

import type {
  PaymentIntent,
  PaymentAttempt,
  PaymentMethod,
  PaymentPurpose,
  PaymentProvider,
  CardMetadata,
  UPIMetadata,
} from '@/types/payment-intent';

const MOCK_VPA = 'gooddoc@ybl';
const MOCK_MERCHANT_NAME = 'GoodDoc Hospital';

// Helper to generate IDs
const generateId = (prefix: string) => 
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// In-memory storage for intents (simulates server state)
const intentStore = new Map<string, PaymentIntent>();

interface CreateIntentParams {
  orderId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  amount: number;
  purpose: PaymentPurpose;
  method?: PaymentMethod;
}

// Create a new payment intent
export async function createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntent> {
  await simulateNetworkDelay(300);

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  const intent: PaymentIntent = {
    id: generateId('pi'),
    orderId: params.orderId,
    patientId: params.patientId,
    patientName: params.patientName,
    mrn: params.mrn,
    amount: params.amount,
    currency: 'INR',
    purpose: params.purpose,
    method: params.method,
    status: 'requires_action',
    createdAt: now,
    updatedAt: now,
    expiresAt,
    attempts: [],
  };

  intentStore.set(intent.id, intent);
  return intent;
}

// Create a payment attempt
export async function createPaymentAttempt(
  intentId: string,
  method: PaymentMethod,
  provider: PaymentProvider
): Promise<PaymentAttempt> {
  await simulateNetworkDelay(200);

  const intent = intentStore.get(intentId);
  if (!intent) throw new Error('Intent not found');

  const attempt: PaymentAttempt = {
    id: generateId('pa'),
    intentId,
    method,
    provider,
    status: 'initiated',
    startedAt: new Date().toISOString(),
  };

  intent.attempts.push(attempt);
  intent.updatedAt = new Date().toISOString();

  return attempt;
}

// Generate UPI QR payload
export async function generateUPIPayload(intentId: string): Promise<{
  qrPayload: string;
  deepLink: string;
  expiresAt: string;
}> {
  await simulateNetworkDelay(400);

  const intent = intentStore.get(intentId);
  if (!intent) throw new Error('Intent not found');

  const amountInRupees = (intent.amount / 100).toFixed(2);
  const note = `Payment for ${intent.purpose} - ${intent.orderId}`;
  
  // UPI URI format
  const upiParams = new URLSearchParams({
    pa: MOCK_VPA,
    pn: MOCK_MERCHANT_NAME,
    am: amountInRupees,
    cu: 'INR',
    tn: note,
    tr: intent.orderId,
  });

  const qrPayload = `upi://pay?${upiParams.toString()}`;
  const deepLink = qrPayload;
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString(); // 3 minutes

  // Update intent with QR data
  intent.qrPayload = qrPayload;
  intent.deepLink = deepLink;
  intent.pollingToken = generateId('poll');
  intent.updatedAt = new Date().toISOString();

  return { qrPayload, deepLink, expiresAt };
}

// Poll UPI status (mock - returns success after a few polls)
let pollCount = 0;
export async function pollUPIStatus(intentId: string): Promise<{
  status: 'pending' | 'success' | 'failed';
  attempt?: PaymentAttempt;
}> {
  await simulateNetworkDelay(500);
  
  pollCount++;
  
  // Simulate success after 3 polls (for demo)
  if (pollCount >= 3) {
    pollCount = 0;
    
    const intent = intentStore.get(intentId);
    if (!intent) throw new Error('Intent not found');
    
    const attempt = intent.attempts[intent.attempts.length - 1];
    if (attempt) {
      attempt.status = 'succeeded';
      attempt.completedAt = new Date().toISOString();
      attempt.providerTxnId = generateId('upi_txn');
      attempt.metadata = {
        payerVpa: 'user@okaxis',
        utr: `UTR${Date.now()}`,
        rrn: `RRN${Math.floor(Math.random() * 1000000000)}`,
      } as UPIMetadata;
      
      intent.status = 'succeeded';
      intent.updatedAt = new Date().toISOString();
    }
    
    return { status: 'success', attempt };
  }
  
  return { status: 'pending' };
}

// Simulate POS connection
export async function connectPOS(): Promise<{ connected: boolean; deviceId: string }> {
  await simulateNetworkDelay(800);
  return { connected: true, deviceId: 'POS_001' };
}

// Simulate card payment processing
export async function processCardPayment(
  intentId: string,
  cardType: 'tap' | 'insert' | 'swipe'
): Promise<PaymentAttempt> {
  const intent = intentStore.get(intentId);
  if (!intent) throw new Error('Intent not found');

  const attempt = intent.attempts[intent.attempts.length - 1];
  if (!attempt) throw new Error('No attempt found');

  // Update attempt status
  attempt.status = 'processing';
  
  // Simulate processing delay
  await simulateNetworkDelay(2000);

  // 90% success rate for demo
  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    attempt.status = 'succeeded';
    attempt.completedAt = new Date().toISOString();
    attempt.providerTxnId = generateId('card_txn');
    attempt.metadata = {
      deviceId: 'POS_001',
      last4: '4242',
      cardBrand: 'visa',
      authCode: `AUTH${Math.floor(Math.random() * 1000000)}`,
      rrn: `RRN${Math.floor(Math.random() * 1000000000)}`,
    } as CardMetadata;

    intent.status = 'succeeded';
  } else {
    attempt.status = 'failed';
    attempt.completedAt = new Date().toISOString();
    attempt.failureCode = 'bank_declined';
    attempt.failureMessage = 'Transaction declined by bank';

    intent.status = 'failed';
  }

  intent.updatedAt = new Date().toISOString();
  return attempt;
}

// Cancel payment attempt
export async function cancelPaymentAttempt(attemptId: string): Promise<PaymentAttempt> {
  await simulateNetworkDelay(200);

  for (const intent of intentStore.values()) {
    const attempt = intent.attempts.find(a => a.id === attemptId);
    if (attempt) {
      attempt.status = 'cancelled';
      attempt.completedAt = new Date().toISOString();
      intent.status = 'cancelled';
      intent.updatedAt = new Date().toISOString();
      return attempt;
    }
  }

  throw new Error('Attempt not found');
}

// Get payment intent status
export async function getPaymentIntentStatus(intentId: string): Promise<PaymentIntent | null> {
  await simulateNetworkDelay(100);
  return intentStore.get(intentId) || null;
}

// Helper to simulate network delay
function simulateNetworkDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Analytics events (mock)
export function trackPaymentEvent(event: string, data: Record<string, unknown>) {
  console.log(`[Analytics] ${event}`, data);
}

// Reset poll count (for testing)
export function resetPollCount() {
  pollCount = 0;
}
