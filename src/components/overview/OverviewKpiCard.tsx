import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface ChipData {
  label: string;
  value: string;
  route?: string;
}

interface BulletData {
  text: string;
}

interface OverviewKpiCardProps {
  title: string;
  kpiValue: string;
  iconSrc: string;
  route: string;
  bullets: BulletData[];
  chips: ChipData[];
  isLoading?: boolean;
}

export function OverviewKpiCard({
  title,
  kpiValue,
  iconSrc,
  route,
  bullets,
  chips,
  isLoading,
}: OverviewKpiCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (isLoading) return;
    navigate(route);
  };

  const handleChipClick = (e: React.MouseEvent, chip: ChipData) => {
    if (isLoading) return;
    if (chip.route) {
      e.stopPropagation();
      navigate(chip.route);
    }
  };

  return (
    <div
      role="button"
      tabIndex={isLoading ? -1 : 0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (isLoading) return;
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
      aria-label={isLoading ? `Loading ${title}` : `Open ${title} (${kpiValue})`}
      className={`
        group relative w-full rounded-[24px] bg-white border border-[#E6E8ED]
        p-[18px] ${isLoading ? "cursor-default" : "cursor-pointer"}
        transition-all duration-200 ease-out
        shadow-[0_1px_2px_rgba(16,24,40,0.05),0_6px_16px_rgba(16,24,40,0.04)]
        ${!isLoading && "hover:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_6px_16px_rgba(16,24,40,0.06)] hover:-translate-y-0.5"}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(42,106,247,0.35)] focus-visible:ring-offset-2
      `}
      style={{ fontFamily: 'Inter, "SF Pro", "Segoe UI", system-ui, sans-serif' }}
    >
      <div className="flex justify-between gap-3">
        {/* Left Column - Title, KPI, Bullets */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Header with icon and title */}
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={iconSrc} 
              alt="" 
              className={`w-9 h-9 shrink-0 ${isLoading ? "opacity-50 grayscale" : ""}`}
              style={{ width: '36px', height: '36px' }}
            />
            <span
              className="text-lg font-semibold text-[#0F172A] tracking-[0]"
              style={{ fontSize: "16px", fontWeight: 600 }}
            >
              {title}
            </span>
          </div>

          {/* KPI Number */}
          {isLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded-md mb-1" />
          ) : (
            <p
              className="text-[#0F172A] tabular-nums"
              style={{ fontSize: "22px", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-1.5px" }}
            >
              {kpiValue}
            </p>
          )}

          {/* Bullets as horizontal pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {isLoading ? (
              <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
            ) : (
              bullets.map((bullet, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#E6E8ED]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A6AF7]" />
                  <span
                    className="text-[#0F172A]"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    {bullet.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {isLoading ? (
            <>
              <div className="h-[38px] w-[144px] bg-muted animate-pulse rounded-[16px]" />
              <div className="h-[38px] w-[144px] bg-muted animate-pulse rounded-[16px]" />
            </>
          ) : (
            chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={(e) => handleChipClick(e, chip)}
                className="
                  group/chip flex items-end justify-between px-3 py-2 min-h-[38px] w-[144px]
                  bg-white rounded-[16px] border border-[#E6E8ED]
                  transition-colors duration-150
                  hover:border-[#D7DBE0]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(42,106,247,0.35)]
                "
              >
                <div className="flex flex-col items-start">
                  <span
                    className="text-[#6B7280]"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    {chip.label}
                  </span>
                  <span
                    className="text-[#0F172A]"
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    {chip.value}
                  </span>
                </div>
                <ChevronRight 
                  className="w-4 h-4 text-[#9CA3AF] opacity-0 group-hover/chip:opacity-100 transition-opacity duration-150 mb-0.5" 
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
