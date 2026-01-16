import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Patient } from "@/types/patient";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EditPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onSave: (patient: Patient) => void;
}

export function EditPatientModal({ open, onOpenChange, patient, onSave }: EditPatientModalProps) {
  const [formData, setFormData] = useState<Patient | null>(null);
  const [newAllergy, setNewAllergy] = useState("");
  const [newAlert, setNewAlert] = useState("");

  useEffect(() => {
    if (patient) {
      setFormData({ ...patient });
    }
  }, [patient]);

  if (!formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...(formData.allergies || []), newAllergy.trim()],
      });
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    const updated = [...(formData.allergies || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, allergies: updated });
  };

  const addAlert = () => {
    if (newAlert.trim()) {
      setFormData({
        ...formData,
        medical_alerts: [...(formData.medical_alerts || []), newAlert.trim()],
      });
      setNewAlert("");
    }
  };

  const removeAlert = (index: number) => {
    const updated = [...(formData.medical_alerts || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, medical_alerts: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Patient Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient ID */}
          <div className="text-sm font-medium text-foreground">
            #{formData.gdid}
          </div>

          {/* Patient Information */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Patient Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-foreground">First Name</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="First name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Last Name</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Last name"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-foreground">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'Male' | 'Female' | 'Other') => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-foreground">Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-foreground">Mobile Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Email</Label>
                  <Input
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    type="email"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-foreground">Blood Group</Label>
                  <Select
                    value={formData.blood_group || ""}
                    onValueChange={(value) => setFormData({ ...formData, blood_group: value as Patient['blood_group'] })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-foreground">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Patient['status']) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OP">OP</SelectItem>
                      <SelectItem value="IP">IP</SelectItem>
                      <SelectItem value="Discharged">Discharged</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm text-foreground">Department</Label>
                <Input
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Cardiology, Orthopedics, etc."
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Address Details */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Address Details</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-foreground">Address Line</Label>
                <Input
                  value={formData.address_line1 || ""}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="Street address"
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-foreground">City</Label>
                  <Input
                    value={formData.address_city || ""}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                    placeholder="Chennai"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Pin code</Label>
                  <Input
                    value={formData.address_pincode || ""}
                    onChange={(e) => setFormData({ ...formData, address_pincode: e.target.value })}
                    placeholder="600001"
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-foreground">State</Label>
                <Input
                  value={formData.address_state || ""}
                  onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                  placeholder="Tamil Nadu"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-foreground">Contact Name</Label>
                <Input
                  value={formData.emergency_contact_name || ""}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="Name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground">Contact Phone</Label>
                <Input
                  value={formData.emergency_contact_phone || ""}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Medical Information */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Medical Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-foreground">Allergies</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <Button type="button" variant="outline" onClick={addAllergy}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allergies?.map((allergy, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 bg-red-100 text-red-700">
                      {allergy}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeAllergy(index)} />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm text-foreground">Medical Alerts</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newAlert}
                    onChange={(e) => setNewAlert(e.target.value)}
                    placeholder="Add medical alert"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAlert())}
                  />
                  <Button type="button" variant="outline" onClick={addAlert}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.medical_alerts?.map((alert, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 bg-amber-100 text-amber-700">
                      {alert}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeAlert(index)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Insurance Details */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Insurance Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-foreground">Insurance Provider</Label>
                <Input
                  value={formData.insurance_provider || ""}
                  onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
                  placeholder="Provider name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground">Policy Number</Label>
                <Input
                  value={formData.insurance_policy_number || ""}
                  onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
                  placeholder="Policy number"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
