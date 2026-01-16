import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientChipProps {
  name: string;
  gdid: string;
  age: number;
  gender: string;
  onClick?: () => void;
  showBackButton?: boolean;
  backPath?: string;
  variant?: "default" | "light";
  patientType?: "IP" | "OP";
}

export function PatientChip({ name, gdid, age, gender, onClick, showBackButton, backPath, variant = "default", patientType }: PatientChipProps) {
  const navigate = useNavigate();
  const isMale = gender.toLowerCase().startsWith("m");
  const isFemale = gender.toLowerCase().startsWith("f");
  const isLight = variant === "light";

  // Gender-based styling
  const avatarBgClass = isLight
    ? "bg-white/20 backdrop-blur-sm"
    : isFemale 
      ? "bg-pink-500" 
      : isMale 
        ? "bg-primary" 
        : "bg-muted";

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const content = (
    <>
      {showBackButton && (
        <button
          onClick={handleBack}
          className={`p-1.5 rounded-md transition-colors ${
            isLight 
              ? "hover:bg-white/20 text-white/80 hover:text-white" 
              : "hover:bg-accent/50"
          } mr-1`}
          title="Go back"
        >
          <ArrowLeft className={`h-5 w-5 ${isLight ? "" : "text-muted-foreground"}`} />
        </button>
      )}
      <Avatar className="h-10 w-10">
        <AvatarFallback className={`${avatarBgClass} ${isLight ? "text-white" : "text-primary-foreground"}`}>
          {isFemale ? (
            <UserRound className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="text-left">
        <p className={`text-base font-semibold ${isLight ? "text-white" : "text-foreground group-hover:text-primary"} transition-colors`}>
          {name}
        </p>
        <div className="flex items-center gap-2">
          <p className={`text-xs ${isLight ? "text-white/70" : "text-muted-foreground"}`}>
            {gdid} • {age} | {gender[0]}
          </p>
          {patientType && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              isLight 
                ? "bg-white/20 text-white" 
                : patientType === "IP" 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
            }`}>
              {patientType} Patient
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (!onClick) {
    return (
      <div className="flex items-center gap-3 pr-4 py-2 rounded-lg">
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 pr-4 py-2 rounded-lg transition-colors group ${
        isLight ? "hover:bg-white/10" : "hover:bg-accent/50"
      }`}
      title="View profile details"
    >
      {content}
    </button>
  );
}
