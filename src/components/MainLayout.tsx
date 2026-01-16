import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isCollapsed } = useSidebarContext();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div 
        className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "ml-[60px]" : "ml-[220px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
