export interface TastingSpecification {
  id: string;
  name: string;
  description: string;
  testType: 'sensory' | 'chemical' | 'microbiological' | 'physical';
  unit?: string;
  expectedRange?: {
    min: number;
    max: number;
  };
  criticalLimit?: number;
  methodology: string;
  isRequired: boolean;
  order: number;
}

export interface TastingSessionSample extends Sample {
  sessionId: string;
  evaluationResults: TastingEvaluationResult[];
  specifications: TastingSpecification[];
  groupCategory?: string;
  customAttributes?: Record<string, any>;
}

export interface TastingEvaluationResult {
  id: string;
  sampleId: string;
  specificationId: string;
  value: number | string | boolean;
  status: 'compliant' | 'non-compliant' | 'pending' | 'not-tested';
  evaluatedBy: string;
  evaluatedAt: string;
  notes?: string;
  confidence?: number;
}

export interface TastingViewConfiguration {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  groupBy: string[];
  sortBy: { field: string; direction: 'asc' | 'desc' }[];
  visibleColumns: string[];
  filters: TastingFilter[];
  isTransposed: boolean;
  columnOrder: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TastingFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  isActive: boolean;
}

export interface TastingGroupConfig {
  field: string;
  label: string;
  type: 'category' | 'range' | 'date' | 'status';
  options?: string[];
  ranges?: { min: number; max: number; label: string }[];
}

export interface TransposedTastingData {
  sampleId: string;
  sampleCode: string;
  sampleType: string;
  batch: string;
  groupCategory?: string;
  [specificationName: string]: any;
}

export interface TastingDataExport {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeMetadata: boolean;
  includeFilters: boolean;
  groupedData: boolean;
  selectedColumns?: string[];
}