import { useState, useCallback, useMemo } from "react";
import { Sample, SampleStatus, TestSampleStatus } from "@/types/sample-collection";

interface UseSampleCollectionProps {
  orderId: string;
  testIds: string[];
  specimenType: string;
}

// Generate a unique sample ID (mock implementation)
function generateSampleId(): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `S-${num}`;
}

// Generate a simple barcode SVG (Code 128 style representation)
function generateBarcodeSvg(sampleId: string): string {
  const bars: string[] = [];
  const barWidth = 2;
  let x = 10;
  
  // Simple representation - alternating bars based on character codes
  for (let i = 0; i < sampleId.length; i++) {
    const charCode = sampleId.charCodeAt(i);
    const pattern = charCode.toString(2).padStart(8, "0");
    
    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] === "1") {
        bars.push(`<rect x="${x}" y="10" width="${barWidth}" height="60" fill="black"/>`);
      }
      x += barWidth;
    }
    x += barWidth; // gap between characters
  }
  
  const width = x + 10;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 100" width="${width}" height="100">
    <rect x="0" y="0" width="${width}" height="100" fill="white"/>
    ${bars.join("")}
    <text x="${width / 2}" y="90" text-anchor="middle" font-family="monospace" font-size="12">${sampleId}</text>
  </svg>`;
}

export function useSampleCollection({ orderId, testIds, specimenType }: UseSampleCollectionProps) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [testStatuses, setTestStatuses] = useState<Map<string, TestSampleStatus>>(() => {
    const map = new Map<string, TestSampleStatus>();
    testIds.forEach((testId) => {
      map.set(testId, { testId, status: "pending", sampleId: null });
    });
    return map;
  });

  // Get status for a specific test
  const getTestStatus = useCallback(
    (testId: string): TestSampleStatus => {
      return testStatuses.get(testId) || { testId, status: "pending", sampleId: null };
    },
    [testStatuses]
  );

  // Get sample for a specific test
  const getSampleForTest = useCallback(
    (testId: string): Sample | null => {
      const status = testStatuses.get(testId);
      if (!status?.sampleId) return null;
      return samples.find((s) => s.sampleId === status.sampleId) || null;
    },
    [testStatuses, samples]
  );

  // Check if all tests are collected
  const allTestsCollected = useMemo(() => {
    return Array.from(testStatuses.values()).every((s) => s.status === "collected");
  }, [testStatuses]);

  // Check if any test is collected
  const hasCollectedTests = useMemo(() => {
    return Array.from(testStatuses.values()).some((s) => s.status === "collected");
  }, [testStatuses]);

  // Get tests grouped by panel with their collection status
  const getTestsWithStatus = useCallback(
    (testIdsToCheck: string[]): TestSampleStatus[] => {
      return testIdsToCheck.map((testId) => getTestStatus(testId));
    },
    [getTestStatus]
  );

  // Collect samples for selected tests
  const collectSample = useCallback(
    (
      selectedTestIds: string[],
      collectedBy: string,
      collectedAt: Date
    ): { sample: Sample; barcodeSvg: string } | null => {
      if (selectedTestIds.length === 0) return null;

      const sampleId = generateSampleId();
      const barcodeSvg = generateBarcodeSvg(sampleId);

      const newSample: Sample = {
        sampleId,
        orderId,
        specimenType,
        collectedBy,
        collectedAt,
        testIds: selectedTestIds,
        barcodeSvg,
      };

      setSamples((prev) => [...prev, newSample]);

      setTestStatuses((prev) => {
        const newMap = new Map(prev);
        selectedTestIds.forEach((testId) => {
          newMap.set(testId, { testId, status: "collected", sampleId });
        });
        return newMap;
      });

      return { sample: newSample, barcodeSvg };
    },
    [orderId, specimenType]
  );

  // Get existing sample for a set of tests (if all are already collected under the same sample)
  const getExistingSampleForTests = useCallback(
    (selectedTestIds: string[]): Sample | null => {
      if (selectedTestIds.length === 0) return null;

      const sampleIds = new Set<string>();
      for (const testId of selectedTestIds) {
        const status = testStatuses.get(testId);
        if (status?.sampleId) {
          sampleIds.add(status.sampleId);
        }
      }

      // If all selected tests belong to the same sample
      if (sampleIds.size === 1) {
        const sampleId = Array.from(sampleIds)[0];
        return samples.find((s) => s.sampleId === sampleId) || null;
      }

      return null;
    },
    [testStatuses, samples]
  );

  // Add new test IDs to tracking (when tests are added dynamically)
  const addTestToTracking = useCallback((testId: string) => {
    setTestStatuses((prev) => {
      if (prev.has(testId)) return prev;
      const newMap = new Map(prev);
      newMap.set(testId, { testId, status: "pending", sampleId: null });
      return newMap;
    });
  }, []);

  return {
    samples,
    testStatuses,
    getTestStatus,
    getSampleForTest,
    allTestsCollected,
    hasCollectedTests,
    getTestsWithStatus,
    collectSample,
    getExistingSampleForTests,
    addTestToTracking,
  };
}
