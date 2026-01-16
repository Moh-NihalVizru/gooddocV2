import React, { useContext } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Import context directly to check if available
import { RealtimeContext } from '@/contexts/RealtimeContext';

interface ConnectionStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ConnectionStatusIndicator({ 
  className, 
  showLabel = false,
  size = 'sm'
}: ConnectionStatusIndicatorProps) {
  // Use context directly to avoid throwing if not available
  const realtimeContext = useContext(RealtimeContext);
  
  // If context is not available, don't render anything
  if (!realtimeContext) {
    return null;
  }
  
  const { connectionStatus, lastSyncTime, isOnline, eventCount, reconnect } = realtimeContext;
  
  // Simple relative time format without depending on ClockContext
  const formatRelative = (date: Date | null) => {
    if (!date) return 'never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const iconSize = size === 'sm' ? 14 : 18;
  
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        label: 'Offline',
        description: 'No internet connection',
      };
    }

    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Check,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          label: 'Live',
          description: `Synced ${formatRelative(lastSyncTime)}`,
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          label: 'Connecting',
          description: 'Establishing connection...',
          animate: true,
        };
      case 'reconnecting':
        return {
          icon: RefreshCw,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          label: 'Reconnecting',
          description: 'Connection lost, retrying...',
          animate: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          label: 'Error',
          description: 'Connection failed. Click to retry.',
          onClick: reconnect,
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Disconnected',
          description: 'Not connected to server',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={config.onClick}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors',
            config.bgColor,
            config.onClick && 'cursor-pointer hover:opacity-80',
            !config.onClick && 'cursor-default',
            className
          )}
        >
          <Icon 
            size={iconSize} 
            className={cn(
              config.color,
              config.animate && 'animate-spin'
            )} 
          />
          {showLabel && (
            <span className={cn('text-xs font-medium', config.color)}>
              {config.label}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
          {lastSyncTime && connectionStatus === 'connected' && (
            <p className="text-xs text-muted-foreground">
              {eventCount} events received
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Minimal dot indicator for tight spaces
export function ConnectionDot({ className }: { className?: string }) {
  const realtimeContext = useContext(RealtimeContext);
  
  if (!realtimeContext) {
    return null;
  }
  
  const { connectionStatus, isOnline } = realtimeContext;

  const getColor = () => {
    if (!isOnline) return 'bg-destructive';
    switch (connectionStatus) {
      case 'connected': return 'bg-emerald-500';
      case 'connecting':
      case 'reconnecting': return 'bg-amber-500 animate-pulse';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <span 
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        getColor(),
        className
      )} 
    />
  );
}
