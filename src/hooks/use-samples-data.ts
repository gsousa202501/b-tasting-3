import { useQuery } from '@tanstack/react-query';
import { SampleData, TransposedSampleData, TestColumn } from '@/types/samples-data';
import { mockSamplesData, availableTests } from '@/lib/mock-samples-data';
import { LottieLoader } from '@/components/ui/lottie-loader';

// Mock API function
const fetchSamplesData = async (): Promise<SampleData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockSamplesData;
};

// Transform data for transposed table view
export const transformSamplesData = (samples: SampleData[]): TransposedSampleData[] => {
  return samples.map(sample => {
    const transposed: TransposedSampleData = {
      id: sample.id,
      cod_amostra: sample.cod_amostra,
      sampleType: sample.sampleType,
      batch: sample.batch,
      publicationStatus: sample.publicationStatus
    };

    // Add test results as dynamic columns
    sample.testResults.forEach(test => {
      transposed[test.testName] = {
        value: test.value,
        unit: test.unit,
        status: test.status,
        publishedAt: test.publishedAt
      };
    });

    return transposed;
  });
};

// Get available test columns
export const getTestColumns = (): TestColumn[] => {
  return availableTests.map(test => ({
    id: test.id,
    name: test.name,
    unit: test.unit,
    type: test.type as any
  }));
};

export function useSamplesData() {
  return useQuery({
    queryKey: ['samples-data'],
    queryFn: fetchSamplesData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => ({
      raw: data,
      transposed: transformSamplesData(data),
      testColumns: getTestColumns()
    })
  });
}