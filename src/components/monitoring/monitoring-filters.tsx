import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { MonitoringFilters } from '@/types/monitoring';
import { cn } from '@/lib/utils';

interface MonitoringFiltersProps {
  filters: MonitoringFilters;
  onUpdateFilter: (key: keyof MonitoringFilters, value: any) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: 'compliant', label: 'Conforme', color: 'bg-green-500' },
  { value: 'non-compliant', label: 'Não Conforme', color: 'bg-red-500' },
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'critical', label: 'Crítico', color: 'bg-red-700' }
];

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-500' },
  { value: 'medium', label: 'Média', color: 'bg-blue-500' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-600' }
];

const productTypes = [
  'IPA Premium',
  'Pilsner Especial', 
  'Lager Tradicional',
  'Weiss Artesanal',
  'Porter Escuro'
];

export function MonitoringFiltersComponent({ filters, onUpdateFilter, onClearFilters }: MonitoringFiltersProps) {
  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    onUpdateFilter('status', newStatus);
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newPriority = checked 
      ? [...filters.priority, priority]
      : filters.priority.filter(p => p !== priority);
    onUpdateFilter('priority', newPriority);
  };

  const handleProductTypeChange = (productType: string, checked: boolean) => {
    const newProductTypes = checked 
      ? [...filters.productType, productType]
      : filters.productType.filter(p => p !== productType);
    onUpdateFilter('productType', newProductTypes);
  };

  const activeFiltersCount = 
    filters.status.length + 
    filters.priority.length + 
    filters.productType.length + 
    (filters.dateRange ? 1 : 0) +
    (filters.searchTerm ? 1 : 0);

  return (
    <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Filter className="h-5 w-5" />
            Filtros ({activeFiltersCount})
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpar Todos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label>Busca Geral</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, produto ou lote..."
              value={filters.searchTerm}
              onChange={(e) => onUpdateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label>Status de Conformidade</Label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filters.status.includes(option.value)}
                  onCheckedChange={(checked) => handleStatusChange(option.value, checked as boolean)}
                />
                <Label htmlFor={`status-${option.value}`} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${option.color}`} />
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <Label>Prioridade</Label>
          <div className="grid grid-cols-2 gap-2">
            {priorityOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${option.value}`}
                  checked={filters.priority.includes(option.value)}
                  onCheckedChange={(checked) => handlePriorityChange(option.value, checked as boolean)}
                />
                <Label htmlFor={`priority-${option.value}`} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${option.color}`} />
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Product Type Filter */}
        <div className="space-y-3">
          <Label>Tipo de Produto</Label>
          <div className="space-y-2">
            {productTypes.map(productType => (
              <div key={productType} className="flex items-center space-x-2">
                <Checkbox
                  id={`product-${productType}`}
                  checked={filters.productType.includes(productType)}
                  onCheckedChange={(checked) => handleProductTypeChange(productType, checked as boolean)}
                />
                <Label htmlFor={`product-${productType}`} className="text-sm">
                  {productType}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-3">
          <Label>Período de Produção</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.start && filters.dateRange?.end ? (
                  <>
                    {format(new Date(filters.dateRange.start), 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                    {format(new Date(filters.dateRange.end), 'dd/MM/yyyy', { locale: ptBR })}
                  </>
                ) : filters.dateRange?.start ? (
                  format(new Date(filters.dateRange.start), 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  "Selecione o período"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={filters.dateRange ? {
                  from: new Date(filters.dateRange.start),
                  to: filters.dateRange.end ? new Date(filters.dateRange.end) : undefined
                } : undefined}
                onSelect={(range: DateRange | undefined) => {
                  if (range?.from && range?.to) {
                    onUpdateFilter('dateRange', {
                      start: format(range.from, 'yyyy-MM-dd'),
                      end: format(range.to, 'yyyy-MM-dd')
                    });
                  } else if (range?.from) {
                    onUpdateFilter('dateRange', {
                      start: format(range.from, 'yyyy-MM-dd'),
                      end: format(range.from, 'yyyy-MM-dd')
                    });
                  } else {
                    onUpdateFilter('dateRange', null);
                  }
                }}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          {filters.dateRange && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onUpdateFilter('dateRange', null)}
              className="w-full"
            >
              Limpar período
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <Label>Filtros Ativos</Label>
            <div className="flex flex-wrap gap-1">
              {filters.status.map(status => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {statusOptions.find(s => s.value === status)?.label}
                </Badge>
              ))}
              {filters.priority.map(priority => (
                <Badge key={priority} variant="secondary" className="text-xs">
                  {priorityOptions.find(p => p.value === priority)?.label}
                </Badge>
              ))}
              {filters.productType.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
              {filters.dateRange && (
                <Badge variant="secondary" className="text-xs">
                  {format(new Date(filters.dateRange.start), 'dd/MM', { locale: ptBR })} - 
                  {filters.dateRange.end && format(new Date(filters.dateRange.end), 'dd/MM', { locale: ptBR })}
                </Badge>
              )}
              {filters.searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  "{filters.searchTerm}"
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}