import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vitals } from "@/types/patient360";
import { Plus } from "lucide-react";

interface VitalsCardProps {
  vitals?: Vitals;
}

export function VitalsCard({ vitals }: VitalsCardProps) {
  const [unit, setUnit] = useState<"metric" | "us">("metric");

  if (!vitals) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">No vitals recorded</p>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Vitals
          </Button>
        </div>
      </Card>
    );
  }

  const convertTemp = (celsius: number) => {
    return unit === "metric" ? celsius : (celsius * 9) / 5 + 32;
  };

  const convertWeight = (kg: number) => {
    return unit === "metric" ? kg : kg * 2.20462;
  };

  const convertHeight = (cm: number) => {
    if (unit === "metric") return cm;
    const inches = cm / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}′${remainingInches}″`;
  };

  return (
    <Card className="p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Vitals Overview</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUnit(unit === "metric" ? "us" : "metric")}
        >
          <Badge variant="secondary" className="text-xs">
            {unit === "metric" ? "Metric" : "US"}
          </Badge>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Last Update: {new Date(vitals.recordedAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })}
      </p>

      <div className="space-y-3">
        {vitals.bpSystolic && vitals.bpDiastolic && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Blood Pressure</p>
            <p className="text-sm font-semibold text-foreground">
              {vitals.bpSystolic}/{vitals.bpDiastolic} <span className="font-normal text-muted-foreground">mmHg</span>
            </p>
          </div>
        )}

        {vitals.spo2 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">SpO₂</p>
            <p className="text-sm font-semibold text-foreground">
              {vitals.spo2}<span className="font-normal text-muted-foreground">%</span>
            </p>
          </div>
        )}

        {vitals.heartRate && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Heart Rate</p>
            <p className="text-sm font-semibold text-foreground">
              {vitals.heartRate} <span className="font-normal text-muted-foreground">bpm</span>
            </p>
          </div>
        )}

        {vitals.respiratoryRate && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Respiratory Rate</p>
            <p className="text-sm font-semibold text-foreground">
              {vitals.respiratoryRate} <span className="font-normal text-muted-foreground">bpm</span>
            </p>
          </div>
        )}

        {vitals.temperatureC && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Temperature</p>
            <p className="text-sm font-semibold text-foreground">
              {unit === "metric"
                ? `${vitals.temperatureC}°C`
                : `${convertTemp(vitals.temperatureC).toFixed(1)}°F`}
            </p>
          </div>
        )}

        {vitals.weightKg && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Weight</p>
            <p className="text-sm font-semibold text-foreground">
              {unit === "metric"
                ? `${vitals.weightKg} kg`
                : `${convertWeight(vitals.weightKg).toFixed(0)} lb`}
            </p>
          </div>
        )}

        {vitals.heightCm && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Height</p>
            <p className="text-sm font-semibold text-foreground">
              {unit === "metric"
                ? `${vitals.heightCm} cm`
                : convertHeight(vitals.heightCm)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
