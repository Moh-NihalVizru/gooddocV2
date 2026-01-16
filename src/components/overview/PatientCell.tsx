import { User, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientCellProps {
  name: string;
  gdid: string;
  ageSex?: string; // Format: "35/M" or "35/F" - optional
  patientId?: string; // Optional - if provided, cell becomes clickable
  fromPage?: string; // Optional - source page for back navigation
}

export function PatientCell({ name, gdid, ageSex, patientId, fromPage }: PatientCellProps) {
  const navigate = useNavigate();
  
  // Parse ageSex to extract age and gender (if provided) - handles both "/" and " | " formats
  const ageSexParts = ageSex?.split(/[\/|]/).map(s => s.trim()) || [];
  const age = ageSexParts[0];
  const sex = ageSexParts[1];
  const isFemale = sex?.toLowerCase().startsWith("f");

  // Format GDID - extract last 3 digits
  const formattedGdid = gdid.replace(/\D/g, "").slice(-3).padStart(3, "0");

  const handleClick = (e: React.MouseEvent) => {
    if (patientId) {
      e.stopPropagation();
      const from = fromPage ? `?from=${fromPage}` : '';
      navigate(`/patient-insights/${patientId}${from}`);
    }
  };

  const isClickable = !!patientId;

  return (
    <div 
      className={`flex items-center gap-3 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && handleClick(e as any) : undefined}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isFemale ? "bg-pink-500" : "bg-primary"
        }`}
      >
        {isFemale ? (
          <UserRound className="w-5 h-5 text-primary-foreground" />
        ) : (
          <User className="w-5 h-5 text-primary-foreground" />
        )}
      </div>
      <div>
        <div className={`text-sm font-medium text-foreground ${isClickable ? 'hover:underline' : ''}`}>{name}</div>
        <div className="text-xs text-muted-foreground">
          GDID - {formattedGdid}{ageSex ? ` • ${age} | ${sex}` : ""}
        </div>
      </div>
    </div>
  );
}
