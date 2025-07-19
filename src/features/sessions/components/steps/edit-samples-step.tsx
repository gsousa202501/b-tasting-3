import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FlaskConical,
  Search,
  Plus,
  X,
  GripVertical,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sample, TastingSession } from '@/types';
import { mockSamples } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface EditSamplesStepProps {
  session: TastingSession;
  selectedSamples: Sample[];
  onChange: (samples: Sample[]) => void;
}

interface SortableItemProps {
  sample: Sample;
  index: number;
  isExisting: boolean;
  canRemove: boolean;
  onRemove: (sampleId: string) => void;
}

function SortableItem({ sample, index, isExisting, canRemove, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sample.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 p-4 border rounded-lg transition-colors",
        isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-beer-light/20',
        isExisting ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
      )}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium text-white text-sm font-medium cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {index + 1}
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-beer-dark">{sample.code}</p>
            {isExisting ? (
              <CheckCircle className="h-4 w-4 text-green-600" title="Amostra já selecionada" />
            ) : (
              <Plus className="h-4 w-4 text-blue-600" title="Nova amostra" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{sample.description}</p>
        </div>
        <div>
          <Badge variant="outline">{sample.type}</Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{sample.batch}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(sample.productionDate), 'dd/MM/yyyy')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canRemove ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(sample.id)}
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
        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
      </div>
    </div>
  );
}

export function EditSamplesStep({ session, selectedSamples, onChange }: EditSamplesStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSamples] = useState(mockSamples);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const canRemoveSamples = session.status === 'nao_iniciado' || session.status === 'draft';

  // Categorizar amostras
  const { existingSamples, newSamples } = useMemo(() => {
    const originalSampleIds = new Set(session.amostras.map(s => s.id));
    const existing = selectedSamples.filter(s => originalSampleIds.has(s.id));
    const newOnes = selectedSamples.filter(s => !originalSampleIds.has(s.id));
    
    return {
      existingSamples: existing,
      newSamples: newOnes
    };
  }, [selectedSamples, session.amostras]);

  // Filtrar amostras disponíveis para adicionar
  const filteredAvailableSamples = useMemo(() => {
    const selectedIds = new Set(selectedSamples.map(s => s.id));
    return availableSamples.filter(sample => 
      !selectedIds.has(sample.id) &&
      (searchTerm === '' || 
        sample.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [availableSamples, selectedSamples, searchTerm]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = selectedSamples.findIndex(item => item.id === active.id);
      const newIndex = selectedSamples.findIndex(item => item.id === over?.id);

      const newOrder = arrayMove(selectedSamples, oldIndex, newIndex);
      onChange(newOrder);
    }
  };

  const handleAddSample = (sample: Sample) => {
    onChange([...selectedSamples, sample]);
  };

  const handleRemoveSample = (sampleId: string) => {
    if (!canRemoveSamples) return;
    onChange(selectedSamples.filter(s => s.id !== sampleId));
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
          message: 'Sessão ativa - Apenas reordenação e adição de novas amostras permitidas'
        };
      case 'completed':
        return {
          type: 'error' as const,
          icon: Lock,
          message: 'Sessão concluída - Apenas reordenação permitida'
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

      {/* Current Samples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <FlaskConical className="h-5 w-5" />
            Amostras Selecionadas ({selectedSamples.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSamples.length > 0 ? (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Já selecionadas ({existingSamples.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Novas amostras ({newSamples.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Sempre reordenável</span>
                </div>
                {!canRemoveSamples && (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Remoção travada</span>
                  </div>
                )}
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={selectedSamples.map(s => s.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {selectedSamples.map((sample, index) => {
                      const isExisting = session.amostras.some(s => s.id === sample.id);
                      return (
                        <SortableItem
                          key={sample.id}
                          sample={sample}
                          index={index}
                          isExisting={isExisting}
                          canRemove={canRemoveSamples}
                          onRemove={handleRemoveSample}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            <div className="text-center py-8">
              <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhuma amostra selecionada
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Samples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Plus className="h-5 w-5" />
            Adicionar Novas Amostras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar amostras disponíveis..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredAvailableSamples.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Produção</TableHead>
                    <TableHead className="w-[100px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvailableSamples.slice(0, 10).map((sample) => (
                    <TableRow key={sample.id}>
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
                        <Button
                          size="sm"
                          onClick={() => handleAddSample(sample)}
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
                {searchTerm ? 'Nenhuma amostra encontrada' : 'Todas as amostras já foram selecionadas'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-beer-medium/30 bg-beer-light/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{existingSamples.length}</p>
              <p className="text-sm text-muted-foreground">Amostras Originais</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{newSamples.length}</p>
              <p className="text-sm text-muted-foreground">Novas Amostras</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-beer-dark">{selectedSamples.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}