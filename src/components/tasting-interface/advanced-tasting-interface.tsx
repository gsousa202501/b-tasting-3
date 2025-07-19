import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, AlertTriangle } from 'lucide-react';
import { useTastingInterface } from '@/hooks/use-tasting-interface';
import { TastingDataTable } from './tasting-data-table';
import { TastingFilters } from './tasting-filters';
import { TastingViewControls } from './tasting-view-controls';
import { LottieLoader } from '@/components/ui/lottie-loader';

interface AdvancedTastingInterfaceProps {
  sessionId: string;
}

export function AdvancedTastingInterface({ sessionId }: AdvancedTastingInterfaceProps) {
  const {
    samples,
    specifications,
    viewConfigurations,
    currentView,
    activeFilters,
    groupConfig,
    isTransposed,
    columnOrder,
    visibleColumns,
    isLoading,
    applyFilter,
    removeFilter,
    updateGrouping,
    toggleTranspose,
    reorderColumns,
    toggleColumnVisibility,
    saveCurrentView,
    loadView,
    exportData
  } = useTastingInterface(sessionId);

  const clearAllFilters = () => {
    activeFilters.forEach(filter => removeFilter(filter.id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LottieLoader size="lg" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-beer-dark">Carregando Interface de Degustação...</p>
            <p className="text-sm text-muted-foreground">Preparando dados e configurações avançadas</p>
          </div>
        </div>
      </div>
    );
  }

  if (!samples || samples.length === 0) {
    return (
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FlaskConical className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-beer-dark">
              Nenhuma amostra encontrada
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta sessão não possui amostras para avaliação.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <FlaskConical className="h-5 w-5" />
            Interface Avançada de Degustação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-beer-dark">{samples.length}</div>
              <p className="text-sm text-muted-foreground">Amostras</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-beer-dark">{specifications.length}</div>
              <p className="text-sm text-muted-foreground">Especificações</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-beer-dark">{activeFilters.length}</div>
              <p className="text-sm text-muted-foreground">Filtros Ativos</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-beer-dark">
                {viewConfigurations?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Visualizações</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <TastingViewControls
        viewConfigurations={viewConfigurations || []}
        currentView={currentView}
        specifications={specifications}
        isTransposed={isTransposed}
        groupBy={groupConfig}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onLoadView={loadView}
        onSaveView={saveCurrentView}
        onToggleTranspose={toggleTranspose}
        onUpdateGrouping={updateGrouping}
        onToggleColumnVisibility={toggleColumnVisibility}
        onReorderColumns={reorderColumns}
        onExportData={exportData}
      />

      {/* Filters */}
      <TastingFilters
        activeFilters={activeFilters}
        specifications={specifications}
        onApplyFilter={applyFilter}
        onRemoveFilter={removeFilter}
        onClearAllFilters={clearAllFilters}
      />

      {/* Data Table */}
      <TastingDataTable
        data={samples}
        specifications={specifications}
        isTransposed={isTransposed}
        groupBy={groupConfig}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onColumnReorder={reorderColumns}
      />

      {/* Summary Information */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Interface de degustação configurada com {activeFilters.length} filtros ativos,
              agrupamento por {groupConfig.join(', ') || 'nenhum'} e 
              visualização {isTransposed ? 'transposta' : 'normal'}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}