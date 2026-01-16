import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

// Entity types that support realtime
export type EntityType = 'patients' | 'doctors' | 'appointments' | 'leaves' | 'schedule_templates' | 'schedule_exceptions' | 'locations' | 'holidays';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface RealtimeEvent {
  entityType: EntityType;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  id: string;
  payload: any;
  timestamp: Date;
}

interface RealtimeContextType {
  connectionStatus: ConnectionStatus;
  lastSyncTime: Date | null;
  isOnline: boolean;
  eventCount: number;
  subscribe: (entityType: EntityType, callback: (event: RealtimeEvent) => void) => () => void;
  reconnect: () => void;
}

export const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [eventCount, setEventCount] = useState(0);
  
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribersRef = useRef<Map<EntityType, Set<(event: RealtimeEvent) => void>>>(new Map());

  // Publish event to subscribers
  const publishEvent = useCallback((event: RealtimeEvent) => {
    const subscribers = subscribersRef.current.get(event.entityType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Realtime subscriber error:', error);
        }
      });
    }
  }, []);

  // Handle incoming realtime changes
  const handleChange = useCallback((
    entityType: EntityType,
    payload: RealtimePostgresChangesPayload<any>
  ) => {
    const now = new Date();
    setLastSyncTime(now);
    setEventCount(prev => prev + 1);

    const event: RealtimeEvent = {
      entityType,
      eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
      id: (payload.new as any)?.id || (payload.old as any)?.id,
      payload: payload.eventType === 'DELETE' ? payload.old : payload.new,
      timestamp: now,
    };

    // Log in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Realtime] ${entityType} ${payload.eventType}:`, event.id);
    }

    // Invalidate React Query cache for this entity
    queryClient.invalidateQueries({ queryKey: [entityType] });
    
    // Also invalidate singular query keys (e.g., ['patient', id])
    const singularKey = entityType.endsWith('s') ? entityType.slice(0, -1) : entityType;
    if (event.id) {
      queryClient.invalidateQueries({ queryKey: [singularKey, event.id] });
    }

    // Cross-entity invalidations for related data
    if (entityType === 'appointments') {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    }
    if (entityType === 'leaves' || entityType === 'schedule_exceptions') {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }

    // Publish to subscribers
    publishEvent(event);
  }, [queryClient, publishEvent]);

  // Subscribe to entity changes
  const subscribe = useCallback((
    entityType: EntityType,
    callback: (event: RealtimeEvent) => void
  ): (() => void) => {
    if (!subscribersRef.current.has(entityType)) {
      subscribersRef.current.set(entityType, new Set());
    }
    
    subscribersRef.current.get(entityType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(entityType);
      if (subscribers) {
        subscribers.delete(callback);
      }
    };
  }, []);

  // Setup and reconnection logic with refs to avoid circular dependencies
  const setupChannelRef = useRef<() => void>(() => {});
  
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Realtime] Scheduling reconnect in ${delay}ms (attempt ${reconnectAttemptRef.current + 1})`);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptRef.current++;
      setConnectionStatus('reconnecting');
      setupChannelRef.current();
    }, delay);
  }, []);

  // Setup realtime channel
  const setupChannel = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    setConnectionStatus('connecting');

    const channel = supabase
      .channel('realtime-all-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        (payload) => handleChange('patients', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doctors' },
        (payload) => handleChange('doctors', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => handleChange('appointments', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaves' },
        (payload) => handleChange('leaves', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedule_templates' },
        (payload) => handleChange('schedule_templates', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedule_exceptions' },
        (payload) => handleChange('schedule_exceptions', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'locations' },
        (payload) => handleChange('locations', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'holidays' },
        (payload) => handleChange('holidays', payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          setLastSyncTime(new Date());
          reconnectAttemptRef.current = 0;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Realtime] Connected to all channels');
          }
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
          scheduleReconnect();
        } else if (status === 'TIMED_OUT') {
          setConnectionStatus('reconnecting');
          scheduleReconnect();
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    channelRef.current = channel;
  }, [handleChange, scheduleReconnect]);

  // Keep ref in sync with the latest setupChannel
  useEffect(() => {
    setupChannelRef.current = setupChannel;
  }, [setupChannel]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    setupChannel();
  }, [setupChannel]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Use ref to avoid stale closure
      reconnectAttemptRef.current = 0;
      setupChannelRef.current();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize channel on mount
  useEffect(() => {
    setupChannel();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setupChannel]);

  return (
    <RealtimeContext.Provider
      value={{
        connectionStatus,
        lastSyncTime,
        isOnline,
        eventCount,
        subscribe,
        reconnect,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}

// Hook for subscribing to specific entity changes
export function useRealtimeSubscription(
  entityType: EntityType,
  callback: (event: RealtimeEvent) => void,
  deps: React.DependencyList = []
) {
  const { subscribe } = useRealtime();
  
  useEffect(() => {
    const unsubscribe = subscribe(entityType, callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, subscribe, ...deps]);
}
