import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { formatDistanceToNow, format, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

interface ClockContextType {
  now: Date;
  formatRelative: (date: Date | string | null | undefined) => string;
  formatAbsolute: (date: Date | string | null | undefined, formatStr?: string) => string;
  formatTimeAgo: (date: Date | string | null | undefined) => string;
  getSecondsSince: (date: Date | string | null | undefined) => number;
}

const ClockContext = createContext<ClockContextType | undefined>(undefined);

// Update interval based on how recent the timestamp is
function getUpdateInterval(date: Date, now: Date): number {
  const diffSeconds = Math.abs(differenceInSeconds(now, date));
  
  if (diffSeconds < 60) return 1000;      // < 1 min: update every second
  if (diffSeconds < 3600) return 10000;   // < 1 hour: update every 10 seconds
  if (diffSeconds < 86400) return 60000;  // < 1 day: update every minute
  return 300000;                           // >= 1 day: update every 5 minutes
}

export function ClockProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState(() => new Date());

  // Global tick - updates every second for live "time ago" displays
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Smart relative time formatter
  const formatRelative = useCallback((date: Date | string | null | undefined): string => {
    if (!date) return '—';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';

    const diffSeconds = differenceInSeconds(now, d);
    
    // Future dates
    if (diffSeconds < 0) {
      const absDiff = Math.abs(diffSeconds);
      if (absDiff < 60) return `in ${absDiff}s`;
      if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)}m`;
      if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)}h`;
      return `in ${Math.floor(absDiff / 86400)}d`;
    }
    
    // Past dates
    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    
    return formatDistanceToNow(d, { addSuffix: true });
  }, [now]);

  // Absolute time formatter with optional format string
  const formatAbsolute = useCallback((
    date: Date | string | null | undefined,
    formatStr: string = 'dd MMM yyyy, HH:mm'
  ): string => {
    if (!date) return '—';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    
    return format(d, formatStr);
  }, []);

  // Time ago with more detail
  const formatTimeAgo = useCallback((date: Date | string | null | undefined): string => {
    if (!date) return '—';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';

    return formatDistanceToNow(d, { addSuffix: true, includeSeconds: true });
  }, []);

  // Get seconds since a date
  const getSecondsSince = useCallback((date: Date | string | null | undefined): number => {
    if (!date) return 0;
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 0;
    
    return differenceInSeconds(now, d);
  }, [now]);

  const value = useMemo(() => ({
    now,
    formatRelative,
    formatAbsolute,
    formatTimeAgo,
    getSecondsSince,
  }), [now, formatRelative, formatAbsolute, formatTimeAgo, getSecondsSince]);

  return (
    <ClockContext.Provider value={value}>
      {children}
    </ClockContext.Provider>
  );
}

export function useClock() {
  const context = useContext(ClockContext);
  if (!context) {
    throw new Error('useClock must be used within ClockProvider');
  }
  return context;
}

// Memoized component for displaying relative time
export function RelativeTime({ 
  date, 
  className = '' 
}: { 
  date: Date | string | null | undefined;
  className?: string;
}) {
  const { formatRelative } = useClock();
  return <span className={className}>{formatRelative(date)}</span>;
}

// Component for "Last updated X ago" displays
export function LastUpdated({ 
  date,
  prefix = 'Last updated',
  className = ''
}: { 
  date: Date | string | null | undefined;
  prefix?: string;
  className?: string;
}) {
  const { formatRelative } = useClock();
  
  if (!date) return null;
  
  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      {prefix} {formatRelative(date)}
    </span>
  );
}
