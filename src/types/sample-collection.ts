export type SampleStatus = "pending" | "collected";

export interface Sample {
  sampleId: string;
  orderId: string;
  specimenType: string;
  collectedBy: string;
  collectedAt: Date;
  testIds: string[];
  barcodeSvg?: string;
}

export interface TestSampleStatus {
  testId: string;
  status: SampleStatus;
  sampleId: string | null;
}

export interface Technician {
  id: string;
  name: string;
}

export const TECHNICIANS: Technician[] = [
  { id: "tech-1", name: "Tech. Kumar" },
  { id: "tech-2", name: "Tech. Sharma" },
  { id: "tech-3", name: "Tech. Patel" },
  { id: "tech-4", name: "Tech. Singh" },
  { id: "tech-5", name: "Tech. Reddy" },
];
