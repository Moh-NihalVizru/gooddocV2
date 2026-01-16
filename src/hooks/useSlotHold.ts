import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '@/types/scheduling';

interface HoldState {
  holdId: string | null;
  slot: TimeSlot | null;
  expiresAt: Date | null;
  remainingSeconds: number;
}

interface UseSlotHoldOptions {
  holdDurationSeconds?: number;
  onExpired?: () => void;
}

export function useSlotHold(options: UseSlotHoldOptions = {}) {
  const { holdDurationSeconds = 90, onExpired } = options;
  
  const [holdState, setHoldState] = useState<HoldState>({
    holdId: null,
    slot: null,
    expiresAt: null,
    remainingSeconds: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = useCallback((expiresAt: Date) => {
    // Clear existing countdown
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setHoldState(prev => ({ ...prev, remainingSeconds: remaining }));
      
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setHoldState({ holdId: null, slot: null, expiresAt: null, remainingSeconds: 0 });
        onExpired?.();
      }
    }, 1000);
  }, [onExpired]);

  const holdSlot = useCallback(async (
    doctorId: string,
    slot: TimeSlot
  ): Promise<{ success: boolean; holdId?: string; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      // Release any existing hold first
      if (holdState.holdId) {
        await releaseHold();
      }

      const expiresAt = new Date(Date.now() + holdDurationSeconds * 1000);
      
      // Insert a temporary appointment with 'held' status
      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctorId,
          patient_id: 'temp-hold', // Temporary placeholder
          start_time: slot.start,
          end_time: slot.end,
          mode: slot.mode,
          location_id: slot.locationId,
          status: 'held',
          hold_expires_at: expiresAt.toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        // Check for conflict (double booking)
        if (insertError.code === '23505') {
          setError('This slot is no longer available');
          return { success: false, error: 'This slot is no longer available. Please select another time.' };
        }
        throw insertError;
      }

      const holdId = data.id;

      setHoldState({
        holdId,
        slot,
        expiresAt,
        remainingSeconds: holdDurationSeconds,
      });

      // Start countdown
      startCountdown(expiresAt);

      // Set auto-release timer
      timerRef.current = setTimeout(async () => {
        await releaseHold();
        onExpired?.();
      }, holdDurationSeconds * 1000);

      setLoading(false);
      return { success: true, holdId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to hold slot';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  }, [holdState.holdId, holdDurationSeconds, startCountdown, onExpired]);

  const releaseHold = useCallback(async (): Promise<void> => {
    if (!holdState.holdId) return;

    try {
      // Cancel the held appointment
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', holdState.holdId)
        .eq('status', 'held');
    } catch (err) {
      console.error('Failed to release hold:', err);
    }

    // Clear timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setHoldState({
      holdId: null,
      slot: null,
      expiresAt: null,
      remainingSeconds: 0,
    });
  }, [holdState.holdId]);

  const confirmBooking = useCallback(async (
    patientId: string,
    patientName: string,
    appointmentTypeId?: string,
    notes?: string
  ): Promise<{ success: boolean; appointmentId?: string; error?: string }> => {
    if (!holdState.holdId) {
      return { success: false, error: 'No slot is currently held' };
    }

    setLoading(true);
    setError(null);

    try {
      // Update the held appointment to booked
      const { data, error: updateError } = await supabase
        .from('appointments')
        .update({
          patient_id: patientId,
          patient_name: patientName,
          appointment_type_id: appointmentTypeId,
          notes,
          status: 'booked',
          hold_expires_at: null,
        })
        .eq('id', holdState.holdId)
        .eq('status', 'held')
        .select('id')
        .single();

      if (updateError) {
        // Hold may have expired
        if (updateError.code === 'PGRST116') {
          setError('Your hold has expired. Please select a new time slot.');
          setHoldState({ holdId: null, slot: null, expiresAt: null, remainingSeconds: 0 });
          return { success: false, error: 'Your hold has expired. Please select a new time slot.' };
        }
        throw updateError;
      }

      // Clear timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);

      setHoldState({ holdId: null, slot: null, expiresAt: null, remainingSeconds: 0 });
      setLoading(false);

      return { success: true, appointmentId: data.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm booking';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  }, [holdState.holdId]);

  return {
    holdState,
    loading,
    error,
    holdSlot,
    releaseHold,
    confirmBooking,
    isHolding: !!holdState.holdId,
  };
}
