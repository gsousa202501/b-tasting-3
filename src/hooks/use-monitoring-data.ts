import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SampleMonitoring, MonitoringFilters, MonitoringView } from '@/types/monitoring';
import { mockMonitoringData } from '@/lib/mock-monitoring-data';

const monitoringApi = {
  getMonitoringData: async (): Promise<SampleMonitoring[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockMonitoringData;
  }
};

export function useMonitoringData() {
  const [filters, setFilters] = useState<MonitoringFilters>({
    status: [],
    priority: [],
    dateRange: null,
    productType: [],
    searchTerm: ''
  });

  const [view, setView] = useState<MonitoringView>({
    layout: 'table',
    groupBy: 'none',
    sortBy: 'priority',
    sortOrder: 'desc'
  });

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['monitoring-data'],
    queryFn: monitoringApi.getMonitoringData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!rawData) return [];

    let filtered = rawData;

    // Apply filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(sample => 
        filters.status.includes(sample.complianceStatus.overall)
      );
    }

    if (filters.priority.length > 0) {
      filtered = filtered.filter(sample => 
        filters.priority.includes(sample.priority)
      );
    }

    if (filters.productType.length > 0) {
      filtered = filtered.filter(sample => 
        filters.productType.includes(sample.productName)
      );
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(sample =>
        sample.sampleCode.toLowerCase().includes(term) ||
        sample.productName.toLowerCase().includes(term) ||
        sample.batch.toLowerCase().includes(term)
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(sample => {
        const date = new Date(sample.productionDate);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return date >= start && date <= end;
      });
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (view.sortBy) {
        case 'code':
          aValue = a.sampleCode;
          bValue = b.sampleCode;
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'date':
          aValue = new Date(a.productionDate);
          bValue = new Date(b.productionDate);
          break;
        case 'status':
          const statusOrder = { critical: 4, 'non-compliant': 3, pending: 2, compliant: 1 };
          aValue = statusOrder[a.complianceStatus.overall];
          bValue = statusOrder[b.complianceStatus.overall];
          break;
        case 'score':
          aValue = a.complianceStatus.score;
          bValue = b.complianceStatus.score;
          break;
        default:
          aValue = a.sampleCode;
          bValue = b.sampleCode;
      }

      if (aValue < bValue) return view.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return view.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rawData, filters, view.sortBy, view.sortOrder]);

  // Group data if needed
  const groupedData = useMemo(() => {
    if (view.groupBy === 'none') return { 'Todas as Amostras': filteredData };

    const groups: Record<string, SampleMonitoring[]> = {};

    filteredData.forEach(sample => {
      let groupKey: string;

      switch (view.groupBy) {
        case 'status':
          groupKey = sample.complianceStatus.overall;
          break;
        case 'priority':
          groupKey = sample.priority;
          break;
        case 'product':
          groupKey = sample.productName;
          break;
        case 'batch':
          groupKey = sample.batch;
          break;
        default:
          groupKey = 'Outras';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(sample);
    });

    return groups;
  }, [filteredData, view.groupBy]);

  // Statistics
  const statistics = useMemo(() => {
    if (!filteredData.length) return {
      total: 0,
      compliant: 0,
      nonCompliant: 0,
      pending: 0,
      critical: 0,
      averageScore: 0
    };

    const total = filteredData.length;
    const compliant = filteredData.filter(s => s.complianceStatus.overall === 'compliant').length;
    const nonCompliant = filteredData.filter(s => s.complianceStatus.overall === 'non-compliant').length;
    const pending = filteredData.filter(s => s.complianceStatus.overall === 'pending').length;
    const critical = filteredData.filter(s => s.complianceStatus.overall === 'critical').length;
    const averageScore = filteredData.reduce((sum, s) => sum + s.complianceStatus.score, 0) / total;

    return {
      total,
      compliant,
      nonCompliant,
      pending,
      critical,
      averageScore: Math.round(averageScore)
    };
  }, [filteredData]);

  return {
    data: filteredData,
    groupedData,
    statistics,
    filters,
    view,
    isLoading,
    error,
    setFilters,
    setView,
    // Helper functions
    updateFilter: (key: keyof MonitoringFilters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    updateView: (key: keyof MonitoringView, value: any) => {
      setView(prev => ({ ...prev, [key]: value }));
    },
    clearFilters: () => {
      setFilters({
        status: [],
        priority: [],
        dateRange: null,
        productType: [],
        searchTerm: ''
      });
    }
  };
}