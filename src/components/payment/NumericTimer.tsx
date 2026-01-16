import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface NumericTimerProps {
  durationSeconds: number;
  onExpire?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  paused?: boolean;
}

export function NumericTimer({
  durationSeconds,
  onExpire,
  className,
  size = 'md',
  showProgress = true,
  paused = false,
}: NumericTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const intervalRef = useRef<number | null>(null);
  const hasExpiredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setRemainingSeconds(durationSeconds);
    hasExpiredRef.current = false;
  }, [durationSeconds]);

  useEffect(() => {
    if (paused) {
      clearTimer();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearTimer();
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [paused, onExpire, clearTimer]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = (remainingSeconds / durationSeconds) * 100;
  
  const isWarning = remainingSeconds <= 30;
  const isCritical = remainingSeconds <= 10;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-semibold',
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'font-mono tabular-nums',
          sizeClasses[size],
          isCritical && 'text-red-600 animate-pulse',
          isWarning && !isCritical && 'text-amber-600',
          !isWarning && 'text-muted-foreground'
        )}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      {showProgress && (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-1000 ease-linear rounded-full',
              isCritical && 'bg-red-500',
              isWarning && !isCritical && 'bg-amber-500',
              !isWarning && 'bg-primary'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
