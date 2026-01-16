import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingItemFormData } from "@/types/pricing-item";
import { useDepartments, useCategories } from "@/api/pricingApi";
import { checkInternalCodeUnique } from "@/api/pricingApi";
import { generateInternalCode } from "@/lib/priceUtils";
import { useDebounce } from "@/hooks/useDebounce";

export function BasicsStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PricingItemFormData>();

  const { data: departments, isLoading: deptLoading } = useDepartments();
  const { data: categories, isLoading: catLoading } = useCategories();

  const [tags, setTags] = useState<string[]>(watch("tags") || []);
  const [tagInput, setTagInput] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  const category = watch("category");
  const department = watch("department");
  const visibility = watch("visibility");
  const internalCode = watch("codes.internal");
  
  const debouncedCode = useDebounce(internalCode, 500);

  // Auto-generate internal code when category/department changes
  useEffect(() => {
    if (category && department && !internalCode) {
      const suggested = generateInternalCode(category, department);
      setValue("codes.internal", suggested);
    }
  }, [category, department, internalCode, setValue]);

  // Check code uniqueness
  useEffect(() => {
    if (debouncedCode && debouncedCode.length >= 3) {
      setCheckingCode(true);
      setCodeError("");
      
      checkInternalCodeUnique(debouncedCode)
        .then((result) => {
          if (!result.unique) {
            setCodeError("This code is already in use");
          }
        })
        .catch(() => {
          setCodeError("Failed to check code availability");
        })
        .finally(() => {
          setCheckingCode(false);
        });
    }
  }, [debouncedCode]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue("tags", newTags);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setValue("category", value as any)}
              disabled={catLoading}
            >
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <Label htmlFor="department">
              Department <span className="text-destructive">*</span>
            </Label>
            <Select
              value={department}
              onValueChange={(value) => setValue("department", value)}
              disabled={deptLoading}
            >
              <SelectTrigger id="department" className="mt-1">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-xs text-destructive mt-1">{errors.department.message}</p>
            )}
          </div>

          {/* Item Name */}
          <div className="md:col-span-2">
            <Label htmlFor="name">
              Item Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Complete Blood Count (CBC)"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the service or item"
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Codes & Classification</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Internal Code */}
          <div>
            <Label htmlFor="internal-code">
              Internal Code <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="internal-code"
                {...register("codes.internal")}
                placeholder="AUTO-GENERATED"
                className="uppercase"
              />
              {checkingCode && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {codeError && (
              <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>{codeError}</span>
              </div>
            )}
            {errors.codes?.internal && (
              <p className="text-xs text-destructive mt-1">{errors.codes.internal.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Auto-generated, can be edited
            </p>
          </div>

          {/* CPT Code */}
          <div>
            <Label htmlFor="cpt-code">CPT Code</Label>
            <Input
              id="cpt-code"
              {...register("codes.cpt")}
              placeholder="e.g., 85025"
              className="mt-1"
            />
          </div>

          {/* ICD Code */}
          <div>
            <Label htmlFor="icd-code">ICD Code</Label>
            <Input
              id="icd-code"
              {...register("codes.icd")}
              placeholder="e.g., Z00.00"
              className="mt-1"
            />
          </div>

          {/* HCPCS Code */}
          <div>
            <Label htmlFor="hcpcs-code">HCPCS Code</Label>
            <Input
              id="hcpcs-code"
              {...register("codes.hcpcs")}
              placeholder="e.g., G0001"
              className="mt-1"
            />
          </div>

          {/* Unit */}
          <div>
            <Label htmlFor="unit">
              Unit <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("unit")}
              onValueChange={(value) => setValue("unit", value as any)}
            >
              <SelectTrigger id="unit" className="mt-1">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="each">Each</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="package">Package</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
              </SelectContent>
            </Select>
            {errors.unit && (
              <p className="text-xs text-destructive mt-1">{errors.unit.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tags (press Enter)"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Visibility & Patient Information</h3>

        <div className="space-y-4">
          {/* Visibility */}
          <div>
            <Label>
              Visibility <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={visibility}
              onValueChange={(value) => setValue("visibility", value as any)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="vis-admin" />
                <Label htmlFor="vis-admin" className="font-normal cursor-pointer">
                  Admin Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="staff" id="vis-staff" />
                <Label htmlFor="vis-staff" className="font-normal cursor-pointer">
                  Staff (Internal)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="portal" id="vis-portal" />
                <Label htmlFor="vis-portal" className="font-normal cursor-pointer">
                  Patient Portal (Public)
                </Label>
              </div>
            </RadioGroup>
            {errors.visibility && (
              <p className="text-xs text-destructive mt-1">{errors.visibility.message}</p>
            )}
          </div>

          {/* Patient Description - shown only if visibility is portal */}
          {visibility === "portal" && (
            <div>
              <Label htmlFor="patient-description">
                Patient-Facing Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="patient-description"
                {...register("patientDescription")}
                placeholder="Clear, patient-friendly description (min 20 characters)"
                className="mt-1"
                rows={4}
              />
              {errors.patientDescription && (
                <p className="text-xs text-destructive mt-1">
                  {errors.patientDescription.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                This will be visible to patients on the portal
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
