import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Pill, Clock } from "lucide-react";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

export default function Pharmacy() {
  const { isCollapsed } = useSidebarContext();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
        <AppHeader breadcrumbs={["Pharmacy"]} />

        <main className="p-6">
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Pill className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Pharmacy</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span>Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Manage prescriptions, dispensing, inventory, and medication orders. This feature is currently under development.
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}
