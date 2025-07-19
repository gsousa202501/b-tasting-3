export interface SampleTestResult {
  testId: string;
  testName: string;
  value: number | string;
  unit?: string;
  status?: 'approved' | 'rejected' | 'pending';
  publishedAt?: string;
}

export interface SampleData {
  id: string;
  cod_amostra: string;
  sampleType: string;
  productionDate: string;
  batch: string;
  testResults: SampleTestResult[];
  publicationStatus: 'published' | 'draft' | 'pending';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransposedSampleData {
  id: string;
  cod_amostra: string;
  sampleType: string;
  batch: string;
  publicationStatus: 'published' | 'draft' | 'pending';
  [testName: string]: any; // Dynamic test result values
}

export interface TestColumn {
  id: string;
  name: string;
  unit?: string;
  type: 'numeric' | 'text' | 'status';
}

export interface SampleGroup {
  sampleType: string;
  samples: TransposedSampleData[];
  count: number;
}