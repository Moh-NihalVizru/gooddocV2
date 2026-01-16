import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import logoIcon from "@/assets/logo-icon.svg";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { logout } from "@/lib/auth";
import { authService } from "@/services/authService";
import { toast } from "sonner";

// Import custom icons
import iconOverview from "@/assets/icons/icon-overview.svg";
import iconOutpatient from "@/assets/icons/icon-outpatient.svg";
import iconDiagnostics from "@/assets/icons/icon-diagnostics.svg";
import iconDoctors from "@/assets/icons/icon-doctors.svg";
import iconPatients from "@/assets/icons/icon-patients.svg";
import iconPricing from "@/assets/icons/icon-pricing.svg";
import iconPharmacy from "@/assets/icons/icon-pharmacy.svg";
import iconReports from "@/assets/icons/icon-reports.svg";
import iconSettings from "@/assets/icons/icon-settings.svg";
import iconSignout from "@/assets/icons/icon-signout.svg";
import iconChevronMenu from "@/assets/icons/icon-chevron-menu.svg";

const menuItems = [
  { icon: iconOverview, label: "Overview", href: "/" },
  // Temporarily hidden: { icon: iconOutpatient, label: "Outpatient", href: "/appointments/outpatient" },
  // Temporarily hidden: { icon: iconPharmacy, label: "Diagnostics", href: "/diagnostics" },
  { icon: iconDiagnostics, label: "Doctors", href: "/doctors" },
  { icon: iconPatients, label: "Patients", href: "/patients" },
  { icon: iconPricing, label: "Pricing Catalog", href: "/pricing-catalog" },
  { icon: iconDoctors, label: "Pharmacy", href: "/pharmacy" },
  { icon: iconReports, label: "Reports", href: "/reports" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebarContext();

  const handleSignOut = () => {
    // Clear all authentication data
    logout(); // Clears demo session
    authService.clearTokens(); // Clears JWT tokens
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId');
    
    toast.success('Signed out successfully');
    // Use window.location to force a full page reload and ensure auth is re-checked
    window.location.href = '/auth';
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-50",
        isCollapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo section with toggle */}
      <div className={cn("p-4 flex items-center gap-2", isCollapsed ? "justify-center" : "justify-between")}>
        <Link to="/" className="flex items-center">
          {isCollapsed ? (
            <img src={logoIcon} alt="GoodDoc" className="h-6 w-6" />
          ) : (
            <img src={logo} alt="GoodDoc" className="h-7" />
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent/50 transition-colors"
            aria-label="Collapse menu"
          >
            <img src={iconChevronMenu} alt="" className="w-4 h-4 rotate-180" style={{ filter: "brightness(0) invert(1)" }} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed - inside menu area */}
      {isCollapsed && (
        <div className="px-2 mb-2">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
            aria-label="Expand menu"
          >
            <img src={iconChevronMenu} alt="" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href === "/diagnostics" && location.pathname.startsWith("/diagnostics"));
          
          const linkContent = (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                !isActive && "hover:bg-sidebar-accent/50",
                isCollapsed && "justify-center px-2"
              )}
            >
              <img 
                src={item.icon} 
                alt="" 
                className="w-5 h-5 shrink-0" 
                style={{ filter: "brightness(0) invert(1)" }}
              />
              {!isCollapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    {linkContent}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-sidebar-border">
        {isCollapsed ? (
          <>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className="flex items-center justify-center px-2 py-2.5 rounded-lg text-sm mb-1 hover:bg-sidebar-accent/50 transition-colors"
                >
                  <img src={iconSettings} alt="" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={handleSignOut} className="w-full flex items-center justify-center px-2 py-2.5 rounded-lg text-sm hover:bg-sidebar-accent/50 transition-colors">
                  <img src={iconSignout} alt="" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Sign Out</p>
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 hover:bg-sidebar-accent/50 transition-colors"
            >
              <img src={iconSettings} alt="" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} />
              <span>Settings</span>
            </Link>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-sidebar-accent/50 transition-colors">
              <img src={iconSignout} alt="" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
