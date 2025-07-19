import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  LayoutGrid,
  Table,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useMonitoringData } from '@/hooks/use-monitoring-data';
import { MonitoringFiltersComponent } from './monitoring-filters';
import { MonitoringTable } from './monitoring-table';
import { MonitoringGrid } from './monitoring-grid';
import { SampleDetailsDialog } from './sample-details-dialog';
import { SampleMonitoring } from '@/types/monitoring';
import { toast } from 'sonner';
import { LottieLoader } from '@/components/ui/lottie-loader';

export function MonitoringDashboard() {
  const {
    data,
    groupedData,
    statistics,
    filters,
    view,
    isLoading,
    setFilters,
    setView,
    updateFilter,
    updateView,
    clearFilters
  } = useMonitoringData();

  const [selectedSample, setSelectedSample] = useState<SampleMonitoring | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleViewDetails = (sample: SampleMonitoring) => {
    setSelectedSample(sample);
    setDetailsDialogOpen(true);
  };

  const handleEditSample = (sample: SampleMonitoring) => {
    toast.info(`Editando amostra ${sample.sampleCode}`);
  };

  const handleGenerateReport = (sample: SampleMonitoring) => {
    toast.success(`Relatório gerado para amostra ${sample.sampleCode}`);
  };

  const handleExportData = () => {
    toast.success('Dados exportados com sucesso!');
  };

  const handleRefreshData = () => {
    toast.success('Dados atualizados!');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LottieLoader size="lg" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-beer-dark">Carregando Monitoramento...</p>
              <p className="text-sm text-muted-foreground">Processando dados de amostras e especificações</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
            Monitoramento de Degustação
          </h1>
          <p className="text-muted-foreground">
            Painel de controle para monitoramento de amostras e especificações sensoriais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Amostras</CardTitle>
            <FlaskConical className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              Amostras em monitoramento
            </p>
          </CardContent>
        </Card>

        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.compliant}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.total > 0 ? ((statistics.compliant / statistics.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Conformes</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.nonCompliant}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.total > 0 ? ((statistics.nonCompliant / statistics.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{statistics.critical}</div>
            <p className="text-xs text-muted-foreground">
              Requerem ação imediata
            </p>
          </CardContent>
        </Card>

        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            {statistics.averageScore >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              statistics.averageScore >= 80 ? 'text-green-600' :
              statistics.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {statistics.averageScore}
            </div>
            <p className="text-xs text-muted-foreground">
              Score de conformidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <MonitoringFiltersComponent
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="md:col-span-2 space-y-4">
          {/* View Controls */}
          <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-beer-dark">Controles de Visualização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Layout:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={view.layout === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateView('layout', 'table')}
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={view.layout === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateView('layout', 'grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Agrupar por:</span>
                  <Select value={view.groupBy} onValueChange={(value) => updateView('groupBy', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Prioridade</SelectItem>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="batch">Lote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Ordenar por:</span>
                  <Select value={view.sortBy} onValueChange={(value) => updateView('sortBy', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code">Código</SelectItem>
                      <SelectItem value="priority">Prioridade</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Mostrando {data.length} de {statistics.total} amostras
                  </span>
                  {Object.keys(groupedData).length > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {Object.keys(groupedData).length} grupos
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Display */}
          {view.groupBy === 'none' ? (
            view.layout === 'table' ? (
              <MonitoringTable
                data={data}
                onViewDetails={handleViewDetails}
                onEditSample={handleEditSample}
                onGenerateReport={handleGenerateReport}
              />
            ) : (
              <MonitoringGrid
                data={data}
                onViewDetails={handleViewDetails}
              />
            )
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedData).map(([groupName, groupData]) => (
                <Card key={groupName} className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-beer-dark">
                      <span>{groupName}</span>
                      <Badge variant="outline">{groupData.length} amostras</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {view.layout === 'table' ? (
                      <MonitoringTable
                        data={groupData}
                        onViewDetails={handleViewDetails}
                        onEditSample={handleEditSample}
                        onGenerateReport={handleGenerateReport}
                      />
                    ) : (
                      <MonitoringGrid
                        data={groupData}
                        onViewDetails={handleViewDetails}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {data.length === 0 && (
            <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FlaskConical className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold text-beer-dark">
                    Nenhuma amostra encontrada
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ajuste os filtros para ver mais resultados.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sample Details Dialog */}
      <SampleDetailsDialog
        sample={selectedSample}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}