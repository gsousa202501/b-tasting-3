import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  ArrowLeft,
  CheckCircle,
  XCircle,
  FlaskConical,
  FileText,
  Save,
  AlertTriangle,
  Eye,
  Settings,
  Lock,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TastingSession, Sample, SampleEvaluation, SampleStatus } from '@/types';
import { mockSessions } from '@/lib/mock-data';
import { toast } from 'sonner';
import { LottieLoader } from '@/components/ui/lottie-loader';
import { SpecificationsTable } from '@/components/specifications-table/specifications-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SessionEvaluationPageProps {
  sessionId: string;
}

export function SessionEvaluationPage({ sessionId }: SessionEvaluationPageProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState<TastingSession | null>(null);
  const [evaluations, setEvaluations] = useState<SampleEvaluation[]>([]);
  const [sampleStatuses, setSampleStatuses] = useState<SampleStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSampleType, setSelectedSampleType] = useState<string>('all');

  useEffect(() => {
    // Simular carregamento da sessão
    const foundSession = mockSessions.find(s => s.id === sessionId);
    if (foundSession) {
      setSession(foundSession);
      // Inicializar avaliações com status padrão "conforme"
      const initialEvaluations: SampleEvaluation[] = foundSession.amostras.map(sample => ({
        id: `eval-${sample.id}`,
        sampleId: sample.id,
        sessionId: sessionId,
        status: 'conforme',
        evaluatedBy: 'current-user',
        evaluatedAt: new Date().toISOString(),
      }));
      setEvaluations(initialEvaluations);
      
      // Simular status das amostras (algumas já finalizadas)
      const initialStatuses: SampleStatus[] = foundSession.amostras.map((sample, index) => ({
        id: `status-${sample.id}`,
        sampleId: sample.id,
        // Simular que algumas amostras já foram finalizadas (para demonstração)
        isFinalized: index % 4 === 0, // A cada 4 amostras, uma já está finalizada
        finalizedAt: index % 4 === 0 ? new Date().toISOString() : undefined,
        finalizedBy: index % 4 === 0 ? 'previous-user' : undefined,
      }));
      setSampleStatuses(initialStatuses);
    }
    setLoading(false);
  }, [sessionId]);

  const updateEvaluation = (sampleId: string, updates: Partial<SampleEvaluation>) => {
    setEvaluations(prev => prev.map(evaluation => 
      evaluation.sampleId === sampleId 
        ? { ...evaluation, ...updates, evaluatedAt: new Date().toISOString() }
        : evaluation
    ));
  };

  const handleToggleExclusion = (sampleId: string, isExcluded: boolean) => {
    updateEvaluation(sampleId, { isExcluded });
    const action = isExcluded ? 'excluída temporariamente' : 'incluída novamente';
    toast.success(`Amostra ${action} da finalização`);
  };

  const isLocked = (sampleId: string) => {
    const status = sampleStatuses.find(s => s.sampleId === sampleId);
    return status?.isFinalized || false;
  };

  const handleFinalizeAllSamples = () => {
    // Finalizar apenas amostras não excluídas e não já finalizadas
    setSampleStatuses(prev => prev.map(status => {
      const evaluation = evaluations.find(e => e.sampleId === status.sampleId);
      const shouldFinalize = !evaluation?.isExcluded && !status.isFinalized;
      
      return shouldFinalize ? {
        ...status,
        isFinalized: true,
        finalizedAt: new Date().toISOString(),
        finalizedBy: 'current-user',
      } : status;
    }));
    
    const finalizedCount = sampleStatuses.filter(status => {
      const evaluation = evaluations.find(e => e.sampleId === status.sampleId);
      return !evaluation?.isExcluded && !status.isFinalized;
    }).length;
    
    toast.success(`${finalizedCount} amostras foram finalizadas e bloqueadas`);
  };

  const handleToggleCompliance = (sampleId: string, isCompliant: boolean) => {
    updateEvaluation(sampleId, {
      status: isCompliant ? 'conforme' : 'nao-conforme',
      comment: isCompliant ? undefined : evaluations.find(e => e.sampleId === sampleId)?.comment
    });
  };

  const handleCommentChange = (sampleId: string, comment: string) => {
    updateEvaluation(sampleId, { comment });
  };

  const handleMarkAllCompliant = () => {
    setEvaluations(prev => prev.map(evaluation => ({
      ...evaluation,
      status: 'conforme',
      comment: undefined,
      evaluatedAt: new Date().toISOString(),
    })));
    toast.success('Todas as amostras marcadas como conformes');
  };

  const handleMarkAllNonCompliant = () => {
    setEvaluations(prev => prev.map(evaluation => ({
      ...evaluation,
      status: 'nao-conforme',
      evaluatedAt: new Date().toISOString(),
    })));
    toast.success('Todas as amostras marcadas como não conformes');
  };

  const handleSaveEvaluations = () => {
    // Simular salvamento
    toast.success('Avaliações salvas com sucesso!');
  };

  const handleFinalizeSession = () => {
    // Simular finalização da sessão
    toast.success('Sessão finalizada com sucesso!');
    navigate({ to: '/sessions' });
  };

  // Get unique sample types from session samples
  const availableSampleTypes = session ? ['all', ...new Set(session.amostras.map(sample => sample.type))] : ['all'];

  // Filter samples based on selected type
  const filteredSamples = session ? session.amostras.filter(sample => 
    selectedSampleType === 'all' || sample.type === selectedSampleType
  ) : [];

  const getComplianceStats = () => {
    // Calculate stats based on filtered samples
    const filteredEvaluations = evaluations.filter(evaluation => {
      const sample = filteredSamples.find(s => s.id === evaluation.sampleId);
      return sample && !evaluation.isExcluded; // Excluir amostras marcadas como excluídas
    });
    
    const compliant = filteredEvaluations.filter(e => e.status === 'conforme').length;
    const nonCompliant = filteredEvaluations.filter(e => e.status === 'nao-conforme').length;
    const excluded = evaluations.filter(e => 
      filteredSamples.some(s => s.id === e.sampleId) && e.isExcluded
    ).length;
    const locked = sampleStatuses.filter(status => 
      filteredSamples.some(s => s.id === status.sampleId) && status.isFinalized
    ).length;
    const total = filteredEvaluations.length;
    const percentage = total > 0 ? (compliant / total) * 100 : 0;

    return { compliant, nonCompliant, excluded, locked, total, percentage };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beer-light via-background to-beer-light/50">
        <div className="text-center">
          <LottieLoader size="lg" />
          <div className="mt-4 space-y-2">
            <p className="text-lg font-medium text-beer-dark">Carregando sessão...</p>
            <p className="text-sm text-muted-foreground">Preparando interface de avaliação</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-beer-dark">Sessão não encontrada</h2>
          <p className="mt-2 text-muted-foreground">A sessão solicitada não existe ou foi removida.</p>
          <Button 
            onClick={() => navigate({ to: '/sessions' })}
            className="mt-4 bg-beer-medium hover:bg-beer-dark"
          >
            Voltar para Sessões
          </Button>
        </div>
      </div>
    );
  }

  const stats = getComplianceStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-beer-light via-background to-beer-light/50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/sessions' })}
              className="text-beer-dark hover:bg-beer-light/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-beer-dark">{session.nome}</h1>
              <p className="text-muted-foreground">
                {format(new Date(session.data), 'dd/MM/yyyy', { locale: ptBR })} às {session.horario}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
              {session.status === 'active' ? 'Ativa' : 'Rascunho'}
            </Badge>
            <Badge variant={session.type === 'routine' ? 'default' : 'secondary'}>
              {session.type === 'routine' ? 'Rotina' : 'Extra'}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Amostras</CardTitle>
              <FlaskConical className="h-4 w-4 text-beer-medium" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-beer-dark">{filteredSamples.length}</div>
              <p className="text-xs text-muted-foreground">
                {selectedSampleType === 'all' ? 'Todas as amostras' : `Tipo: ${selectedSampleType}`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conformes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
            </CardContent>
          </Card>

          <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Não Conformes</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.nonCompliant}</div>
            </CardContent>
          </Card>

          <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excluídas</CardTitle>
              <XCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.excluded}</div>
            </CardContent>
          </Card>

          <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
              <Lock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.locked}</div>
            </CardContent>
          </Card>

          <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
              <Eye className="h-4 w-4 text-beer-medium" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-beer-dark">{stats.percentage.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="evaluation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="evaluation">Avaliação das Amostras</TabsTrigger>
            <TabsTrigger value="specifications">Especificações</TabsTrigger>
          </TabsList>

          <TabsContent value="evaluation" className="space-y-6">
            {/* Sample Type Filter */}
            <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-beer-dark">
                  <FlaskConical className="h-5 w-5" />
                  Filtrar por Tipo de Amostra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <Select value={selectedSampleType} onValueChange={setSelectedSampleType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSampleTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === 'all' ? 'Todos os tipos' : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mostrando {filteredSamples.length} de {session?.amostras.length || 0} amostras
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-beer-dark">
                  <Settings className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Mark only filtered samples as compliant
                      setEvaluations(prev => prev.map(evaluation => {
                        const isFiltered = filteredSamples.some(sample => sample.id === evaluation.sampleId);
                        const isLocked = sampleStatuses.find(s => s.sampleId === evaluation.sampleId)?.isFinalized;
                        return isFiltered && !evaluation.isExcluded && !isLocked ? {
                          ...evaluation,
                          status: 'conforme',
                          comment: undefined,
                          evaluatedAt: new Date().toISOString(),
                        } : evaluation;
                      }));
                      toast.success(`Amostras ${selectedSampleType === 'all' ? 'de todos os tipos' : `do tipo ${selectedSampleType}`} marcadas como conformes`);
                    }}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    disabled={filteredSamples.length === 0 || evaluations.filter(e => 
                      filteredSamples.some(s => s.id === e.sampleId) && !e.isExcluded && !sampleStatuses.find(st => st.sampleId === e.sampleId)?.isFinalized
                    ).length === 0}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar {selectedSampleType === 'all' ? 'Todas' : 'Filtradas'} Conformes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Mark only filtered samples as non-compliant
                      setEvaluations(prev => prev.map(evaluation => {
                        const isFiltered = filteredSamples.some(sample => sample.id === evaluation.sampleId);
                        const isLocked = sampleStatuses.find(s => s.sampleId === evaluation.sampleId)?.isFinalized;
                        return isFiltered && !evaluation.isExcluded && !isLocked ? {
                          ...evaluation,
                          status: 'nao-conforme',
                          evaluatedAt: new Date().toISOString(),
                        } : evaluation;
                      }));
                      toast.success(`Amostras ${selectedSampleType === 'all' ? 'de todos os tipos' : `do tipo ${selectedSampleType}`} marcadas como não conformes`);
                    }}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    disabled={filteredSamples.length === 0 || evaluations.filter(e => 
                      filteredSamples.some(s => s.id === e.sampleId) && !e.isExcluded && !sampleStatuses.find(st => st.sampleId === e.sampleId)?.isFinalized
                    ).length === 0}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Marcar {selectedSampleType === 'all' ? 'Todas' : 'Filtradas'} Não Conformes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleFinalizeAllSamples}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    disabled={sampleStatuses.every(s => s.isFinalized)}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Finalizar Todas
                  </Button>
                  <Button
                    onClick={handleSaveEvaluations}
                    className="bg-beer-medium hover:bg-beer-dark"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Avaliações
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-beer-dark">Finalizar Sessão</h3>
                    <p className="text-sm text-muted-foreground">
                      Conclui a sessão e gera o relatório final
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Finalizar Sessão
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Finalizar Sessão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja finalizar esta sessão? Após a finalização, 
                          não será possível alterar as avaliações. Um relatório final será gerado.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleFinalizeSession}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Finalizar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            {/* Sample Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSamples.map((sample, index) => {
                const evaluation = evaluations.find(e => e.sampleId === sample.id);
                const sampleStatus = sampleStatuses.find(s => s.sampleId === sample.id);
                const isCompliant = evaluation?.status === 'conforme';
                const isExcluded = evaluation?.isExcluded || false;
                const isLocked = sampleStatus?.isFinalized || false;
                const originalIndex = session?.amostras.findIndex(s => s.id === sample.id) || 0;

                return (
                  <Card 
                    key={sample.id} 
                    className={`border-2 transition-all duration-200 relative ${
                      isLocked 
                        ? 'border-orange-300 bg-orange-50/50 opacity-75' 
                        : isExcluded 
                        ? 'border-gray-300 bg-gray-50/50 opacity-60'
                        : isCompliant 
                        ? 'border-green-200 bg-green-50/50' 
                        : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    {/* X Button for Exclusion - Only show if not locked */}
                    {!isLocked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleExclusion(sample.id, !isExcluded)}
                        className={`absolute top-2 right-2 z-10 h-6 w-6 p-0 rounded-full ${
                          isExcluded 
                            ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }`}
                        title={isExcluded ? 'Incluir na finalização' : 'Excluir da finalização'}
                      >
                        {isExcluded ? <Plus className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      </Button>
                    )}

                    {/* Status Indicators for Locked */}
                    {isLocked && (
                      <div className="absolute top-2 right-2 z-10 pointer-events-none">
                        <div className="flex items-center gap-1 bg-orange-100 border border-orange-300 rounded-full px-2 py-1">
                          <Lock className="h-3 w-3 text-orange-600" />
                          <span className="text-xs font-medium text-orange-800">Finalizada</span>
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium text-white text-sm font-medium">
                            {originalIndex + 1}
                          </div>
                          <div>
                            <CardTitle className={`text-lg ${isLocked ? 'text-orange-800' : isExcluded ? 'text-gray-600' : 'text-beer-dark'}`}>
                              {sample.code}
                              {isExcluded && !isLocked && (
                                <span className="ml-2 text-xs text-gray-500">(Excluída)</span>
                              )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{sample.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{sample.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Lote:</span> {sample.batch}
                        </div>
                        <div>
                          <span className="font-medium">Produção:</span>{' '}
                          {format(new Date(sample.productionDate), 'dd/MM/yyyy')}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`compliance-${sample.id}`} className="text-sm font-medium">
                            {isLocked ? 'Status Finalizado' : 'Status de Conformidade'}
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${
                              isLocked ? 'text-orange-600' : 
                              isExcluded ? 'text-gray-600' : 
                              isCompliant ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isLocked ? 'Finalizada' : 
                               isExcluded ? 'Excluída' : 
                               isCompliant ? 'Conforme' : 'Não Conforme'}
                            </span>
                            <Switch
                              id={`compliance-${sample.id}`}
                              checked={isCompliant}
                              onCheckedChange={(checked) => handleToggleCompliance(sample.id, checked)}
                              disabled={isLocked || isExcluded}
                            />
                          </div>
                        </div>

                        {!isCompliant && !isExcluded && !isLocked && (
                          <div className="space-y-2">
                            <Label htmlFor={`comment-${sample.id}`} className="text-sm font-medium">
                              Comentário sobre Não Conformidade
                            </Label>
                            <Textarea
                              id={`comment-${sample.id}`}
                              placeholder="Descreva o problema encontrado..."
                              value={evaluation?.comment || ''}
                              onChange={(e) => handleCommentChange(sample.id, e.target.value)}
                              rows={3}
                              className="text-sm"
                              disabled={isLocked || isExcluded}
                            />
                          </div>
                        )}

                        {/* Finalization Info for Locked Samples */}
                        {isLocked && sampleStatus?.finalizedAt && (
                          <div className="pt-2 border-t bg-orange-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                            <div className="text-xs text-orange-700 space-y-1">
                              <p><strong>Finalizada em:</strong> {format(new Date(sampleStatus.finalizedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                              {sampleStatus.finalizedBy && (
                                <p><strong>Finalizada por:</strong> {sampleStatus.finalizedBy}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-6">
            <SpecificationsTable samples={filteredSamples} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}