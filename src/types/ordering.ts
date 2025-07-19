export interface OrderingCriterion {
  id: string;
  name: string;
  description: string;
  type: 'numeric' | 'date' | 'enum' | 'boolean';
  weight: number; // 1-100
  direction: 'asc' | 'desc';
  isActive: boolean;
  options?: string[]; // Para critérios do tipo enum
  dataPath: string; // Caminho para acessar o valor na amostra (ex: 'productionDate', 'quality.score')
  normalizationConfig?: {
    min?: number;
    max?: number;
    defaultValue?: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderingConfiguration {
  id: string;
  name: string;
  description: string;
  criteria: OrderingCriterion[];
  isDefault: boolean;
  sessionType?: 'routine' | 'extra' | 'all';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SampleScore {
  sampleId: string;
  totalScore: number;
  criteriaScores: {
    criterionId: string;
    rawValue: any;
    normalizedValue: number;
    weightedScore: number;
  }[];
  finalPosition: number;
}

export interface OrderingResult {
  configurationId: string;
  sessionId: string;
  orderedSamples: Sample[];
  scores: SampleScore[];
  appliedAt: string;
  generatedBy: string;
}

// Extensão da interface Sample existente
export interface EnhancedSample extends Sample {
  quality?: {
    score: number;
    conformity: 'conforme' | 'nao-conforme' | 'pendente';
    lastEvaluation?: string;
  };
  priority?: 'alta' | 'media' | 'baixa';
  temperature?: number;
  alcoholContent?: number;
  bitterness?: number;
  color?: number;
  clarity?: 'cristalina' | 'turva' | 'opaca';
  aroma?: {
    intensity: number;
    quality: number;
  };
  stability?: {
    microbiological: boolean;
    physical: boolean;
    chemical: boolean;
  };
  storageConditions?: {
    temperature: number;
    humidity: number;
    light: 'protegida' | 'exposta';
  };
  costPerUnit?: number;
  availableQuantity?: number;
  lastTested?: string;
  testFrequency?: number; // dias
  riskLevel?: 'baixo' | 'medio' | 'alto';
}