import { SampleData, SampleTestResult } from '@/types/samples-data';

const testTypes = [
  { id: 'ph', name: 'pH', unit: '', type: 'numeric' },
  { id: 'oxidation', name: 'Oxidação', unit: 'ppm', type: 'numeric' },
  { id: 'alcohol', name: 'Teor Alcoólico', unit: '%', type: 'numeric' },
  { id: 'bitterness', name: 'Amargor', unit: 'IBU', type: 'numeric' },
  { id: 'color', name: 'Cor', unit: 'EBC', type: 'numeric' },
  { id: 'density', name: 'Densidade', unit: 'g/mL', type: 'numeric' },
  { id: 'turbidity', name: 'Turbidez', unit: 'NTU', type: 'numeric' },
  { id: 'foam', name: 'Espuma', unit: 'mm', type: 'numeric' },
  { id: 'microbiological', name: 'Microbiológico', unit: '', type: 'status' },
  { id: 'sensory', name: 'Sensorial', unit: '', type: 'status' }
];

const sampleTypes = ['PURO MALTE', 'PILSEN', 'IPA', 'WEISS', 'PORTER', 'LAGER'];

const generateTestResults = (): SampleTestResult[] => {
  return testTypes.map(test => ({
    testId: test.id,
    testName: test.name,
    value: test.type === 'numeric' 
      ? +(Math.random() * 10 + 1).toFixed(2)
      : ['Aprovado', 'Reprovado', 'Pendente'][Math.floor(Math.random() * 3)],
    unit: test.unit,
    status: ['approved', 'rejected', 'pending'][Math.floor(Math.random() * 3)] as any,
    publishedAt: Math.random() > 0.3 ? new Date().toISOString() : undefined
  }));
};

export const mockSamplesData: SampleData[] = Array.from({ length: 50 }, (_, i) => ({
  id: `sample-${i + 1}`,
  cod_amostra: `BT-${String(i + 1).padStart(4, '0')}`,
  sampleType: sampleTypes[Math.floor(Math.random() * sampleTypes.length)],
  productionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  batch: `L${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
  testResults: generateTestResults(),
  publicationStatus: ['published', 'draft', 'pending'][Math.floor(Math.random() * 3)] as any,
  publishedAt: Math.random() > 0.4 ? new Date().toISOString() : undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

export const availableTests = testTypes;