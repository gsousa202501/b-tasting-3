export interface SampleMonitoring {
  id: string;
  sampleCode: string;
  productName: string;
  batch: string;
  productionDate: string;
  expirationDate: string;
  sensorySpecs: SensorySpecifications;
  criticalLimits: CriticalLimits;
  specialObservations: string[];
  complianceStatus: ComplianceStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastEvaluation?: string;
  evaluatedBy?: string;
}

export interface SensorySpecifications {
  color: {
    expected: string;
    range: { min: number; max: number };
    unit: 'EBC' | 'SRM';
    current?: number;
    status: 'compliant' | 'non-compliant' | 'pending';
  };
  aroma: {
    intensity: { min: number; max: number };
    quality: { min: number; max: number };
    notes: string[];
    current?: { intensity: number; quality: number };
    status: 'compliant' | 'non-compliant' | 'pending';
  };
  flavor: {
    sweetness: { min: number; max: number };
    bitterness: { min: number; max: number };
    acidity: { min: number; max: number };
    body: { min: number; max: number };
    current?: {
      sweetness: number;
      bitterness: number;
      acidity: number;
      body: number;
    };
    status: 'compliant' | 'non-compliant' | 'pending';
  };
  texture: {
    carbonation: { min: number; max: number };
    mouthfeel: string[];
    foam: { retention: number; quality: number };
    current?: {
      carbonation: number;
      mouthfeel: string;
      foam: { retention: number; quality: number };
    };
    status: 'compliant' | 'non-compliant' | 'pending';
  };
}

export interface CriticalLimits {
  microbiological: {
    totalCount: { max: number; unit: 'CFU/mL' };
    yeastMold: { max: number; unit: 'CFU/mL' };
    bacteria: { max: number; unit: 'CFU/mL' };
  };
  chemical: {
    ph: { min: number; max: number };
    alcohol: { min: number; max: number };
    so2: { max: number; unit: 'ppm' };
  };
  physical: {
    turbidity: { max: number; unit: 'NTU' };
    temperature: { min: number; max: number; unit: '°C' };
  };
}

export interface ComplianceStatus {
  overall: 'compliant' | 'non-compliant' | 'pending' | 'critical';
  sensory: 'compliant' | 'non-compliant' | 'pending';
  safety: 'compliant' | 'non-compliant' | 'pending';
  quality: 'compliant' | 'non-compliant' | 'pending';
  score: number; // 0-100
}

export interface MonitoringFilters {
  status: string[];
  priority: string[];
  dateRange: { start: string; end: string } | null;
  productType: string[];
  searchTerm: string;
}

export interface MonitoringView {
  layout: 'table' | 'grid' | 'cards';
  groupBy: 'none' | 'status' | 'priority' | 'product' | 'batch';
  sortBy: 'code' | 'priority' | 'date' | 'status' | 'score';
  sortOrder: 'asc' | 'desc';
}