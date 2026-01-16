import { CartItem } from "@/types/booking/ipAdmission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { calcLineTotal } from "@/utils/billing/totals";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";

interface CartItemInlineProps {
  item: CartItem;
  onUpdateQty: (itemId: string, qty: number) => void;
  onUpdateDiscount: (itemId: string, discountPct: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemInline({ item, onUpdateQty, onUpdateDiscount, onRemove }: CartItemInlineProps) {
  const [discountInput, setDiscountInput] = useState(item.discountPct?.toString() || "0");
  
  const handleQtyChange = (delta: number) => {
    const newQty = Math.max(1, item.qty + delta);
    onUpdateQty(item.itemId, newQty);
  };
  
  const handleDiscountBlur = () => {
    const value = parseFloat(discountInput);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onUpdateDiscount(item.itemId, value);
    } else {
      setDiscountInput(item.discountPct?.toString() || "0");
    }
  };
  
  const lineTotal = calcLineTotal(item);
  
  return (
    <div className="flex items-start gap-3 py-2 px-3 bg-muted/30 rounded-md">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <p className="text-[13px] text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.itemId)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3 text-[13px]">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQtyChange(-1)}
              className="h-6 w-6 p-0"
              disabled={item.qty <= 1}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center">{item.qty}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQtyChange(1)}
              className="h-6 w-6 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">×</span>
            <span>{formatCurrency(item.unitPrice)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Disc:</span>
            <Input
              type="number"
              min="0"
              max="100"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              onBlur={handleDiscountBlur}
              className="h-6 w-12 px-1 text-xs"
            />
            <span className="text-muted-foreground">%</span>
          </div>
          
          <div className="ml-auto font-medium text-foreground">
            {formatCurrency(lineTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}
