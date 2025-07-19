import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  Plus,
  Trash2,
  Eye,
  Save,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  FlaskConical,
  Target,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { OrderingConfiguration, OrderingCriterion, EnhancedSample } from '@/types/ordering';
import { SampleOrderingEngine } from '@/lib/ordering-algorithm';
import { mockSamples } from '@/lib/mock-data';
import { toast } from 'sonner';

interface OrderingConfigurationProps {
  children?: React.ReactNode;
  configuration?: OrderingConfiguration;
  onSave?: (config: OrderingConfiguration) => void;
}

const defaultCriteria: Omit<OrderingCriterion, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Data de Produção',
    description: 'Prioriza amostras mais recentes',
    type: 'date',
    weight: 30,
    direction: 'desc',
    isActive: true,
    dataPath: 'productionDate',
    normalizationConfig: { max: 30 }
  },
  {
    name: 'Score de Qualidade',
    description: 'Baseado em avaliações anteriores',
    type: 'numeric',
    weight: 25,
    direction: 'desc',
    isActive: true,
    dataPath: 'quality.score',
    normalizationConfig: { min: 0, max: 100, defaultValue: 50 }
  },
  {
    name: 'Prioridade',
    description: 'Nível de prioridade da amostra',
    type: 'enum',
    weight: 20,
    direction: 'desc',
    isActive: true,
    options: ['baixa', 'media', 'alta'],
    dataPath: 'priority',
    normalizationConfig: { defaultValue: 50 }
  },
  {
    name: 'Frequência de Teste',
    description: 'Baseado na última avaliação',
    type: 'numeric',
    weight: 15,
    direction: 'asc',
    isActive: true,
    dataPath: 'testFrequency',
    normalizationConfig: { min: 1, max: 30, defaultValue: 7 }
  },
  {
    name: 'Nível de Risco',
    description: 'Risco associado à amostra',
    type: 'enum',
    weight: 10,
    direction: 'desc',
    isActive: false,
    options: ['baixo', 'medio', 'alto'],
    dataPath: 'riskLevel',
    normalizationConfig: { defaultValue: 33 }
  }
];

export function OrderingConfigurationDialog({ children, configuration, onSave }: OrderingConfigurationProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<OrderingConfiguration>(() => {
    if (configuration) return configuration;
    
    return {
      id: `config-${Date.now()}`,
      name: '',
      description: '',
      criteria: defaultCriteria.map(c => ({
        ...c,
        id: `criterion-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      isDefault: false,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const isEditing = !!configuration;

  const updateCriterion = (criterionId: string, updates: Partial<OrderingCriterion>) => {
    setConfig(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => 
        c.id === criterionId 
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const addCriterion = () => {
    const newCriterion: OrderingCriterion = {
      id: `criterion-${Date.now()}-${Math.random()}`,
      name: 'Novo Critério',
      description: '',
      type: 'numeric',
      weight: 10,
      direction: 'desc',
      isActive: false,
      dataPath: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConfig(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriterion],
      updatedAt: new Date().toISOString()
    }));
  };

  const removeCriterion = (criterionId: string) => {
    setConfig(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== criterionId),
      updatedAt: new Date().toISOString()
    }));
  };

  const generatePreview = () => {
    try {
      const enhancedSamples: EnhancedSample[] = mockSamples.map(sample => ({
        ...sample,
        quality: {
          score: Math.floor(Math.random() * 100),
          conformity: ['conforme', 'nao-conforme', 'pendente'][Math.floor(Math.random() * 3)] as any,
        },
        priority: ['baixa', 'media', 'alta'][Math.floor(Math.random() * 3)] as any,
        testFrequency: Math.floor(Math.random() * 30) + 1,
        riskLevel: ['baixo', 'medio', 'alto'][Math.floor(Math.random() * 3)] as any,
      }));

      const preview = SampleOrderingEngine.generatePreview(enhancedSamples.slice(0, 10), config.criteria);
      setPreviewData(preview);
      setShowPreview(true);
    } catch (error) {
      toast.error('Erro ao gerar preview', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  const handleSave = () => {
    if (!config.name.trim()) {
      toast.error('Nome da configuração é obrigatório');
      return;
    }

    const activeCriteria = config.criteria.filter(c => c.isActive);
    if (activeCriteria.length === 0) {
      toast.error('Pelo menos um critério deve estar ativo');
      return;
    }

    if (onSave) {
      onSave(config);
    }

    toast.success(isEditing ? 'Configuração atualizada!' : 'Configuração criada!');
    setOpen(false);
  };

  const resetToDefaults = () => {
    setConfig(prev => ({
      ...prev,
      criteria: defaultCriteria.map(c => ({
        ...c,
        id: `criterion-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      updatedAt: new Date().toISOString()
    }));
    toast.success('Configuração restaurada para padrões');
  };

  const totalWeight = config.criteria.filter(c => c.isActive).reduce((sum, c) => sum + c.weight, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-beer-dark">
            <Settings className="h-5 w-5" />
            {isEditing ? 'Editar Configuração de Ordenação' : 'Nova Configuração de Ordenação'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="config" className="h-full flex flex-col">
            <div className="px-6 py-2 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">Configuração</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="config" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full px-6">
                <div className="space-y-6 py-4">
                  {/* Informações Básicas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-beer-dark">Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="config-name">Nome da Configuração *</Label>
                          <Input
                            id="config-name"
                            value={config.name}
                            onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Ordenação Padrão Rotina"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="session-type">Tipo de Sessão</Label>
                          <Select 
                            value={config.sessionType || 'all'} 
                            onValueChange={(value: any) => setConfig(prev => ({ ...prev, sessionType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas</SelectItem>
                              <SelectItem value="routine">Rotina</SelectItem>
                              <SelectItem value="extra">Extra</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="config-description">Descrição</Label>
                        <Textarea
                          id="config-description"
                          value={config.description}
                          onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva quando e como esta configuração deve ser usada..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is-default"
                          checked={config.isDefault}
                          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isDefault: checked }))}
                        />
                        <Label htmlFor="is-default">Configuração padrão</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resumo dos Pesos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-beer-dark">
                        <span>Resumo dos Critérios</span>
                        <Badge variant={totalWeight === 100 ? "default" : "secondary"}>
                          Peso Total: {totalWeight}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {totalWeight !== 100 && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="text-sm text-amber-800">
                            Recomenda-se que o peso total seja 100% para melhor balanceamento
                          </span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {config.criteria.filter(c => c.isActive).map(criterion => (
                          <div key={criterion.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{criterion.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {criterion.direction === 'desc' ? '↓' : '↑'} {criterion.type}
                              </p>
                            </div>
                            <Badge variant="outline">{criterion.weight}%</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Critérios de Ordenação */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-beer-dark">
                        <span>Critérios de Ordenação</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={resetToDefaults}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restaurar Padrões
                          </Button>
                          <Button variant="outline" size="sm" onClick={addCriterion}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {config.criteria.map((criterion, index) => (
                        <div key={criterion.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={criterion.isActive}
                                onCheckedChange={(checked) => updateCriterion(criterion.id, { isActive: checked })}
                              />
                              <div>
                                <h4 className="font-medium">{criterion.name}</h4>
                                <p className="text-sm text-muted-foreground">{criterion.description}</p>
                              </div>
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Critério</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover o critério "{criterion.name}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => removeCriterion(criterion.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>

                          {criterion.isActive && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                              <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input
                                  value={criterion.name}
                                  onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select 
                                  value={criterion.type} 
                                  onValueChange={(value: any) => updateCriterion(criterion.id, { type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="numeric">Numérico</SelectItem>
                                    <SelectItem value="date">Data</SelectItem>
                                    <SelectItem value="enum">Lista</SelectItem>
                                    <SelectItem value="boolean">Sim/Não</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Direção</Label>
                                <Select 
                                  value={criterion.direction} 
                                  onValueChange={(value: any) => updateCriterion(criterion.id, { direction: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="desc">
                                      <div className="flex items-center gap-2">
                                        <ArrowDown className="h-4 w-4" />
                                        Decrescente (maior primeiro)
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="asc">
                                      <div className="flex items-center gap-2">
                                        <ArrowUp className="h-4 w-4" />
                                        Crescente (menor primeiro)
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Peso: {criterion.weight}%</Label>
                                <Slider
                                  value={[criterion.weight]}
                                  onValueChange={([value]) => updateCriterion(criterion.id, { weight: value })}
                                  max={100}
                                  min={1}
                                  step={1}
                                  className="w-full"
                                />
                              </div>

                              <div className="space-y-2 md:col-span-2">
                                <Label>Caminho dos Dados</Label>
                                <Input
                                  value={criterion.dataPath}
                                  onChange={(e) => updateCriterion(criterion.id, { dataPath: e.target.value })}
                                  placeholder="Ex: productionDate, quality.score"
                                />
                              </div>

                              <div className="space-y-2 md:col-span-2">
                                <Label>Descrição</Label>
                                <Input
                                  value={criterion.description}
                                  onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                                  placeholder="Descreva como este critério funciona..."
                                />
                              </div>

                              {criterion.type === 'enum' && (
                                <div className="space-y-2 md:col-span-4">
                                  <Label>Opções (separadas por vírgula)</Label>
                                  <Input
                                    value={criterion.options?.join(', ') || ''}
                                    onChange={(e) => updateCriterion(criterion.id, { 
                                      options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                    })}
                                    placeholder="Ex: baixa, media, alta"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex flex-col">
                <div className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-beer-dark" />
                      <h3 className="text-lg font-semibold text-beer-dark">Preview da Ordenação</h3>
                    </div>
                    <Button onClick={generatePreview} disabled={config.criteria.filter(c => c.isActive).length === 0}>
                      <Zap className="mr-2 h-4 w-4" />
                      Gerar Preview
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden px-6">
                  {!showPreview ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Target className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
                        <h3 className="mt-4 text-lg font-semibold text-beer-dark">
                          Preview da Ordenação
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Clique em "Gerar Preview" para ver como as amostras serão ordenadas
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-full py-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Posição</TableHead>
                              <TableHead>Amostra</TableHead>
                              <TableHead>Código</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Score Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.map((item, index) => (
                              <TableRow key={item.sample.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-beer-medium text-white text-xs font-medium">
                                      {index + 1}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{item.sample.description}</TableCell>
                                <TableCell>{item.sample.code}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{item.sample.type}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {item.score.toFixed(1)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex justify-between px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-beer-medium hover:bg-beer-dark">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Configuração'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}