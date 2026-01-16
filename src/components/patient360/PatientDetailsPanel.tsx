import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Printer } from "lucide-react";
import { Patient, Vitals } from "@/types/patient360";

interface PatientDetailsPanelProps {
  patient: Patient;
  vitals?: Vitals;
}

export function PatientDetailsPanel({ patient, vitals }: PatientDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dob).getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Implement save logic
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Patient Information</h2>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Patient Sheet
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        {!isEditing ? (
          // View Mode
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">GDID</Label>
                <p className="text-sm text-foreground font-medium mt-1">GDID-{patient.gdid}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <p className="text-sm text-foreground font-medium mt-1">{patient.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Gender</Label>
                <p className="text-sm text-foreground font-medium mt-1">
                  {patient.sex === "M" ? "Male" : patient.sex === "F" ? "Female" : "Other"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                <p className="text-sm text-foreground font-medium mt-1">
                  {new Date(patient.dob).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Age</Label>
                <p className="text-sm text-foreground font-medium mt-1">{age}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <p className="text-sm text-foreground font-medium mt-1">{patient.phone || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm text-foreground font-medium mt-1">{patient.email || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                <p className="text-sm text-foreground font-medium mt-1">{patient.whatsapp || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Blood Group</Label>
                <p className="text-sm text-foreground font-medium mt-1">{patient.bloodGroup || "—"}</p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-foreground">GDID</Label>
                <Input 
                  value={`GDID-${patient.gdid}`}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground">Full Name</Label>
                <Input 
                  defaultValue={patient.name}
                  placeholder="Full name"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-foreground">Gender</Label>
                <Select defaultValue={patient.sex}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-foreground">Date of Birth</Label>
                <Input 
                  defaultValue={new Date(patient.dob).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                  placeholder="dd/mm/yyyy"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-foreground">Age</Label>
                <Input 
                  value={age}
                  disabled
                  placeholder="Calculated from DOB"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground">Phone</Label>
                <Input 
                  defaultValue={patient.phone}
                  placeholder="10 digits"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-foreground">Email</Label>
                <Input 
                  defaultValue={patient.email}
                  placeholder="name@example.com"
                  type="email"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground">WhatsApp</Label>
                <Input 
                  defaultValue={patient.whatsapp}
                  placeholder="WhatsApp number"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-foreground">Blood Group</Label>
              <Select defaultValue={patient.bloodGroup}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A−">A−</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B−">B−</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB−">AB−</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O−">O−</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {patient.address && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Address Details</h3>
            {!isEditing ? (
              // View Mode
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <p className="text-sm text-foreground mt-1">{patient.address.city || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State</Label>
                    <p className="text-sm text-foreground mt-1">{patient.address.state || "—"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Pin code</Label>
                    <p className="text-sm text-foreground mt-1">{patient.address.pincode || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <p className="text-sm text-foreground mt-1">{patient.address.country || "—"}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-foreground">City</Label>
                    <Input 
                      defaultValue={patient.address.city}
                      placeholder="Chennai"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-foreground">Pin code</Label>
                    <Input 
                      defaultValue={patient.address.pincode}
                      placeholder="012 345"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-foreground">State</Label>
                    <Input 
                      defaultValue={patient.address.state}
                      placeholder="Tamil Nadu"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-foreground">Country</Label>
                    <Input 
                      defaultValue={patient.address.country}
                      placeholder="India"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

    </div>
  );
}
