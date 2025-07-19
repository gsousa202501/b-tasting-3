import { SampleMonitoring } from '@/types/monitoring';
import { addDays, format } from 'date-fns';

const productTypes = ['IPA Premium', 'Pilsner Especial', 'Lager Tradicional', 'Weiss Artesanal', 'Porter Escuro'];
const priorities = ['low', 'medium', 'high', 'critical'] as const;
const statuses = ['compliant', 'non-compliant', 'pending', 'critical'] as const;

const generateSensorySpecs = () => ({
  color: {
    expected: 'Dourado claro',
    range: { min: 8, max: 12 },
    unit: 'EBC' as const,
    current: Math.random() * 4 + 8,
    status: ['compliant', 'non-compliant', 'pending'][Math.floor(Math.random() * 3)] as any
  },
  aroma: {
    intensity: { min: 6, max: 9 },
    quality: { min: 7, max: 10 },
    notes: ['Floral', 'Cítrico', 'Malte', 'Lúpulo'],
    current: {
      intensity: Math.random() * 3 + 6,
      quality: Math.random() * 3 + 7
    },
    status: ['compliant', 'non-compliant', 'pending'][Math.floor(Math.random() * 3)] as any
  },
  flavor: {
    sweetness: { min: 3, max: 6 },
    bitterness: { min: 4, max: 8 },
    acidity: { min: 2, max: 5 },
    body: { min: 5, max: 8 },
    current: {
      sweetness: Math.random() * 3 + 3,
      bitterness: Math.random() * 4 + 4,
      acidity: Math.random() * 3 + 2,
      body: Math.random() * 3 + 5
    },
    status: ['compliant', 'non-compliant', 'pending'][Math.floor(Math.random() * 3)] as any
  },
  texture: {
    carbonation: { min: 2.2, max: 2.8 },
    mouthfeel: ['Cremosa', 'Refrescante', 'Equilibrada'],
    foam: { retention: 120, quality: 8 },
    current: {
      carbonation: Math.random() * 0.6 + 2.2,
      mouthfeel: ['Cremosa', 'Refrescante', 'Equilibrada'][Math.floor(Math.random() * 3)],
      foam: { retention: Math.random() * 60 + 90, quality: Math.random() * 3 + 7 }
    },
    status: ['compliant', 'non-compliant', 'pending'][Math.floor(Math.random() * 3)] as any
  }
});

const generateCriticalLimits = () => ({
  microbiological: {
    totalCount: { max: 100, unit: 'CFU/mL' as const },
    yeastMold: { max: 10, unit: 'CFU/mL' as const },
    bacteria: { max: 5, unit: 'CFU/mL' as const }
  },
  chemical: {
    ph: { min: 3.8, max: 4.5 },
    alcohol: { min: 4.5, max: 6.5 },
    so2: { max: 10, unit: 'ppm' as const }
  },
  physical: {
    turbidity: { max: 5, unit: 'NTU' as const },
    temperature: { min: 2, max: 6, unit: '°C' as const }
  }
});

const generateComplianceStatus = () => {
  const sensory = ['compliant', 'non-compliant', 'pending'][Math.floor(Math.random() * 3)] as any;
  const safety = ['compliant', 'non-compliant', 'pending'][Math.floor(Math.random() * 3)] as any;
  const quality = ['compliant', 'non-compliant', 'pending'][Math.floor(Math.random() * 3)] as any;
  
  let overall: any = 'compliant';
  if (safety === 'non-compliant') overall = 'critical';
  else if (sensory === 'non-compliant' || quality === 'non-compliant') overall = 'non-compliant';
  else if (sensory === 'pending' || safety === 'pending' || quality === 'pending') overall = 'pending';
  
  const score = overall === 'critical' ? Math.random() * 30 :
                overall === 'non-compliant' ? Math.random() * 30 + 30 :
                overall === 'pending' ? Math.random() * 20 + 60 :
                Math.random() * 20 + 80;

  return {
    overall,
    sensory,
    safety,
    quality,
    score: Math.round(score)
  };
};

const specialObservations = [
  'Verificar estabilidade microbiológica',
  'Atenção especial ao aroma',
  'Monitorar carbonatação',
  'Avaliar cor após filtração',
  'Controle rigoroso de temperatura',
  'Amostra de lote especial',
  'Primeira produção da receita',
  'Teste de novo fornecedor de malte'
];

export const mockMonitoringData: SampleMonitoring[] = Array.from({ length: 32 }, (_, i) => {
  const productName = productTypes[Math.floor(Math.random() * productTypes.length)];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  const complianceStatus = generateComplianceStatus();
  
  return {
    id: `monitor-${i + 1}`,
    sampleCode: `BT-${String(i + 1).padStart(4, '0')}`,
    productName,
    batch: `L${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
    productionDate: format(addDays(new Date(), -Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
    expirationDate: format(addDays(new Date(), Math.floor(Math.random() * 90) + 30), 'yyyy-MM-dd'),
    sensorySpecs: generateSensorySpecs(),
    criticalLimits: generateCriticalLimits(),
    specialObservations: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 }, 
      () => specialObservations[Math.floor(Math.random() * specialObservations.length)]
    ),
    complianceStatus,
    priority,
    lastEvaluation: Math.random() > 0.3 ? new Date().toISOString() : undefined,
    evaluatedBy: Math.random() > 0.3 ? 'Degustador Principal' : undefined
  };
});