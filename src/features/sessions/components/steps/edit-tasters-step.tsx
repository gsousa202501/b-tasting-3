import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Search,
  Plus,
  X,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
  UserCheck,
  FileText
} from 'lucide-react';
import { Taster, TastingSession } from '@/types';
import { mockTasters } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface EditTastersStepProps {
  session: TastingSession;
  selectedTasters: Taster[];
  observations: string;
  onChange: (tasters: Taster[], observations: string) => void;
}

export function EditTastersStep({ 
  session, 
  selectedTasters, 
  observations, 
  onChange 
}: EditTastersStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const canRemoveTasters = session.status === 'nao_iniciado' || session.status === 'draft';

  // Get available active tasters
  const availableTasters = mockTasters.filter(taster => taster.isActive);
  
  // Get unique departments
  const departments = ['all', ...new Set(availableTasters.map(taster => taster.department))];

  // Categorizar degustadores
  const { existingTasters, newTasters } = useMemo(() => {
    const originalTasterIds = new Set(session.degustadores.map(t => t.id));
    const existing = selectedTasters.filter(t => originalTasterIds.has(t.id));
    const newOnes = selectedTasters.filter(t => !originalTasterIds.has(t.id));
    
    return {
      existingTasters: existing,
      newTasters: newOnes
    };
  }, [selectedTasters, session.degustadores]);

  // Filter available tasters for adding
  const filteredAvailableTasters = useMemo(() => {
    const selectedIds = new Set(selectedTasters.map(t => t.id));
    return availableTasters.filter(taster => {
      if (selectedIds.has(taster.id)) return false;
      
      const matchesSearch = searchTerm === '' || 
        taster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        taster.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        taster.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = filterDepartment === 'all' || taster.department === filterDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [availableTasters, selectedTasters, searchTerm, filterDepartment]);

  const handleAddTaster = (taster: Taster) => {
    onChange([...selectedTasters, taster], observations);
  };

  const handleRemoveTaster = (tasterId: string) => {
    if (!canRemoveTasters) return;
    const newTasters = selectedTasters.filter(t => t.id !== tasterId);
    onChange(newTasters, observations);
  };

  const handleObservationsChange = (value: string) => {
    onChange(selectedTasters, value);
  };

  const getStatusMessage = () => {
    switch (session.status) {
      case 'nao_iniciado':
      case 'draft':
        return {
          type: 'info' as const,
          icon: Info,
          message: 'Sessão não iniciada - Todas as operações de edição estão disponíveis'
        };
      case 'active':
        return {
          type: 'warning' as const,
          icon: AlertTriangle,
          message: 'Sessão ativa - Apenas adição de novos degustadores permitida'
        };
      case 'completed':
        return {
          type: 'error' as const,
          icon: Lock,
          message: 'Sessão concluída - Nenhuma alteração permitida nos degustadores'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {statusInfo && (
        <Alert variant={statusInfo.type === 'error' ? 'destructive' : 'default'}>
          <statusInfo.icon className="h-4 w-4" />
          <AlertDescription>{statusInfo.message}</AlertDescription>
        </Alert>
      )}

      {/* Selected Tasters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Users className="h-5 w-5" />
            Degustadores Selecionados ({selectedTasters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTasters.length > 0 ? (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Já selecionados ({existingTasters.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Novos degustadores ({newTasters.length})</span>
                </div>
                {!canRemoveTasters && (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Remoção travada</span>
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {selectedTasters.map((taster) => {
                  const isExisting = session.degustadores.some(t => t.id === taster.id);
                  return (
                    <div
                      key={taster.id}
                      className={cn(
                        "flex items-center gap-4 p-4 border rounded-lg transition-colors",
                        isExisting ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                      )}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-beer-medium text-white font-medium">
                        {taster.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-beer-dark">{taster.name}</p>
                          {isExisting ? (
                            <CheckCircle className="h-4 w-4 text-green-600" title="Degustador já selecionado" />
                          ) : (
                            <Plus className="h-4 w-4 text-blue-600" title="Novo degustador" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{taster.email}</p>
                      </div>
                      
                      <Badge variant="outline">
                        {taster.department}
                      </Badge>

                      <div className="flex items-center">
                        {canRemoveTasters ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTaster(taster.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span className="text-xs">Travado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum degustador selecionado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Tasters - Only show if not completed */}
      {session.status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <Plus className="h-5 w-5" />
              Adicionar Novos Degustadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou departamento..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-input rounded-md bg-background"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">Todos os departamentos</option>
                {departments.slice(1).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {filteredAvailableTasters.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Degustador</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead className="w-[100px]">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAvailableTasters.map((taster) => (
                      <TableRow key={taster.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium text-white text-sm font-medium">
                              {taster.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-medium">{taster.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{taster.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{taster.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAddTaster(taster)}
                            className="bg-beer-medium hover:bg-beer-dark"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6">
                <Search className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm ? 'Nenhum degustador encontrado' : 'Todos os degustadores já foram selecionados'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Observations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <FileText className="h-5 w-5" />
            Observações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="observations">
            Observações sobre esta sessão de degustação
          </Label>
          <Textarea
            id="observations"
            placeholder="Ex: Foco na análise de amargor e aroma. Verificar consistência com lote anterior..."
            rows={4}
            value={observations}
            onChange={(e) => handleObservationsChange(e.target.value)}
            disabled={session.status === 'completed'}
          />
          {session.status === 'completed' && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Observações não podem ser editadas em sessões concluídas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-beer-medium/30 bg-beer-light/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{existingTasters.length}</p>
              <p className="text-sm text-muted-foreground">Degustadores Originais</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{newTasters.length}</p>
              <p className="text-sm text-muted-foreground">Novos Degustadores</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-beer-dark">{selectedTasters.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}