import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  GroupingState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnPinningState,
  ExpandedState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pin,
  PinOff,
  Settings,
  Eye,
  EyeOff,
  Group,
  MoreHorizontal,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sample } from '@/types';
import { cn } from '@/lib/utils';

interface SpecificationResult {
  sampleId: string;
  testName: string;
  value: number | string;
  unit?: string;
  status: 'conforme' | 'nao-conforme' | 'pendente';
  expectedRange?: { min: number; max: number };
  notes?: string;
}

interface SpecificationsTableProps {
  samples: Sample[];
  className?: string;
}

// Mock data para ensaios/especificações
const mockTestTypes = [
  { id: 'ph', name: 'pH', unit: '', type: 'numeric', expectedRange: { min: 3.8, max: 4.5 } },
  { id: 'alcohol', name: 'Teor Alcoólico', unit: '%', type: 'numeric', expectedRange: { min: 4.0, max: 7.0 } },
  { id: 'bitterness', name: 'Amargor', unit: 'IBU', type: 'numeric', expectedRange: { min: 15, max: 80 } },
  { id: 'color', name: 'Cor', unit: 'EBC', type: 'numeric', expectedRange: { min: 4, max: 40 } },
  { id: 'density', name: 'Densidade', unit: 'g/mL', type: 'numeric', expectedRange: { min: 1.008, max: 1.020 } },
  { id: 'turbidity', name: 'Turbidez', unit: 'NTU', type: 'numeric', expectedRange: { min: 0, max: 5 } },
  { id: 'microbiological', name: 'Microbiológico', unit: '', type: 'status' },
  { id: 'sensory', name: 'Sensorial', unit: '', type: 'status' }
];

// Gerar dados mock para especificações
const generateSpecificationResults = (samples: Sample[]): SpecificationResult[] => {
  const results: SpecificationResult[] = [];
  
  samples.forEach(sample => {
    mockTestTypes.forEach(test => {
      let value: number | string;
      let status: 'conforme' | 'nao-conforme' | 'pendente';
      
      if (test.type === 'numeric' && test.expectedRange) {
        const randomValue = test.expectedRange.min + Math.random() * (test.expectedRange.max - test.expectedRange.min);
        const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
        value = +(randomValue * (1 + variation)).toFixed(2);
        status = value >= test.expectedRange.min && value <= test.expectedRange.max ? 'conforme' : 'nao-conforme';
      } else {
        value = ['Aprovado', 'Reprovado', 'Pendente'][Math.floor(Math.random() * 3)];
        status = value === 'Aprovado' ? 'conforme' : value === 'Reprovado' ? 'nao-conforme' : 'pendente';
      }
      
      // Adicionar alguns pendentes aleatoriamente
      if (Math.random() < 0.1) {
        status = 'pendente';
      }
      
      results.push({
        sampleId: sample.id,
        testName: test.name,
        value,
        unit: test.unit,
        status,
        expectedRange: test.expectedRange,
        notes: status === 'nao-conforme' ? 'Valor fora da especificação' : undefined
      });
    });
  });
  
  return results;
};

const columnHelper = createColumnHelper<Sample>();

export function SpecificationsTable({ samples, className }: SpecificationsTableProps) {
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Gerar dados de especificações
  const specificationResults = useMemo(() => 
    generateSpecificationResults(samples), [samples]
  );

  // Criar colunas dinamicamente
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('code', {
        id: 'code',
        header: ({ column }) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Código</span>
              <ColumnHeaderMenu column={column} />
            </div>
            <ColumnFilter column={column} type="input" />
          </div>
        ),
        cell: ({ getValue, row }) => (
          <div className="flex items-center gap-2">
            {row.getCanExpand() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={row.getToggleExpandedHandler()}
                className="p-0 h-6 w-6"
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="font-medium cursor-pointer hover:text-beer-medium">
                    {getValue()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <SampleTooltipContent sample={row.original} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        enableGrouping: false,
        enablePinning: true,
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: ({ column }) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Tipo</span>
              <ColumnHeaderMenu column={column} />
            </div>
            <ColumnFilter column={column} type="multiselect" options={[...new Set(samples.map(s => s.type))]} />
          </div>
        ),
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) {
            return (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={row.getToggleExpandedHandler()}
                  className="p-0 h-6 w-6"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <Badge variant="outline">{getValue()}</Badge>
                <span className="text-sm text-muted-foreground">({row.subRows.length})</span>
              </div>
            );
          }
          return <Badge variant="outline">{getValue()}</Badge>;
        },
        enablePinning: true,
      }),
      columnHelper.accessor('batch', {
        id: 'batch',
        header: ({ column }) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Lote</span>
              <ColumnHeaderMenu column={column} />
            </div>
            <ColumnFilter column={column} type="multiselect" options={[...new Set(samples.map(s => s.batch))]} />
          </div>
        ),
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) {
            return (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={row.getToggleExpandedHandler()}
                  className="p-0 h-6 w-6"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <Badge variant="secondary" className="font-mono text-xs">{getValue()}</Badge>
                <span className="text-sm text-muted-foreground">({row.subRows.length})</span>
              </div>
            );
          }
          return (
            <Badge variant="secondary" className="font-mono text-xs">
              {getValue()}
            </Badge>
          );
        },
        enableGrouping: false,
        enablePinning: true,
      }),
    ];

    // Adicionar colunas de especificações
    const specColumns = mockTestTypes.map(test =>
      columnHelper.display({
        id: test.id,
        header: ({ column }) => (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div>
                <div className="font-medium">{test.name}</div>
                {test.unit && (
                  <div className="text-xs text-muted-foreground">({test.unit})</div>
                )}
              </div>
              <ColumnHeaderMenu column={column} />
            </div>
            <ColumnFilter 
              column={column} 
              type="multiselect" 
              options={['conforme', 'nao-conforme', 'pendente']}
              customFilter={(rows, columnId, filterValue) => {
                if (!filterValue || filterValue.length === 0) return rows;
                return rows.filter(row => {
                  const result = specificationResults.find(
                    r => r.sampleId === row.original.id && r.testName === test.name
                  );
                  return result && filterValue.includes(result.status);
                });
              }}
            />
          </div>
        ),
        cell: ({ row }) => {
          if (row.getIsGrouped()) {
            return (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={row.getToggleExpandedHandler()}
                  className="p-0 h-6 w-6"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">({row.subRows.length})</span>
              </div>
            );
          }

          const result = specificationResults.find(
            r => r.sampleId === row.original.id && r.testName === test.name
          );
          
          if (!result) return <span className="text-muted-foreground">-</span>;

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-pointer">
                    <div className={cn(
                      "font-medium px-2 py-1 rounded text-sm",
                      result.status === 'conforme' && "bg-green-100 text-green-800",
                      result.status === 'nao-conforme' && "bg-red-100 text-red-800",
                      result.status === 'pendente' && "bg-yellow-100 text-yellow-800"
                    )}>
                      {typeof result.value === 'number' ? result.value.toFixed(2) : result.value}
                      {result.unit && <span className="text-xs ml-1">{result.unit}</span>}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <SpecificationTooltipContent result={result} test={test} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableGrouping: false,
        enableSorting: true,
        filterFn: 'custom',
        sortingFn: (rowA, rowB) => {
          const resultA = specificationResults.find(
            r => r.sampleId === rowA.original.id && r.testName === test.name
          );
          const resultB = specificationResults.find(
            r => r.sampleId === rowB.original.id && r.testName === test.name
          );
          
          if (!resultA || !resultB) return 0;
          
          // Ordenar por status primeiro, depois por valor
          const statusOrder = { 'nao-conforme': 3, 'pendente': 2, 'conforme': 1 };
          const statusDiff = statusOrder[resultA.status] - statusOrder[resultB.status];
          
          if (statusDiff !== 0) return statusDiff;
          
          if (typeof resultA.value === 'number' && typeof resultB.value === 'number') {
            return resultA.value - resultB.value;
          }
          
          return String(resultA.value).localeCompare(String(resultB.value));
        },
      })
    );

    return [...baseColumns, ...specColumns];
  }, [specificationResults, samples]);

  const table = useReactTable({
    data: samples,
    columns,
    state: {
      grouping,
      sorting,
      columnFilters,
      columnVisibility,
      columnPinning,
      expanded,
      globalFilter,
    },
    onGroupingChange: setGrouping,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableGrouping: true,
    enableColumnPinning: true,
    groupedColumnMode: false,
    initialState: {
      columnPinning: {
        left: ['code'],
      },
      pagination: {
        pageSize: 20,
      },
    },
  });

  const getSortIcon = (isSorted: false | 'asc' | 'desc') => {
    if (isSorted === 'asc') return <ArrowUp className="h-3 w-3" />;
    if (isSorted === 'desc') return <ArrowDown className="h-3 w-3" />;
    return <ArrowUpDown className="h-3 w-3" />;
  };

  return (
    <Card className={cn("border-beer-medium/20 bg-white/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-beer-dark">
            Especificações das Amostras
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border border-beer-medium/20 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-beer-light/30">
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        className={cn(
                          "font-semibold text-beer-dark relative",
                          header.column.getIsPinned() && "bg-beer-light/50 sticky z-10",
                          header.column.getIsPinned() === 'left' && "left-0",
                          header.column.getIsPinned() === 'right' && "right-0"
                        )}
                        style={{ 
                          width: header.getSize(),
                          minWidth: header.id === 'code' ? '120px' : '100px'
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "hover:bg-beer-light/20 transition-colors",
                        row.getIsGrouped() && "bg-beer-light/10 font-medium"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id}
                          className={cn(
                            "text-center",
                            cell.column.getIsPinned() && "bg-white/90 sticky z-10",
                            cell.column.getIsPinned() === 'left' && "left-0",
                            cell.column.getIsPinned() === 'right' && "right-0",
                            cell.getIsGrouped() && "bg-beer-light/20",
                            cell.getIsAggregated() && "bg-beer-light/10",
                            cell.getIsPlaceholder() && "bg-muted/50"
                          )}
                        >
                          {cell.getIsGrouped() ? (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          ) : cell.getIsAggregated() ? (
                            flexRender(
                              cell.column.columnDef.aggregatedCell ??
                                cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          ) : cell.getIsPlaceholder() ? null : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            de {table.getFilteredRowModel().rows.length} amostras
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próximo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para filtros específicos por coluna
interface ColumnFilterProps {
  column: any;
  type: 'input' | 'multiselect';
  options?: string[];
  customFilter?: (rows: any[], columnId: string, filterValue: any) => any[];
}

function ColumnFilter({ column, type, options = [], customFilter }: ColumnFilterProps) {
  const [filterValue, setFilterValue] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleMultiSelectChange = (value: string, checked: boolean) => {
    const newValue = checked 
      ? [...filterValue, value]
      : filterValue.filter(v => v !== value);
    
    setFilterValue(newValue);
    
    if (customFilter) {
      column.setFilterValue(newValue.length > 0 ? newValue : undefined);
    } else {
      // Para filtros padrão, usar o primeiro valor ou undefined
      column.setFilterValue(newValue.length > 0 ? newValue[0] : undefined);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    column.setFilterValue(value || undefined);
  };

  const clearFilter = () => {
    setFilterValue([]);
    setInputValue('');
    column.setFilterValue(undefined);
  };

  if (type === 'input') {
    return (
      <div className="relative">
        <Input
          placeholder="Filtrar..."
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="h-8 text-xs"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="absolute right-1 top-1 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (type === 'multiselect') {
    return (
      <div className="space-y-1">
        <div className="max-h-24 overflow-y-auto space-y-1">
          {options.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${column.id}-${option}`}
                checked={filterValue.includes(option)}
                onCheckedChange={(checked) => handleMultiSelectChange(option, checked as boolean)}
                className="h-3 w-3"
              />
              <Label htmlFor={`${column.id}-${option}`} className="text-xs cursor-pointer">
                {option === 'conforme' ? 'Conforme' :
                 option === 'nao-conforme' ? 'Não Conforme' :
                 option === 'pendente' ? 'Pendente' : option}
              </Label>
            </div>
          ))}
        </div>
        {filterValue.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="h-6 w-full text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar ({filterValue.length})
          </Button>
        )}
      </div>
    );
  }

  return null;
}

// Componente para menu do header da coluna
function ColumnHeaderMenu({ column }: { column: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Ordenação */}
        {column.getCanSort() && (
          <>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Ordenar Crescente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Ordenar Decrescente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.clearSorting()}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Limpar Ordenação
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Agrupamento */}
        {column.getCanGroup() && (
          <>
            <DropdownMenuItem onClick={() => column.getToggleGroupingHandler()()}>
              <Group className="mr-2 h-4 w-4" />
              {column.getIsGrouped() ? 'Desagrupar' : 'Agrupar'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Pin */}
        {column.getCanPin() && (
          <>
            <DropdownMenuItem onClick={() => column.pin('left')}>
              <Pin className="mr-2 h-4 w-4" />
              Fixar à Esquerda
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.pin('right')}>
              <Pin className="mr-2 h-4 w-4" />
              Fixar à Direita
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.pin(false)}>
              <PinOff className="mr-2 h-4 w-4" />
              Desfixar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Visibilidade */}
        <DropdownMenuItem onClick={() => column.toggleVisibility()}>
          {column.getIsVisible() ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Ocultar Coluna
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Mostrar Coluna
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Tooltip para informações da amostra
function SampleTooltipContent({ sample }: { sample: Sample }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium">{sample.code}</p>
        <p className="text-sm text-muted-foreground">{sample.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-medium">Tipo:</span> {sample.type}
        </div>
        <div>
          <span className="font-medium">Lote:</span> {sample.batch}
        </div>
        <div>
          <span className="font-medium">Produção:</span>{' '}
          {format(new Date(sample.productionDate), 'dd/MM/yyyy')}
        </div>
        <div>
          <span className="font-medium">Validade:</span>{' '}
          {format(new Date(sample.expirationDate), 'dd/MM/yyyy')}
        </div>
      </div>
      {sample.specifications && (
        <div className="text-xs">
          <span className="font-medium">pH:</span> {sample.specifications.ph?.toFixed(1)}
          {sample.specifications.alcoholContent && (
            <>
              {' | '}
              <span className="font-medium">Álcool:</span> {sample.specifications.alcoholContent.toFixed(1)}%
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Tooltip para informações da especificação
function SpecificationTooltipContent({ 
  result, 
  test 
}: { 
  result: SpecificationResult; 
  test: any;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium">{test.name}</p>
        <p className="text-sm text-muted-foreground">
          Status: <span className={cn(
            "font-medium",
            result.status === 'conforme' && "text-green-600",
            result.status === 'nao-conforme' && "text-red-600",
            result.status === 'pendente' && "text-yellow-600"
          )}>
            {result.status === 'conforme' ? 'Conforme' :
             result.status === 'nao-conforme' ? 'Não Conforme' : 'Pendente'}
          </span>
        </p>
      </div>
      
      <div className="text-xs space-y-1">
        <div>
          <span className="font-medium">Valor:</span> {result.value}
          {result.unit && <span> {result.unit}</span>}
        </div>
        
        {result.expectedRange && (
          <div>
            <span className="font-medium">Faixa Esperada:</span>{' '}
            {result.expectedRange.min} - {result.expectedRange.max}
            {result.unit && <span> {result.unit}</span>}
          </div>
        )}
        
        {result.notes && (
          <div>
            <span className="font-medium">Observações:</span> {result.notes}
          </div>
        )}
      </div>
    </div>
  );
}