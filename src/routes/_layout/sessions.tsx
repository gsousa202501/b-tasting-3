import { createFileRoute } from '@tanstack/react-router';
import { SessionsTable } from '@/features/sessions/components/sessions-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search, Filter, X, RotateCcw } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSessions } from '@/features/sessions/hooks/use-sessions';

export const Route = createFileRoute('/_layout/sessions')({
  component: Sessions,
});

function Sessions() {
  const { data: allSessions, isLoading } = useSessions();
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Inicializar com últimos 7 dias
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    return {
      from: sevenDaysAgo,
      to: today
    };
  });
  
  // Opções do select multiselect (bloqueadas por enquanto)
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['opcao1', 'opcao2']);

  // Filtrar sessões
  const filteredSessions = useMemo(() => {
    if (!allSessions) return [];

    let filtered = allSessions;

    // Filtro por range de data
    if (dateRange?.from) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.data);
        const fromDate = dateRange.from!;
        const toDate = dateRange.to || dateRange.from;
        
        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(session => session.type === typeFilter);
    }

    return filtered;
  }, [allSessions, dateRange, searchTerm, statusFilter, typeFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    setDateRange({
      from: sevenDaysAgo,
      to: today
    });
  };

  const activeFiltersCount = [
    searchTerm,
    statusFilter !== 'all' ? statusFilter : null,
    typeFilter !== 'all' ? typeFilter : null,
    dateRange?.from ? 'dateRange' : null
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
          Sessões de Degustação
        </h1>
        <p className="text-muted-foreground">
          Histórico completo de sessões com filtros avançados
        </p>
      </div>

      {/* Filtros */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <Filter className="h-5 w-5" />
              Filtros ({activeFiltersCount})
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Range de Data */}
            <div className="space-y-2">
              <Label>Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                          {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                      )
                    ) : (
                      "Selecione o período"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Select Multiselect (Bloqueado) */}
            <div className="space-y-2">
              <Label>Opções Automáticas</Label>
              <Select disabled>
                <SelectTrigger className="opacity-60">
                  <SelectValue placeholder="Definido automaticamente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opcao1">Opção 1</SelectItem>
                  <SelectItem value="opcao2">Opção 2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Configurado automaticamente pelo sistema
              </p>
            </div>

            {/* Busca */}
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome da sessão..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtros adicionais */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="routine">Rotina</SelectItem>
                  <SelectItem value="extra">Extra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resumo dos filtros ativos */}
            {activeFiltersCount > 0 && (
              <div className="space-y-2">
                <Label>Filtros Ativos</Label>
                <div className="flex flex-wrap gap-1">
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Busca: "{searchTerm}"
                    </Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {typeFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Tipo: {typeFilter}
                    </Badge>
                  )}
                  {dateRange?.from && (
                    <Badge variant="secondary" className="text-xs">
                      Período: {format(dateRange.from, 'dd/MM', { locale: ptBR })}
                      {dateRange.to && ` - ${format(dateRange.to, 'dd/MM', { locale: ptBR })}`}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-beer-dark">
            Sessões ({filteredSessions?.length || 0})
          </CardTitle>
          <CardDescription>
            {dateRange?.from && dateRange?.to ? (
              `Período: ${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`
            ) : (
              'Lista completa de sessões filtradas'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsTable filteredSessions={filteredSessions} />
        </CardContent>
      </Card>
    </div>
  );
}