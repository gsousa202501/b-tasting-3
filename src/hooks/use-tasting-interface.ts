import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TastingSessionSample,
  TastingViewConfiguration,
  TastingFilter,
  TastingGroupConfig,
  TransposedTastingData,
  TastingEvaluationResult,
  TastingSpecification
} from '@/types/tasting-interface';
import { toast } from 'sonner';

// Mock data and API functions
const mockTastingSpecifications: TastingSpecification[] = [
  {
    id: 'spec-1',
    name: 'pH',
    description: 'Medição do pH da amostra',
    testType: 'chemical',
    unit: '',
    expectedRange: { min: 3.8, max: 4.5 },
    criticalLimit: 5.0,
    methodology: 'Potenciometria',
    isRequired: true,
    order: 1
  },
  {
    id: 'spec-2',
    name: 'Teor Alcoólico',
    description: 'Percentual de álcool por volume',
    testType: 'chemical',
    unit: '%',
    expectedRange: { min: 4.0, max: 7.0 },
    methodology: 'Densimetria',
    isRequired: true,
    order: 2
  },
  {
    id: 'spec-3',
    name: 'Amargor',
    description: 'Unidades internacionais de amargor',
    testType: 'sensory',
    unit: 'IBU',
    expectedRange: { min: 15, max: 80 },
    methodology: 'Espectrofotometria',
    isRequired: true,
    order: 3
  },
  {
    id: 'spec-4',
    name: 'Cor',
    description: 'Cor da cerveja em escala EBC',
    testType: 'physical',
    unit: 'EBC',
    expectedRange: { min: 4, max: 40 },
    methodology: 'Colorimetria',
    isRequired: true,
    order: 4
  },
  {
    id: 'spec-5',
    name: 'Turbidez',
    description: 'Medição da turbidez',
    testType: 'physical',
    unit: 'NTU',
    expectedRange: { min: 0, max: 5 },
    criticalLimit: 10,
    methodology: 'Nefelometria',
    isRequired: true,
    order: 5
  },
  {
    id: 'spec-6',
    name: 'Microbiológico',
    description: 'Análise microbiológica geral',
    testType: 'microbiological',
    methodology: 'Cultura em placa',
    isRequired: true,
    order: 6
  },
  {
    id: 'spec-7',
    name: 'Aroma',
    description: 'Avaliação sensorial do aroma',
    testType: 'sensory',
    unit: 'pontos',
    expectedRange: { min: 6, max: 10 },
    methodology: 'Painel sensorial',
    isRequired: false,
    order: 7
  },
  {
    id: 'spec-8',
    name: 'Sabor',
    description: 'Avaliação sensorial do sabor',
    testType: 'sensory',
    unit: 'pontos',
    expectedRange: { min: 6, max: 10 },
    methodology: 'Painel sensorial',
    isRequired: false,
    order: 8
  }
];

const generateMockTastingSamples = (sessionId: string): TastingSessionSample[] => {
  const sampleTypes = ['PILSEN', 'IPA', 'WEISS', 'PORTER', 'LAGER'];
  const categories = ['Produção', 'Controle', 'Desenvolvimento', 'Especial'];
  
  return Array.from({ length: 24 }, (_, i) => {
    const sampleType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const evaluationResults: TastingEvaluationResult[] = mockTastingSpecifications.map(spec => ({
      id: `eval-${i}-${spec.id}`,
      sampleId: `sample-${sessionId}-${i + 1}`,
      specificationId: spec.id,
      value: spec.testType === 'microbiological' 
        ? ['Aprovado', 'Reprovado'][Math.floor(Math.random() * 2)]
        : spec.testType === 'sensory'
        ? +(Math.random() * 4 + 6).toFixed(1)
        : +(Math.random() * (spec.expectedRange?.max || 10) + (spec.expectedRange?.min || 0)).toFixed(2),
      status: ['compliant', 'non-compliant', 'pending'][Math.floor(Math.random() * 3)] as any,
      evaluatedBy: 'current-user',
      evaluatedAt: new Date().toISOString(),
      confidence: Math.random() * 0.3 + 0.7
    }));

    return {
      id: `sample-${sessionId}-${i + 1}`,
      code: `BT-${String(i + 1).padStart(4, '0')}`,
      description: `Amostra ${sampleType} ${category}`,
      productionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      batch: `L${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      type: sampleType,
      sessionId,
      evaluationResults,
      specifications: mockTastingSpecifications,
      groupCategory: category,
      customAttributes: {
        priority: ['Alta', 'Média', 'Baixa'][Math.floor(Math.random() * 3)],
        origin: ['Linha 1', 'Linha 2', 'Linha 3'][Math.floor(Math.random() * 3)]
      }
    };
  });
};

const mockViewConfigurations: TastingViewConfiguration[] = [
  {
    id: 'view-1',
    name: 'Visão Padrão',
    description: 'Configuração padrão com agrupamento por tipo',
    isDefault: true,
    groupBy: ['type'],
    sortBy: [{ field: 'code', direction: 'asc' }],
    visibleColumns: ['code', 'type', 'batch', 'pH', 'Teor Alcoólico', 'Amargor'],
    filters: [],
    isTransposed: false,
    columnOrder: ['code', 'type', 'batch', 'pH', 'Teor Alcoólico', 'Amargor'],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'view-2',
    name: 'Análise Química',
    description: 'Foco em parâmetros químicos',
    isDefault: false,
    groupBy: ['groupCategory'],
    sortBy: [{ field: 'pH', direction: 'desc' }],
    visibleColumns: ['code', 'pH', 'Teor Alcoólico', 'Turbidez'],
    filters: [
      {
        id: 'filter-1',
        field: 'testType',
        operator: 'equals',
        value: 'chemical',
        isActive: true
      }
    ],
    isTransposed: true,
    columnOrder: ['code', 'pH', 'Teor Alcoólico', 'Turbidez'],
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const tastingApi = {
  getTastingSamples: async (sessionId: string): Promise<TastingSessionSample[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return generateMockTastingSamples(sessionId);
  },

  getViewConfigurations: async (): Promise<TastingViewConfiguration[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockViewConfigurations;
  },

  saveViewConfiguration: async (config: TastingViewConfiguration): Promise<TastingViewConfiguration> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...config, updatedAt: new Date().toISOString() };
  },

  updateEvaluationResult: async (result: TastingEvaluationResult): Promise<TastingEvaluationResult> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { ...result, evaluatedAt: new Date().toISOString() };
  }
};

export function useTastingInterface(sessionId: string) {
  const queryClient = useQueryClient();
  
  // State for interface configuration
  const [currentView, setCurrentView] = useState<string>('view-1');
  const [activeFilters, setActiveFilters] = useState<TastingFilter[]>([]);
  const [groupConfig, setGroupConfig] = useState<string[]>(['type']);
  const [isTransposed, setIsTransposed] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Queries
  const { data: samples, isLoading: samplesLoading } = useQuery({
    queryKey: ['tasting-samples', sessionId],
    queryFn: () => tastingApi.getTastingSamples(sessionId),
    enabled: !!sessionId
  });

  const { data: viewConfigurations, isLoading: viewsLoading } = useQuery({
    queryKey: ['tasting-views'],
    queryFn: tastingApi.getViewConfigurations
  });

  // Mutations
  const saveViewMutation = useMutation({
    mutationFn: tastingApi.saveViewConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasting-views'] });
      toast.success('Configuração de visualização salva!');
    },
    onError: () => {
      toast.error('Erro ao salvar configuração');
    }
  });

  const updateEvaluationMutation = useMutation({
    mutationFn: tastingApi.updateEvaluationResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasting-samples', sessionId] });
      toast.success('Avaliação atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar avaliação');
    }
  });

  // Transform data based on current configuration
  const transformedData = useMemo(() => {
    if (!samples) return [];

    let filteredSamples = samples;

    // Apply active filters
    activeFilters.forEach(filter => {
      if (!filter.isActive) return;

      filteredSamples = filteredSamples.filter(sample => {
        const value = getNestedValue(sample, filter.field);
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greater':
            return Number(value) > Number(filter.value);
          case 'less':
            return Number(value) < Number(filter.value);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    });

    if (isTransposed) {
      return transposeData(filteredSamples);
    }

    return filteredSamples;
  }, [samples, activeFilters, isTransposed]);

  // Helper functions
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const transposeData = (samples: TastingSessionSample[]): TransposedTastingData[] => {
    return samples.map(sample => {
      const transposed: TransposedTastingData = {
        sampleId: sample.id,
        sampleCode: sample.code,
        sampleType: sample.type,
        batch: sample.batch,
        groupCategory: sample.groupCategory
      };

      // Add evaluation results as columns
      sample.evaluationResults.forEach(result => {
        const spec = sample.specifications.find(s => s.id === result.specificationId);
        if (spec) {
          transposed[spec.name] = {
            value: result.value,
            status: result.status,
            unit: spec.unit,
            confidence: result.confidence
          };
        }
      });

      return transposed;
    });
  };

  // Interface actions
  const applyFilter = useCallback((filter: TastingFilter) => {
    setActiveFilters(prev => {
      const existing = prev.find(f => f.id === filter.id);
      if (existing) {
        return prev.map(f => f.id === filter.id ? filter : f);
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const updateGrouping = useCallback((groupBy: string[]) => {
    setGroupConfig(groupBy);
  }, []);

  const toggleTranspose = useCallback(() => {
    setIsTransposed(prev => !prev);
  }, []);

  const reorderColumns = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  const toggleColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns(prev => {
      if (visible) {
        return [...prev, columnId];
      }
      return prev.filter(id => id !== columnId);
    });
  }, []);

  const saveCurrentView = useCallback((name: string, description: string) => {
    const newView: TastingViewConfiguration = {
      id: `view-${Date.now()}`,
      name,
      description,
      isDefault: false,
      groupBy: groupConfig,
      sortBy: [],
      visibleColumns,
      filters: activeFilters,
      isTransposed,
      columnOrder,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveViewMutation.mutate(newView);
  }, [groupConfig, visibleColumns, activeFilters, isTransposed, columnOrder, saveViewMutation]);

  const loadView = useCallback((viewId: string) => {
    const view = viewConfigurations?.find(v => v.id === viewId);
    if (view) {
      setCurrentView(viewId);
      setActiveFilters(view.filters);
      setGroupConfig(view.groupBy);
      setIsTransposed(view.isTransposed);
      setColumnOrder(view.columnOrder);
      setVisibleColumns(view.visibleColumns);
    }
  }, [viewConfigurations]);

  const updateEvaluation = useCallback((result: TastingEvaluationResult) => {
    updateEvaluationMutation.mutate(result);
  }, [updateEvaluationMutation]);

  const exportData = useCallback((format: 'csv' | 'excel' | 'pdf' | 'json') => {
    // Implementation for data export
    const dataToExport = {
      samples: transformedData,
      configuration: {
        filters: activeFilters,
        grouping: groupConfig,
        isTransposed,
        columnOrder,
        visibleColumns
      },
      metadata: {
        sessionId,
        exportedAt: new Date().toISOString(),
        exportedBy: 'current-user'
      }
    };

    // Mock export - in real implementation, this would generate and download the file
    console.log(`Exporting data in ${format} format:`, dataToExport);
    toast.success(`Dados exportados em formato ${format.toUpperCase()}!`);
  }, [transformedData, activeFilters, groupConfig, isTransposed, columnOrder, visibleColumns, sessionId]);

  return {
    // Data
    samples: transformedData,
    specifications: mockTastingSpecifications,
    viewConfigurations,
    currentView,
    
    // State
    activeFilters,
    groupConfig,
    isTransposed,
    columnOrder,
    visibleColumns,
    
    // Loading states
    isLoading: samplesLoading || viewsLoading,
    isSaving: saveViewMutation.isPending,
    isUpdating: updateEvaluationMutation.isPending,
    
    // Actions
    applyFilter,
    removeFilter,
    updateGrouping,
    toggleTranspose,
    reorderColumns,
    toggleColumnVisibility,
    saveCurrentView,
    loadView,
    updateEvaluation,
    exportData
  };
}