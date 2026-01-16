import React, { useState } from 'react';
import { Pencil, Lock, Unlock, Save, X, RotateCcw, MoreVertical, Tag, DollarSign, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LineItem, PriceEditState } from '@/types/pricing';
import { formatCurrency } from '@/lib/pricingEngine';
import { cn } from '@/lib/utils';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

interface LineItemPriceEditorProps {
  item: LineItem;
  onPriceUpdate: (itemId: string, newPrice: number, reason?: string) => void;
  onDiscountApply: (itemId: string, discountType: 'flat' | 'percent', value: number, reason?: string) => void;
  onWaiveOff: (itemId: string, reason: string) => void;
  onOpenModal: () => void;
}

export function LineItemPriceEditor({
  item,
  onPriceUpdate,
  onDiscountApply,
  onWaiveOff,
  onOpenModal,
}: LineItemPriceEditorProps) {
  const { flags } = useFeatureFlags();
  const [editState, setEditState] = useState<PriceEditState>({
    isEditing: false,
    isLocked: flags.priceEdit_lock,
  });
  const [tempValue, setTempValue] = useState<string>('');
  const [reason, setReason] = useState('');

  const effectivePrice = item.overridePrice ?? item.basePrice;
  const isOverridden = item.overridePrice !== undefined;

  const handleStartEdit = () => {
    if (editState.isLocked) return;
    setEditState({ ...editState, isEditing: true });
    setTempValue(effectivePrice.toString());
  };

  const handleSave = () => {
    const newPrice = parseFloat(tempValue);
    if (isNaN(newPrice) || newPrice < 0) return;

    onPriceUpdate(item.id, newPrice, reason || undefined);
    setEditState({ ...editState, isEditing: false });
    setReason('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setEditState({ ...editState, isEditing: false });
    setTempValue('');
    setReason('');
  };

  const handleReset = () => {
    onPriceUpdate(item.id, item.basePrice);
    setEditState({ ...editState, isEditing: false });
    setReason('');
  };

  const handleUnlock = () => {
    setEditState({ ...editState, isLocked: false });
  };

  // Inline edit pattern
  if (flags.priceEdit_inline && editState.isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-32 h-8 text-sm"
          placeholder="Enter price"
          autoFocus
        />
      </div>
    );
  }

  // Locked state
  if (flags.priceEdit_lock && editState.isLocked) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">₹{formatCurrency(effectivePrice)}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUnlock}>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Override requires justification and may need approval</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Default view with inline pencil and quick actions
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-baseline gap-1">
        {isOverridden && (
          <span className="text-xs text-muted-foreground line-through">₹{formatCurrency(item.basePrice)}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent hover:text-foreground"
          onClick={handleStartEdit}
        >
          <span className="text-sm font-semibold">₹{formatCurrency(effectivePrice)}</span>
          {flags.priceEdit_inline && (
            <Pencil className="ml-1 h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </div>

      {isOverridden && (
        <Badge variant="secondary" className="text-[10px] px-1 py-0">
          Edited
        </Badge>
      )}
    </div>
  );
}
