import { ReactNode } from "react";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  const { isCollapsed } = useSidebarContext();

  return (
    <div 
      className={cn(
        "flex-1 transition-all duration-300",
        isCollapsed ? "ml-[60px]" : "ml-[220px]",
        className
      )}
    >
      {children}
    </div>
  );
}
