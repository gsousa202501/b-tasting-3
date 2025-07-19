export interface TastingSession {
  codSessaoDegustacao: string;
  nome: string;
  data: string;
  horario: string;
  tipo: 'routine' | 'extra';
  status: 'draft' | 'active' | 'completed' | 'nao_iniciado';
  amostras: Sample[];
  degustadores: Taster[];
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Sample {
  id: string;
  code: string;
  description: string;
  productionDate: string;
  expirationDate: string;
  batch: string;
  type: string;
  order?: number;
  specifications?: SampleSpecifications;
}

export interface SampleSpecifications {
  ph?: number;
  color?: number;
  bitterness?: number;
  alcoholContent?: number;
  density?: number;
  temperature?: number;
  clarity?: 'cristalina' | 'turva' | 'opaca';
  aroma?: {
    intensity: number;
    quality: number;
    notes?: string;
  };
  taste?: {
    sweetness: number;
    acidity: number;
    bitterness: number;
    body: number;
  };
  appearance?: {
    foam: number;
    retention: number;
    lacing: number;
  };
}

export interface Taster {
  id: string;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
}

export interface TasterEvaluation {
  id: string;
  sessionId: string;
  tasterId: string;
  sampleId: string;
  result: 'conforme' | 'nao-conforme';
  observations?: string;
  evaluatedAt: string;
}

export interface SampleEvaluation {
  id: string;
  sampleId: string;
  sessionId: string;
  status: 'conforme' | 'nao-conforme';
  comment?: string;
  isExcluded?: boolean; // Indica se a amostra deve ser excluída temporariamente da finalização
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface SampleStatus {
  id: string;
  sampleId: string;
  isFinalized?: boolean; // Flag que indica se a amostra já foi finalizada (bloqueia automaticamente)
  finalizedAt?: string;
  finalizedBy?: string;
}
export interface SessionFormData {
  step: number;
  sessionData: {
    name: string;
    date: string;
    time: string;
    type: 'routine' | 'extra';
    startDate?: string;
    endDate?: string;
  };
  selectedSamples: Sample[];
  orderedSamples: Sample[];
  selectedTasters: Taster[];
  observations: string;
}