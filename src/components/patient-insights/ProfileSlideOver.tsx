import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface Patient {
  name: string;
  gdid: string;
  title: string;
  age: number;
  gender: string;
  dob: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  address: string;
  pincode: string;
  state: string;
  city: string;
  country: string;
}

interface ProfileSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onEdit: () => void;
}

export function ProfileSlideOver({ isOpen, onClose, patient, onEdit }: ProfileSlideOverProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div
        className="fixed top-0 right-0 h-full w-[480px] bg-background shadow-2xl z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 id="profile-title" className="text-lg font-semibold text-foreground">
            Patient Profile
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Information */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Patient Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Gender</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.gender}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.dob}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Age</Label>
                <p className="text-sm font-medium text-foreground mt-1">{patient.age}</p>
              </div>
            </div>
          </Card>

          {/* Contacts */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Contacts</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                <p className="text-sm font-medium text-foreground mt-1">{patient.mobile}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium text-foreground mt-1">{patient.email}</p>
              </div>
            </div>
          </Card>

          {/* IDs */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">IDs</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">GDID</Label>
                <p className="text-sm font-medium text-foreground mt-1">GDID-{patient.gdid}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Blood Group</Label>
                <p className="text-sm font-medium text-foreground mt-1">{patient.bloodGroup}</p>
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Address Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.city}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pin code</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.pincode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.state}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Country</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{patient.country}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
