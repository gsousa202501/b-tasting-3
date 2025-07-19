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
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  Settings,
  Search,
  FlaskConical,
  Filter,
  RotateCcw,
  Download
} from 'lucide-react';
import { TransposedSampleData, TestColumn } from '@/types/samples-data';
import { useSamplesData } from '@/hooks/use-samples-data';
import { cn } from '@/lib/utils';
import { LottieLoader } from '@/components/ui/lottie-loader';

const columnHelper = createColumnHelper<TransposedSampleData>();

interface SamplesDataTableProps {
  className?: string;
}

export function SamplesDataTable({ className }: SamplesDataTableProps) {
  const { data, isLoading, error } = useSamplesData();
  
  const [grouping, setGrouping] = useState<GroupingState>(['sampleType']);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Create columns dynamically
  const columns = useMemo(() => {
    if (!data?.testColumns) return [];

    const baseColumns = [
      columnHelper.accessor('cod_amostra', {
        id: 'cod_amostra',
        header: 'Código da Amostra',
        cell: ({ getValue, row }) => {
          const value = getValue();
          return (
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
              <span className="font-medium">{value}</span>
            </div>
          );
        },
        enableGrouping: false,
        enableSorting: true,
      }),
      columnHelper.accessor('batch', {
        id: 'batch',
        header: 'Lote',
        cell: ({ getValue }) => (
          <Badge variant="outline">{getValue()}</Badge>
        ),
        enableGrouping: false,
      }),
      columnHelper.accessor('publicationStatus', {
        id: 'publicationStatus',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <Badge variant={
              status === 'published' ? 'default' :
              status === 'pending' ? 'secondary' : 'outline'
            }>
              {status === 'published' ? 'Publicado' :
               status === 'pending' ? 'Pendente' : 'Rascunho'}
            </Badge>
          );
        },
        enableGrouping: false,
      }),
    ];

    // Add test result columns
    const testColumns = data.testColumns.map((test: TestColumn) =>
      columnHelper.accessor(test.name as any, {
        id: test.id,
        header: () => (
          <div className="text-center">
            <div className="font-medium">{test.name}</div>
            {test.unit && <div className="text-xs text-muted-foreground">({test.unit})</div>}
          </div>
        ),
        cell: ({ getValue }) => {
          const testData = getValue() as any;
          if (!testData) return <span className="text-muted-foreground">-</span>;

          const { value, status, unit } = testData;
          
          return (
            <div className="text-center">
              <div className="font-medium">
                {typeof value === 'number' ? value.toFixed(2) : value}
                {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
              </div>
              {status && (
                <Badge 
                  variant={
                    status === 'approved' ? 'default' :
                    status === 'rejected' ? 'destructive' : 'secondary'
                  }
                  className="text-xs mt-1"
                >
                  {status === 'approved' ? 'OK' :
                   status === 'rejected' ? 'NOK' : 'Pend'}
                </Badge>
              )}
            </div>
          );
        },
        enableGrouping: false,
        enableSorting: true,
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId) as any;
          const b = rowB.getValue(columnId) as any;
          
          if (!a?.value || !b?.value) return 0;
          
          if (typeof a.value === 'number' && typeof b.value === 'number') {
            return a.value - b.value;
          }
          
          return String(a.value).localeCompare(String(b.value));
        },
      })
    );

    return [...baseColumns, ...testColumns];
  }, [data?.testColumns]);

  const table = useReactTable({
    data: data?.transposed || [],
    columns,
    state: {
      grouping,
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
      globalFilter,
    },
    onGroupingChange: setGrouping,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableGrouping: true,
    groupedColumnMode: false,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const resetFilters = () => {
    setGlobalFilter('');
    setColumnFilters([]);
    setSorting([]);
    setExpanded({});
  };

  if (isLoading) {
    return (
      <Card className={cn("border-beer-medium/20 bg-white/50 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <FlaskConical className="h-5 w-5" />
            Carregando Resultados de Ensaios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <LottieLoader size="lg" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-beer-dark">Carregando dados...</p>
                <p className="text-sm text-muted-foreground">Processando resultados de ensaios</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-beer-medium/20 bg-white/50 backdrop-blur-sm", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FlaskConical className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-beer-dark">
              Erro ao carregar dados
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Não foi possível carregar os dados das amostras.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-beer-medium/20 bg-white/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <FlaskConical className="h-5 w-5" />
            Resultados de Ensaios
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar em todos os campos..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="rounded-md border border-beer-medium/20 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-beer-light/30">
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        className="font-semibold text-beer-dark text-center"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex items-center justify-center gap-2",
                              header.column.getCanSort() && "cursor-pointer select-none hover:bg-beer-light/20 rounded p-1"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
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
                      data-state={row.getIsSelected() && "selected"}
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
                            cell.getIsGrouped() && "bg-beer-light/20",
                            cell.getIsAggregated() && "bg-beer-light/10",
                            cell.getIsPlaceholder() && "bg-muted/50"
                          )}
                        >
                          {cell.getIsGrouped() ? (
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
                              <span className="font-medium">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}{' '}
                                ({row.subRows.length})
                              </span>
                            </div>
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
                      <div className="flex flex-col items-center justify-center py-8">
                        <FlaskConical className="h-12 w-12 text-beer-medium opacity-50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Nenhum resultado encontrado.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              de {table.getFilteredRowModel().rows.length} resultados
            </span>
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-beer-dark">
              {data?.transposed?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Total de Amostras</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-beer-dark">
              {data?.testColumns?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Tipos de Ensaio</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-beer-dark">
              {new Set(data?.transposed?.map(s => s.sampleType)).size || 0}
            </div>
            <p className="text-sm text-muted-foreground">Tipos de Amostra</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data?.transposed?.filter(s => s.publicationStatus === 'published').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Publicados</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}