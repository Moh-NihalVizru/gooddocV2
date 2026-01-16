import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentProcessingIndicatorProps {
  stepText: string;
  className?: string;
}

export function PaymentProcessingIndicator({ stepText, className }: PaymentProcessingIndicatorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 gap-4', className)}>
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        {/* Pulse ring animation */}
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 animate-ping" />
      </div>
      <p className="text-sm text-muted-foreground text-center animate-pulse">
        {stepText}
      </p>
    </div>
  );
}
