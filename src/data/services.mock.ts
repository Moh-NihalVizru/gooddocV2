import { ServiceItem } from "@/types/booking/ipAdmission";

export type ServiceSubCategory = {
  id: string;
  name: string;
  category: string;
};

// Comprehensive hospital services catalog
export const MOCK_SERVICES: ServiceItem[] = [
  // Procedures - Surgical
  { id: 'SRV001', code: 'PROC-APP', name: 'Appendectomy', category: 'Procedure', subCategory: 'Surgical', price: 35000, taxPct: 12, description: 'Surgical removal of appendix' },
  { id: 'SRV002', code: 'PROC-CATH', name: 'Cardiac Catheterization', category: 'Procedure', subCategory: 'Cardiology', price: 28000, taxPct: 12, description: 'Diagnostic heart procedure' },
  { id: 'SRV007', code: 'PROC-DRESS', name: 'Wound Dressing', category: 'Procedure', subCategory: 'Minor', price: 700, taxPct: 5, description: 'Wound cleaning and dressing change' },
  { id: 'SRV009', code: 'PROC-NEB', name: 'Nebulization', category: 'Procedure', subCategory: 'Respiratory', price: 300, taxPct: 5, description: 'Medication delivery via nebulizer' },
  { id: 'SRV011', code: 'PROC-SUTURE', name: 'Suturing', category: 'Procedure', subCategory: 'Minor', price: 1500, taxPct: 5, description: 'Wound closure with sutures' },
  { id: 'SRV016', code: 'PROC-ENDO', name: 'Upper GI Endoscopy', category: 'Procedure', subCategory: 'Gastro', price: 8500, taxPct: 12, description: 'Diagnostic endoscopy' },
  { id: 'SRV017', code: 'PROC-COLON', name: 'Colonoscopy', category: 'Procedure', subCategory: 'Gastro', price: 12000, taxPct: 12, description: 'Colon examination' },
  { id: 'SRV018', code: 'PROC-BIOPSY', name: 'Tissue Biopsy', category: 'Procedure', subCategory: 'Surgical', price: 4500, taxPct: 12, description: 'Tissue sample collection' },
  { id: 'SRV019', code: 'PROC-DIALYSIS', name: 'Hemodialysis Session', category: 'Procedure', subCategory: 'Nephrology', price: 3500, taxPct: 5, description: '4-hour dialysis session' },
  { id: 'SRV020', code: 'PROC-ANGIO', name: 'Coronary Angiography', category: 'Procedure', subCategory: 'Cardiology', price: 22000, taxPct: 12, description: 'Heart vessel imaging' },
  { id: 'SRV021', code: 'PROC-STENT', name: 'Coronary Stenting', category: 'Procedure', subCategory: 'Cardiology', price: 185000, taxPct: 12, description: 'Angioplasty with stent placement' },
  { id: 'SRV022', code: 'PROC-PACEMAKER', name: 'Pacemaker Implantation', category: 'Procedure', subCategory: 'Cardiology', price: 250000, taxPct: 12, description: 'Cardiac pacemaker surgery' },
  
  // Laboratory Tests
  { id: 'SRV006', code: 'LAB-CBC', name: 'Complete Blood Count (CBC)', category: 'Lab', subCategory: 'Hematology', price: 450, taxPct: 0, description: 'Blood cell count analysis' },
  { id: 'SRV010', code: 'LAB-LFT', name: 'Liver Function Test (LFT)', category: 'Lab', subCategory: 'Biochemistry', price: 900, taxPct: 0, description: 'Liver enzyme panel' },
  { id: 'SRV013', code: 'LAB-URINE', name: 'Urine Routine & Microscopy', category: 'Lab', subCategory: 'Clinical Pathology', price: 300, taxPct: 0, description: 'Complete urine analysis' },
  { id: 'SRV023', code: 'LAB-KFT', name: 'Kidney Function Test (KFT)', category: 'Lab', subCategory: 'Biochemistry', price: 800, taxPct: 0, description: 'Creatinine, urea, BUN' },
  { id: 'SRV024', code: 'LAB-LIPID', name: 'Lipid Profile', category: 'Lab', subCategory: 'Biochemistry', price: 650, taxPct: 0, description: 'Cholesterol panel' },
  { id: 'SRV025', code: 'LAB-THYROID', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Lab', subCategory: 'Endocrinology', price: 1200, taxPct: 0, description: 'Thyroid hormone levels' },
  { id: 'SRV026', code: 'LAB-HBA1C', name: 'HbA1c (Glycated Hemoglobin)', category: 'Lab', subCategory: 'Endocrinology', price: 550, taxPct: 0, description: '3-month blood sugar average' },
  { id: 'SRV027', code: 'LAB-TROP', name: 'Troponin I (Cardiac Biomarker)', category: 'Lab', subCategory: 'Cardiac Markers', price: 1200, taxPct: 0, description: 'Heart attack marker' },
  { id: 'SRV028', code: 'LAB-DIMER', name: 'D-Dimer', category: 'Lab', subCategory: 'Coagulation', price: 1500, taxPct: 0, description: 'Blood clot marker' },
  { id: 'SRV029', code: 'LAB-ESR', name: 'ESR (Erythrocyte Sedimentation Rate)', category: 'Lab', subCategory: 'Hematology', price: 150, taxPct: 0, description: 'Inflammation marker' },
  { id: 'SRV030', code: 'LAB-COAG', name: 'Coagulation Profile (PT/INR)', category: 'Lab', subCategory: 'Coagulation', price: 800, taxPct: 0, description: 'Blood clotting time' },
  { id: 'SRV031', code: 'LAB-CULTURE', name: 'Blood Culture & Sensitivity', category: 'Lab', subCategory: 'Microbiology', price: 1800, taxPct: 0, description: 'Bacterial infection test' },
  { id: 'SRV032', code: 'LAB-ABG', name: 'Arterial Blood Gas (ABG)', category: 'Lab', subCategory: 'Critical Care', price: 600, taxPct: 0, description: 'Oxygen and pH levels' },
  
  // Radiology & Imaging
  { id: 'SRV033', code: 'RAD-XRAY', name: 'X-Ray (Single View)', category: 'Radiology', subCategory: 'X-Ray', price: 450, taxPct: 5, description: 'Single view radiograph' },
  { id: 'SRV034', code: 'RAD-XRAY2', name: 'X-Ray (Two Views)', category: 'Radiology', subCategory: 'X-Ray', price: 700, taxPct: 5, description: 'AP and lateral views' },
  { id: 'SRV035', code: 'RAD-USG-ABD', name: 'USG Abdomen & Pelvis', category: 'Radiology', subCategory: 'Ultrasound', price: 1200, taxPct: 5, description: 'Abdominal ultrasound scan' },
  { id: 'SRV036', code: 'RAD-USG-OBS', name: 'USG Obstetric (Pregnancy)', category: 'Radiology', subCategory: 'Ultrasound', price: 1500, taxPct: 5, description: 'Fetal ultrasound' },
  { id: 'SRV037', code: 'RAD-CT-HEAD', name: 'CT Scan - Head/Brain', category: 'Radiology', subCategory: 'CT Scan', price: 4500, taxPct: 12, description: 'Brain CT without contrast' },
  { id: 'SRV038', code: 'RAD-CT-CHEST', name: 'CT Scan - Chest (HRCT)', category: 'Radiology', subCategory: 'CT Scan', price: 5500, taxPct: 12, description: 'High resolution chest CT' },
  { id: 'SRV039', code: 'RAD-CT-ABD', name: 'CT Scan - Abdomen', category: 'Radiology', subCategory: 'CT Scan', price: 6500, taxPct: 12, description: 'Abdominal CT with contrast' },
  { id: 'SRV040', code: 'RAD-MRI-BRAIN', name: 'MRI Brain', category: 'Radiology', subCategory: 'MRI', price: 8500, taxPct: 12, description: 'Brain MRI without contrast' },
  { id: 'SRV041', code: 'RAD-MRI-SPINE', name: 'MRI Spine (Single Region)', category: 'Radiology', subCategory: 'MRI', price: 9000, taxPct: 12, description: 'Cervical/Thoracic/Lumbar MRI' },
  { id: 'SRV042', code: 'RAD-ECG', name: 'ECG - 12 Lead', category: 'Radiology', subCategory: 'Cardiac', price: 350, taxPct: 5, description: 'Electrocardiogram' },
  { id: 'SRV043', code: 'RAD-ECHO', name: '2D Echocardiography', category: 'Radiology', subCategory: 'Cardiac', price: 2500, taxPct: 12, description: 'Heart ultrasound' },
  { id: 'SRV044', code: 'RAD-TMT', name: 'Treadmill Test (TMT/Stress Test)', category: 'Radiology', subCategory: 'Cardiac', price: 2000, taxPct: 12, description: 'Exercise stress test' },
  { id: 'SRV045', code: 'RAD-DEXA', name: 'DEXA Bone Density Scan', category: 'Radiology', subCategory: 'Special', price: 2200, taxPct: 12, description: 'Osteoporosis screening' },
  { id: 'SRV046', code: 'RAD-MAMMO', name: 'Digital Mammography (Bilateral)', category: 'Radiology', subCategory: 'Special', price: 2500, taxPct: 12, description: 'Breast cancer screening' },
  
  // Pharmacy & Consumables
  { id: 'SRV008', code: 'PHARM-ANTB', name: 'Antibiotic IV (per dose)', category: 'Pharmacy', subCategory: 'Antibiotics', price: 350, taxPct: 5, description: 'Injectable antibiotic' },
  { id: 'SRV012', code: 'PHARM-PAIN', name: 'Pain Relief IV (per dose)', category: 'Pharmacy', subCategory: 'Analgesics', price: 250, taxPct: 5, description: 'Injectable analgesic' },
  { id: 'SRV047', code: 'PHARM-INSULIN', name: 'Insulin (per unit)', category: 'Pharmacy', subCategory: 'Diabetic', price: 45, taxPct: 0, description: 'Regular/rapid acting insulin' },
  { id: 'SRV048', code: 'PHARM-BLOOD', name: 'Blood Transfusion (per unit)', category: 'Pharmacy', subCategory: 'Blood Products', price: 1500, taxPct: 0, description: 'Packed RBC transfusion' },
  { id: 'SRV049', code: 'PHARM-IV-SET', name: 'IV Infusion Set', category: 'Pharmacy', subCategory: 'Consumables', price: 180, taxPct: 5, description: 'Disposable IV set' },
  { id: 'SRV050', code: 'PHARM-CATH', name: 'Foley Catheter Kit', category: 'Pharmacy', subCategory: 'Consumables', price: 450, taxPct: 5, description: 'Urinary catheter with bag' },
  { id: 'SRV051', code: 'PHARM-OXYGEN', name: 'Oxygen Therapy (per hour)', category: 'Pharmacy', subCategory: 'Respiratory', price: 150, taxPct: 5, description: 'Medical oxygen supply' },
  { id: 'SRV052', code: 'PHARM-SYRINGE', name: 'Syringe Pack (per day)', category: 'Pharmacy', subCategory: 'Consumables', price: 120, taxPct: 5, description: 'Disposable syringes' },
  
  // Nursing Services
  { id: 'SRV003', code: 'NURS-CHG', name: 'General Nursing Care (per day)', category: 'Nursing', subCategory: 'General', price: 1200, taxPct: 5, description: 'Basic nursing care' },
  { id: 'SRV014', code: 'NURS-IV', name: 'IV Cannulation & Monitoring', category: 'Nursing', subCategory: 'Procedures', price: 800, taxPct: 5, description: 'IV line management' },
  { id: 'SRV053', code: 'NURS-ICU', name: 'ICU Nursing Care (per day)', category: 'Nursing', subCategory: 'Critical Care', price: 3500, taxPct: 5, description: 'Intensive care nursing' },
  { id: 'SRV054', code: 'NURS-VENTILATOR', name: 'Ventilator Care (per day)', category: 'Nursing', subCategory: 'Critical Care', price: 5000, taxPct: 5, description: 'Mechanical ventilation support' },
  { id: 'SRV055', code: 'NURS-INJECTION', name: 'Injection Administration', category: 'Nursing', subCategory: 'Procedures', price: 100, taxPct: 5, description: 'IM/SC injection' },
  { id: 'SRV056', code: 'NURS-PHYSIO', name: 'Physiotherapy Session', category: 'Nursing', subCategory: 'Rehabilitation', price: 600, taxPct: 5, description: 'Physical therapy session' },
  { id: 'SRV057', code: 'NURS-CATHCARE', name: 'Catheter Care (per day)', category: 'Nursing', subCategory: 'Procedures', price: 350, taxPct: 5, description: 'Urinary catheter maintenance' },
  
  // Room & Bed Charges
  { id: 'SRV015', code: 'ROOM-GEN', name: 'General Ward (per day)', category: 'Room', subCategory: 'Ward', price: 1500, taxPct: 12, description: '6-8 bed ward' },
  { id: 'SRV004', code: 'ROOM-SEM', name: 'Semi-Private Room (per day)', category: 'Room', subCategory: 'Room', price: 2500, taxPct: 12, description: '2-bed shared room' },
  { id: 'SRV005', code: 'ROOM-PRI', name: 'Private Room (per day)', category: 'Room', subCategory: 'Room', price: 5000, taxPct: 12, description: 'Single occupancy room' },
  { id: 'SRV058', code: 'ROOM-DELUXE', name: 'Deluxe Room (per day)', category: 'Room', subCategory: 'Premium', price: 8000, taxPct: 12, description: 'Premium single room with amenities' },
  { id: 'SRV059', code: 'ROOM-SUITE', name: 'Suite Room (per day)', category: 'Room', subCategory: 'Premium', price: 15000, taxPct: 12, description: 'Luxury suite with attendant bed' },
  { id: 'SRV060', code: 'ROOM-ICU', name: 'ICU Bed (per day)', category: 'Room', subCategory: 'Critical Care', price: 12000, taxPct: 12, description: 'Intensive care unit bed' },
  { id: 'SRV061', code: 'ROOM-NICU', name: 'NICU (per day)', category: 'Room', subCategory: 'Critical Care', price: 15000, taxPct: 12, description: 'Neonatal intensive care' },
  { id: 'SRV062', code: 'ROOM-LABOR', name: 'Labor Room (per use)', category: 'Room', subCategory: 'Maternity', price: 5000, taxPct: 12, description: 'Delivery room charges' },
  { id: 'SRV063', code: 'ROOM-OT', name: 'Operation Theatre (per hour)', category: 'Room', subCategory: 'OT', price: 8000, taxPct: 12, description: 'Operating room charges' },
  
  // Consultation
  { id: 'SRV064', code: 'CONS-GEN', name: 'General Physician Consultation', category: 'Consultation', subCategory: 'OPD', price: 500, taxPct: 0, description: 'GP visit' },
  { id: 'SRV065', code: 'CONS-SPEC', name: 'Specialist Consultation', category: 'Consultation', subCategory: 'OPD', price: 1000, taxPct: 0, description: 'Specialist doctor visit' },
  { id: 'SRV066', code: 'CONS-SUPER', name: 'Super Specialist Consultation', category: 'Consultation', subCategory: 'OPD', price: 1500, taxPct: 0, description: 'Senior specialist visit' },
  { id: 'SRV067', code: 'CONS-IPD', name: 'IPD Daily Visit', category: 'Consultation', subCategory: 'IPD', price: 800, taxPct: 0, description: 'Doctor daily round' },
  { id: 'SRV068', code: 'CONS-EMERG', name: 'Emergency Consultation', category: 'Consultation', subCategory: 'Emergency', price: 1200, taxPct: 0, description: 'Emergency doctor visit' },
];

export const SERVICE_CATEGORIES = [
  { id: 'Procedure', name: 'Procedures', icon: 'stethoscope', color: 'bg-blue-500' },
  { id: 'Lab', name: 'Laboratory', icon: 'flask', color: 'bg-purple-500' },
  { id: 'Radiology', name: 'Radiology', icon: 'scan', color: 'bg-amber-500' },
  { id: 'Pharmacy', name: 'Pharmacy', icon: 'pill', color: 'bg-green-500' },
  { id: 'Nursing', name: 'Nursing', icon: 'heart-pulse', color: 'bg-pink-500' },
  { id: 'Room', name: 'Room & Bed', icon: 'bed', color: 'bg-cyan-500' },
  { id: 'Consultation', name: 'Consultation', icon: 'user-round', color: 'bg-indigo-500' },
];

export function searchServices(query: string, categories: string[]): ServiceItem[] {
  const lowerQuery = query.toLowerCase().trim();
  
  return MOCK_SERVICES.filter((service) => {
    const matchesQuery = !lowerQuery || 
      service.name.toLowerCase().includes(lowerQuery) ||
      service.code.toLowerCase().includes(lowerQuery) ||
      (service.description?.toLowerCase().includes(lowerQuery));
    
    const matchesCategory = categories.length === 0 || categories.includes(service.category);
    
    return matchesQuery && matchesCategory;
  });
}

export function getServicesByCategory(category: string): ServiceItem[] {
  return MOCK_SERVICES.filter(s => s.category === category);
}

export function getSubCategories(category: string): string[] {
  const services = getServicesByCategory(category);
  return [...new Set(services.map(s => s.subCategory).filter(Boolean) as string[])];
}
