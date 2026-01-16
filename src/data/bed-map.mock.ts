// Theater-seat Bed Map Mock Data

export type BedStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
export type BedType = 'ICU' | 'HDU' | 'Ward' | 'Private' | 'Isolation';

export interface BedOccupant {
  id: string;
  name: string;
  mrn: string;
  since: string; // ISO date
  acuity?: 'Low' | 'Medium' | 'High' | 'Critical';
  diagnosis?: string;
  attendingDoctor?: string;
}

export interface BedMapItem {
  id: string;
  bedNumber: string;
  floor: string;
  floorName: string;
  wardId: string;
  wardName: string;
  roomNumber: string;
  type: BedType;
  pricePerDay: number;
  amenities: string[];
  status: BedStatus;
  occupant: BedOccupant | null;
  lastCleanedAt: string | null;
  notes: string;
  position: { row: number; col: number }; // for grid positioning
}

export interface WardInfo {
  id: string;
  name: string;
  floor: string;
  type: BedType;
  pricePerDay: number;
  totalBeds: number;
  occupiedBeds: number;
  beds: BedMapItem[];
}

export interface FloorInfo {
  id: string;
  name: string;
  wards: WardInfo[];
}

// Helper functions
const generateMRN = (idx: number) => `MRN${String(100000 + idx).padStart(7, '0')}`;
const names = ['Amit Sharma', 'Priya Patel', 'Rahul Reddy', 'Sneha Kumar', 'Vikram Singh', 'Anjali Nair', 'Karthik Menon', 'Divya Rao', 'Suresh Gupta', 'Lakshmi Joshi', 'Rajan Iyer', 'Meena Bhat', 'Arjun Verma', 'Kavitha Mishra', 'Sanjay Das'];
const doctors = ['Dr. Meera Nair', 'Dr. Rajesh Kumar', 'Dr. Anita Singh', 'Dr. Sunil Reddy', 'Dr. Prakash Shah'];
const diagnoses = ['Hypertension', 'Type 2 Diabetes', 'COPD', 'Coronary Artery Disease', 'Pneumonia', 'Appendicitis', 'Fracture - Femur', 'Post-Op Recovery'];
const amenities = ['O2', 'Ventilator', 'Monitor', 'IV Pump', 'Suction', 'Negative Pressure'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateOccupant(idx: number): BedOccupant {
  const daysAgo = Math.floor(Math.random() * 10) + 1;
  const admitDate = new Date();
  admitDate.setDate(admitDate.getDate() - daysAgo);
  
  return {
    id: `PAT-${1000 + idx}`,
    name: names[idx % names.length],
    mrn: generateMRN(idx),
    since: admitDate.toISOString(),
    acuity: (['Low', 'Medium', 'High', 'Critical'] as const)[idx % 4],
    diagnosis: diagnoses[idx % diagnoses.length],
    attendingDoctor: doctors[idx % doctors.length],
  };
}

// Price by bed type
const priceMap: Record<BedType, number> = {
  ICU: 15000,
  HDU: 10000,
  Ward: 2500,
  Private: 8000,
  Isolation: 6000,
};

// Amenities by bed type
const amenitiesByType: Record<BedType, string[]> = {
  ICU: ['O2', 'Ventilator', 'Monitor', 'IV Pump', 'Suction'],
  HDU: ['O2', 'Monitor', 'IV Pump'],
  Ward: ['O2'],
  Private: ['O2', 'Monitor'],
  Isolation: ['O2', 'Negative Pressure', 'Monitor'],
};

// Generate beds for a ward
function generateWardBeds(
  floor: string,
  floorName: string,
  wardId: string,
  wardName: string,
  type: BedType,
  count: number,
  startBedNo: number,
  occupancyRate: number
): BedMapItem[] {
  const beds: BedMapItem[] = [];
  let occupantIdx = 0;
  
  // Grid layout: 6 beds per row with aisle gaps
  const bedsPerRow = 6;
  
  for (let i = 0; i < count; i++) {
    const bedNumber = `${startBedNo + i}`;
    const row = Math.floor(i / bedsPerRow);
    const col = i % bedsPerRow;
    
    // Determine status based on distribution
    const rand = Math.random();
    let status: BedStatus;
    if (rand < occupancyRate) {
      status = 'occupied';
    } else if (rand < occupancyRate + 0.08) {
      status = 'reserved';
    } else if (rand < occupancyRate + 0.12) {
      status = 'cleaning';
    } else if (rand < occupancyRate + 0.15) {
      status = 'maintenance';
    } else {
      status = 'available';
    }
    
    const lastCleanedHours = Math.floor(Math.random() * 24) + 1;
    const lastCleaned = new Date();
    lastCleaned.setHours(lastCleaned.getHours() - lastCleanedHours);
    
    beds.push({
      id: `${floor}-${wardId}-${bedNumber}`,
      bedNumber,
      floor,
      floorName,
      wardId,
      wardName,
      roomNumber: `${wardId.charAt(0)}${Math.floor(i / 4) + 1}${String.fromCharCode(65 + (i % 4))}`,
      type,
      pricePerDay: priceMap[type],
      amenities: amenitiesByType[type] || [],
      status,
      occupant: status === 'occupied' ? generateOccupant(occupantIdx++) : null,
      lastCleanedAt: status !== 'occupied' ? lastCleaned.toISOString() : null,
      notes: status === 'maintenance' ? 'Scheduled maintenance - electrical check' : '',
      position: { row, col },
    });
  }
  
  return beds;
}

// Generate ward info
function generateWard(
  floor: string,
  floorName: string,
  wardId: string,
  wardName: string,
  type: BedType,
  bedCount: number,
  startBedNo: number,
  occupancyRate: number
): WardInfo {
  const beds = generateWardBeds(floor, floorName, wardId, wardName, type, bedCount, startBedNo, occupancyRate);
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  
  return {
    id: `${floor}-${wardId}`,
    name: wardName,
    floor,
    type,
    pricePerDay: priceMap[type],
    totalBeds: bedCount,
    occupiedBeds,
    beds,
  };
}

// Generate all floors and wards
export function generateBedMapData(): FloorInfo[] {
  return [
    {
      id: 'F1',
      name: 'Ground Floor',
      wards: [
        generateWard('F1', 'Ground Floor', 'ER', 'Emergency', 'Ward', 12, 1001, 0.75),
        generateWard('F1', 'Ground Floor', 'OBS', 'Observation', 'Ward', 8, 1013, 0.60),
      ],
    },
    {
      id: 'F2',
      name: 'First Floor',
      wards: [
        generateWard('F2', 'First Floor', 'ICU', 'Intensive Care Unit', 'ICU', 18, 2001, 0.85),
        generateWard('F2', 'First Floor', 'HDU', 'High Dependency Unit', 'HDU', 12, 2019, 0.70),
      ],
    },
    {
      id: 'F3',
      name: 'Second Floor',
      wards: [
        generateWard('F3', 'Second Floor', 'WARD-A', 'General Ward A', 'Ward', 24, 3001, 0.55),
        generateWard('F3', 'Second Floor', 'WARD-B', 'General Ward B', 'Ward', 24, 3025, 0.50),
      ],
    },
    {
      id: 'F4',
      name: 'Third Floor',
      wards: [
        generateWard('F4', 'Third Floor', 'PVT', 'Private Rooms', 'Private', 16, 4001, 0.65),
        generateWard('F4', 'Third Floor', 'ISO', 'Isolation Ward', 'Isolation', 8, 4017, 0.40),
      ],
    },
    {
      id: 'F5',
      name: 'Fourth Floor',
      wards: [
        generateWard('F5', 'Fourth Floor', 'SURG', 'Surgical Ward', 'Ward', 20, 5001, 0.60),
        generateWard('F5', 'Fourth Floor', 'ORTHO', 'Orthopedics', 'Ward', 16, 5021, 0.55),
      ],
    },
  ];
}

// Singleton data
export const bedMapData = generateBedMapData();

// Flat list of all beds
export const allBeds: BedMapItem[] = bedMapData.flatMap(floor => 
  floor.wards.flatMap(ward => ward.beds)
);

// Summary stats
export const bedStats = {
  total: allBeds.length,
  available: allBeds.filter(b => b.status === 'available').length,
  occupied: allBeds.filter(b => b.status === 'occupied').length,
  reserved: allBeds.filter(b => b.status === 'reserved').length,
  cleaning: allBeds.filter(b => b.status === 'cleaning').length,
  maintenance: allBeds.filter(b => b.status === 'maintenance').length,
};
