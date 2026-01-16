import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConnectionStatusIndicator } from "@/components/realtime/ConnectionStatusIndicator";

type BreadcrumbItem = string | { label: string; onClick: () => void };

interface AppHeaderProps {
  breadcrumbs: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs }: AppHeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="relative h-14 border-b border-border bg-card flex items-center px-4">
      {/* Breadcrumbs - Left */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => {
          const isClickable = typeof crumb === "object";
          const label = isClickable ? crumb.label : crumb;
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {isClickable && !isLast ? (
                <button
                  onClick={crumb.onClick}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {label}
                </button>
              ) : (
                <span className={isLast ? "text-foreground font-medium" : ""}>
                  {label}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global Search - Center - High Priority */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[500px]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <Input
            placeholder="Search patients by name, ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="pl-12 h-10 bg-background border-2 border-primary/30 rounded-full shadow-sm text-base placeholder:text-muted-foreground/70 transition-all"
          />
        </div>
      </div>

      {/* Icons - Right */}
      <div className="flex items-center gap-3">
        <ConnectionStatusIndicator size="sm" />
        <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
            1
          </Badge>
        </button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <User className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </header>
  );
}
