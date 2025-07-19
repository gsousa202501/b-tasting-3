import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FlaskConical, X, Zap, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sample, SessionFormData, EnhancedSample } from '@/types';
import { mockSamples } from '@/lib/mock-data';
import { SampleOrderingEngine } from '@/lib/ordering-algorithm';
import { OrderingConfigurationDialog } from '@/features/ordering/components/ordering-configuration';
import { OrderingConfiguration } from '@/types/ordering';

interface SearchSamplesStepProps {
  selectedSamples: Sample[];
  onChange: (samples: Sample[]) => void;
  sessionData: SessionFormData['sessionData'];
}

// Mock de configurações de ordenação
const mockOrderingConfigs: OrderingConfiguration[] = [
  {
    id: 'config-1',
    name: 'Ordenação Padrão - Rotina',
    description: 'Configuração padrão para sessões de rotina',
    criteria: [
      {
        id: 'crit-1',
        name: 'Data de Produção',
        description: 'Prioriza amostras mais recentes',
        type: 'date',
        weight: 40,
        direction: 'desc',
        isActive: true,
        dataPath: 'productionDate',
        normalizationConfig: { max: 30 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'crit-2',
        name: 'Prioridade',
        description: 'Nível de prioridade da amostra',
        type: 'enum',
        weight: 30,
        direction: 'desc',
        isActive: true,
        options: ['baixa', 'media', 'alta'],
        dataPath: 'priority',
        normalizationConfig: { defaultValue: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'crit-3',
        name: 'Tipo de Amostra',
        description: 'Baseado no tipo da cerveja',
        type: 'enum',
        weight: 30,
        direction: 'asc',
        isActive: true,
        options: ['IPA', 'Lager', 'Pilsner', 'Weiss', 'Porter'],
        dataPath: 'type',
        normalizationConfig: { defaultValue: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    isDefault: true,
    sessionType: 'routine',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function SearchSamplesStep({ selectedSamples, onChange, sessionData }: SearchSamplesStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [useAutoOrdering, setUseAutoOrdering] = useState(false);
  const [selectedOrderingConfig, setSelectedOrderingConfig] = useState<string>('config-1');
  
  const itemsPerPage = 10;

  // Converter amostras para formato enhanced
  const enhancedSamples: EnhancedSample[] = useMemo(() => {
    return mockSamples.map(sample => ({
      ...sample,
      quality: {
        score: Math.floor(Math.random() * 100),
        conformity: ['conforme', 'nao-conforme', 'pendente'][Math.floor(Math.random() * 3)] as any,
      },
      priority: ['baixa', 'media', 'alta'][Math.floor(Math.random() * 3)] as any,
      testFrequency: Math.floor(Math.random() * 30) + 1,
      riskLevel: ['baixo', 'medio', 'alto'][Math.floor(Math.random() * 3)] as any,
    }));
  }, []);

  // Filter samples based on search term, type, and session date filters
  const filteredSamples = useMemo(() => {
    let filtered = enhancedSamples;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(sample => 
        sample.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.batch.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(sample => sample.type === selectedType);
    }

    // Apply date range filters from session data
    if (sessionData.startDate) {
      filtered = filtered.filter(sample => 
        new Date(sample.productionDate) >= new Date(sessionData.startDate!)
      );
    }

    if (sessionData.endDate) {
      filtered = filtered.filter(sample => 
        new Date(sample.productionDate) <= new Date(sessionData.endDate!)
      );
    }

    return filtered;
  }, [enhancedSamples, searchTerm, selectedType, sessionData.startDate, sessionData.endDate]);

  // Apply automatic ordering if enabled
  const orderedSamples = useMemo(() => {
    if (!useAutoOrdering) return filteredSamples;

    const config = mockOrderingConfigs.find(c => c.id === selectedOrderingConfig);
    if (!config) return filteredSamples;

    try {
      const preview = SampleOrderingEngine.generatePreview(filteredSamples, config.criteria);
      return preview.map(p => p.sample);
    } catch (error) {
      console.error('Erro na ordenação automática:', error);
      return filteredSamples;
    }
  }, [filteredSamples, useAutoOrdering, selectedOrderingConfig]);

  // Paginate results
  const totalPages = Math.ceil(orderedSamples.length / itemsPerPage);
  const paginatedSamples = orderedSamples.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique types for filter
  const availableTypes = ['all', ...new Set(mockSamples.map(sample => sample.type))];

  const handleSampleToggle = (sample: Sample, checked: boolean) => {
    if (checked) {
      onChange([...selectedSamples, sample]);
    } else {
      onChange(selectedSamples.filter(s => s.id !== sample.id));
    }
  };

  const handleRemoveSelected = (sampleId: string) => {
    onChange(selectedSamples.filter(s => s.id !== sampleId));
  };

  const handleSelectAll = () => {
    const newSelections = paginatedSamples.filter(
      sample => !selectedSamples.some(selected => selected.id === sample.id)
    );
    onChange([...selectedSamples, ...newSelections]);
  };

  const handleDeselectAll = () => {
    const currentPageIds = paginatedSamples.map(s => s.id);
    onChange(selectedSamples.filter(s => !currentPageIds.includes(s.id)));
  };

  const handleAutoSelectTop = () => {
    const topSamples = orderedSamples.slice(0, 10);
    onChange(topSamples);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Search className="h-5 w-5" />
            Buscar Amostras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, descrição, tipo ou lote..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="px-3 py-2 border border-input rounded-md bg-background"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos os tipos</option>
              {availableTypes.slice(1).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {(sessionData.startDate || sessionData.endDate) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtros ativos:</span>
              {sessionData.startDate && (
                <Badge variant="secondary">
                  A partir de {format(new Date(sessionData.startDate), 'dd/MM/yyyy')}
                </Badge>
              )}
              {sessionData.endDate && (
                <Badge variant="secondary">
                  Até {format(new Date(sessionData.endDate), 'dd/MM/yyyy')}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automatic Ordering Configuration */}
      <Card className="border-beer-medium/30 bg-beer-light/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Zap className="h-5 w-5" />
            Ordenação Automática
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-ordering">Usar Ordenação Automática</Label>
              <p className="text-sm text-muted-foreground">
                Aplica algoritmo de ordenação baseado em critérios configurados
              </p>
            </div>
            <Switch
              id="auto-ordering"
              checked={useAutoOrdering}
              onCheckedChange={setUseAutoOrdering}
            />
          </div>

          {useAutoOrdering && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Configuração de Ordenação</Label>
                  <Select value={selectedOrderingConfig} onValueChange={setSelectedOrderingConfig}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockOrderingConfigs.map(config => (
                        <SelectItem key={config.id} value={config.id}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <OrderingConfigurationDialog>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurar
                  </Button>
                </OrderingConfigurationDialog>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAutoSelectTop}
                  disabled={orderedSamples.length === 0}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Selecionar Top 10
                </Button>
                <span className="text-sm text-muted-foreground">
                  Seleciona automaticamente as 10 amostras com maior score
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-beer-dark">
              Resultados ({orderedSamples.length} amostras encontradas)
              {useAutoOrdering && <Badge variant="secondary" className="ml-2">Ordenação Automática</Badge>}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={paginatedSamples.every(sample => 
                  selectedSamples.some(selected => selected.id === sample.id)
                )}
              >
                Selecionar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={!paginatedSamples.some(sample => 
                  selectedSamples.some(selected => selected.id === sample.id)
                )}
              >
                Desmarcar Todos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedSamples.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    {useAutoOrdering && <TableHead className="w-[80px]">Posição</TableHead>}
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Produção</TableHead>
                    <TableHead>Validade</TableHead>
                    {useAutoOrdering && <TableHead>Prioridade</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSamples.map((sample, index) => {
                    const isSelected = selectedSamples.some(s => s.id === sample.id);
                    const globalIndex = (currentPage - 1) * itemsPerPage + index;
                    return (
                      <TableRow key={sample.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleSampleToggle(sample, checked as boolean)
                            }
                          />
                        </TableCell>
                        {useAutoOrdering && (
                          <TableCell>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-beer-medium text-white text-xs font-medium">
                              {globalIndex + 1}
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{sample.code}</TableCell>
                        <TableCell>{sample.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sample.type}</Badge>
                        </TableCell>
                        <TableCell>{sample.batch}</TableCell>
                        <TableCell>
                          {format(new Date(sample.productionDate), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(sample.expirationDate), 'dd/MM/yyyy')}
                        </TableCell>
                        {useAutoOrdering && (
                          <TableCell>
                            <Badge variant={
                              (sample as EnhancedSample).priority === 'alta' ? 'destructive' :
                              (sample as EnhancedSample).priority === 'media' ? 'default' : 'secondary'
                            }>
                              {(sample as EnhancedSample).priority}
                            </Badge>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhuma amostra encontrada com os critérios de busca.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Samples Summary */}
      {selectedSamples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-beer-dark">
              Amostras Selecionadas ({selectedSamples.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedSamples.map((sample) => (
                <Badge
                  key={sample.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {sample.code}
                  <button
                    onClick={() => handleRemoveSelected(sample.id)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}