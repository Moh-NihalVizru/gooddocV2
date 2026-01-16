import { ChevronRight } from "lucide-react";

interface KpiTileProps {
  label: string;
  amount: string;
  variant?: "default" | "light";
  subtitle?: string;
  secondaryLabel?: string;
  secondaryAmount?: string;
  showArrow?: boolean;
  onClick?: () => void;
}

export function KpiTile({ 
  label, 
  amount, 
  variant = "default", 
  subtitle,
  secondaryLabel,
  secondaryAmount,
  showArrow = false,
  onClick
}: KpiTileProps) {
  const isLight = variant === "light";
  const isClickable = !!onClick;
  
  return (
    <div 
      className={`rounded-lg px-4 py-2.5 w-[160px] ${
        isLight 
          ? "bg-white/10" 
          : "border border-border bg-card"
      } ${isClickable ? "cursor-pointer hover:bg-white/20 transition-colors" : ""}`}
      onClick={onClick}
    >
      <p className={`text-[11px] font-medium uppercase tracking-wide ${isLight ? "text-white/60" : "text-muted-foreground"}`}>
        {label}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <div className="flex items-baseline gap-2">
          <p className={`text-lg font-semibold ${isLight ? "text-white" : "text-foreground"}`}>
            {amount}
          </p>
          {secondaryAmount && (
            <p className={`text-[10px] ${isLight ? "text-amber-300" : "text-amber-600"}`}>
              +{secondaryAmount}
            </p>
          )}
        </div>
        {showArrow && (
          <ChevronRight className={`h-4 w-4 ${isLight ? "text-white/60" : "text-muted-foreground"}`} />
        )}
      </div>
      {subtitle && (
        <p className={`text-[10px] mt-0.5 ${isLight ? "text-white/50" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
