import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Filter, Plus, X, Settings } from 'lucide-react';
import { TastingFilter, TastingSpecification } from '@/types/tasting-interface';
import { cn } from '@/lib/utils';

interface TastingFiltersProps {
  activeFilters: TastingFilter[];
  specifications: TastingSpecification[];
  onApplyFilter: (filter: TastingFilter) => void;
  onRemoveFilter: (filterId: string) => void;
  onClearAllFilters: () => void;
}

const filterOperators = [
  { value: 'equals', label: 'Igual a' },
  { value: 'contains', label: 'Contém' },
  { value: 'greater', label: 'Maior que' },
  { value: 'less', label: 'Menor que' },
  { value: 'between', label: 'Entre' },
  { value: 'in', label: 'Em lista' },
];

const filterableFields = [
  { value: 'type', label: 'Tipo de Amostra', type: 'text' },
  { value: 'batch', label: 'Lote', type: 'text' },
  { value: 'groupCategory', label: 'Categoria', type: 'text' },
  { value: 'productionDate', label: 'Data de Produção', type: 'date' },
  { value: 'status', label: 'Status Geral', type: 'select' },
];

export function TastingFilters({
  activeFilters,
  specifications,
  onApplyFilter,
  onRemoveFilter,
  onClearAllFilters
}: TastingFiltersProps) {
  const [newFilter, setNewFilter] = useState<Partial<TastingFilter>>({
    field: '',
    operator: 'equals',
    value: '',
    isActive: true
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddFilter = () => {
    if (!newFilter.field || !newFilter.operator || newFilter.value === '') return;

    const filter: TastingFilter = {
      id: `filter-${Date.now()}`,
      field: newFilter.field!,
      operator: newFilter.operator as any,
      value: newFilter.value,
      isActive: true
    };

    onApplyFilter(filter);
    setNewFilter({
      field: '',
      operator: 'equals',
      value: '',
      isActive: true
    });
    setIsDialogOpen(false);
  };

  const getFieldType = (fieldName: string) => {
    const field = filterableFields.find(f => f.value === fieldName);
    const spec = specifications.find(s => s.name === fieldName);
    
    if (field) return field.type;
    if (spec) {
      if (spec.testType === 'microbiological') return 'select';
      if (spec.testType === 'sensory' || spec.testType === 'chemical' || spec.testType === 'physical') return 'number';
    }
    return 'text';
  };

  const renderValueInput = () => {
    const fieldType = getFieldType(newFilter.field || '');
    
    switch (fieldType) {
      case 'number':
        return (
          <Input
            type="number"
            placeholder="Valor numérico"
            value={newFilter.value}
            onChange={(e) => setNewFilter(prev => ({ ...prev, value: e.target.value }))}
          />
        );
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newFilter.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newFilter.value ? (
                  format(new Date(newFilter.value), 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  "Selecione a data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newFilter.value ? new Date(newFilter.value) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setNewFilter(prev => ({ ...prev, value: format(date, 'yyyy-MM-dd') }));
                  }
                }}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        );
      case 'select':
        const options = newFilter.field === 'status' 
          ? ['compliant', 'non-compliant', 'pending']
          : ['Aprovado', 'Reprovado', 'Pendente'];
        
        return (
          <Select 
            value={newFilter.value} 
            onValueChange={(value) => setNewFilter(prev => ({ ...prev, value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            placeholder="Valor do filtro"
            value={newFilter.value}
            onChange={(e) => setNewFilter(prev => ({ ...prev, value: e.target.value }))}
          />
        );
    }
  };

  return (
    <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Filter className="h-5 w-5" />
            Filtros Ativos ({activeFilters.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Filtro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Filtro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Campo</Label>
                    <Select 
                      value={newFilter.field} 
                      onValueChange={(value) => setNewFilter(prev => ({ ...prev, field: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um campo" />
                      </SelectTrigger>
                      <SelectContent>
                        <optgroup label="Campos da Amostra">
                          {filterableFields.map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </optgroup>
                        <optgroup label="Especificações">
                          {specifications.map(spec => (
                            <SelectItem key={spec.name} value={spec.name}>
                              {spec.name} ({spec.unit || 'sem unidade'})
                            </SelectItem>
                          ))}
                        </optgroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Operador</Label>
                    <Select 
                      value={newFilter.operator} 
                      onValueChange={(value) => setNewFilter(prev => ({ ...prev, operator: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOperators.map(op => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor</Label>
                    {renderValueInput()}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddFilter} className="bg-beer-medium hover:bg-beer-dark">
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {activeFilters.length > 0 && (
              <Button variant="outline" size="sm" onClick={onClearAllFilters}>
                Limpar Todos
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                <span className="text-sm">
                  {filter.field} {filter.operator} {String(filter.value)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFilter(filter.id)}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum filtro ativo. Clique em "Adicionar Filtro" para começar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}