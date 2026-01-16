import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  "Outpatient Care",
  "Inpatient Care",
  "Diagnostics",
];

interface AppointmentTabsProps {
  onTabChange?: (value: string) => void;
}

export function AppointmentTabs({ onTabChange }: AppointmentTabsProps) {
  return (
    <Tabs defaultValue="outpatient-care" className="w-full" onValueChange={onTabChange}>
      <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category.toLowerCase().replace(/ /g, "-")}
            className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3"
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
