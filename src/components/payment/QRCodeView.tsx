import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface QRCodeViewProps {
  qrPayload: string;
  amount: number;
  payeeName?: string;
  className?: string;
}

export function QRCodeView({
  qrPayload,
  amount,
  payeeName = 'GoodDoc Hospital',
  className,
}: QRCodeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyVPA = async () => {
    // Extract VPA from payload
    const match = qrPayload.match(/pa=([^&]+)/);
    const vpa = match ? decodeURIComponent(match[1]) : '';
    
    if (vpa) {
      await navigator.clipboard.writeText(vpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* QR Code */}
      <div className="p-4 bg-white rounded-xl shadow-sm border border-border">
        <QRCodeSVG
          value={qrPayload}
          size={200}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      {/* Amount and payee info */}
      <div className="text-center space-y-1">
        <p className="text-2xl font-bold text-foreground">
          ₹{(amount / 100).toLocaleString('en-IN')}
        </p>
        <p className="text-sm text-muted-foreground">Pay to: {payeeName}</p>
      </div>

      {/* Copy VPA button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyVPA}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy UPI ID</span>
          </>
        )}
      </Button>

      {/* Instructions */}
      <p className="text-xs text-center text-muted-foreground max-w-xs">
        Scan this QR code with any UPI app to complete payment
      </p>
    </div>
  );
}
