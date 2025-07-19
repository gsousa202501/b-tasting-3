import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  GroupingState,
  SortingState,
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { TastingSessionSample, TransposedTastingData, TastingSpecification } from '@/types/tasting-interface';
import { cn } from '@/lib/utils';

interface TastingDataTableProps {
  data: TastingSessionSample[] | TransposedTastingData[];
  specifications: TastingSpecification[];
  isTransposed: boolean;
  groupBy: string[];
  visibleColumns: string[];
  columnOrder: string[];
  onColumnReorder: (newOrder: string[]) => void;
  onEvaluationUpdate?: (sampleId: string, specId: string, value: any) => void;
}

const columnHelper = createColumnHelper<any>();

export function TastingDataTable({
  data,
  specifications,
  isTransposed,
  groupBy,
  visibleColumns,
  columnOrder,
  onColumnReorder,
  onEvaluationUpdate
}: TastingDataTableProps) {
  const [grouping, setGrouping] = useState<GroupingState>(groupBy);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Create columns based on transposed state
  const columns = useMemo(() => {
    if (isTransposed) {
      // Transposed view - specifications as columns
      const baseColumns = [
        columnHelper.accessor('sampleCode', {
          id: 'sampleCode',
          header: 'Código',
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
              <span className="font-medium">{getValue()}</span>
            </div>
          ),
          enableGrouping: false,
        }),
        columnHelper.accessor('sampleType', {
          id: 'sampleType',
          header: 'Tipo',
          cell: ({ getValue }) => (
            <Badge variant="outline">{getValue()}</Badge>
          ),
        }),
        columnHelper.accessor('batch', {
          id: 'batch',
          header: 'Lote',
          cell: ({ getValue }) => (
            <Badge variant="secondary">{getValue()}</Badge>
          ),
          enableGrouping: false,
        }),
      ];

      // Add specification columns
      const specColumns = specifications
        .filter(spec => visibleColumns.includes(spec.name))
        .sort((a, b) => {
          const aIndex = columnOrder.indexOf(a.name);
          const bIndex = columnOrder.indexOf(b.name);
          if (aIndex === -1 && bIndex === -1) return a.order - b.order;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        })
        .map(spec =>
          columnHelper.accessor(spec.name as any, {
            id: spec.id,
            header: () => (
              <div className="text-center">
                <div className="font-medium">{spec.name}</div>
                {spec.unit && (
                  <div className="text-xs text-muted-foreground">({spec.unit})</div>
                )}
              </div>
            ),
            cell: ({ getValue, row }) => {
              const testData = getValue() as any;
              if (!testData) return <span className="text-muted-foreground">-</span>;

              const { value, status, unit, confidence } = testData;
              
              return (
                <div className="text-center space-y-1">
                  <div className="font-medium">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                    {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Badge 
                      variant={
                        status === 'compliant' ? 'default' :
                        status === 'non-compliant' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {status === 'compliant' ? 'OK' :
                       status === 'non-compliant' ? 'NOK' : 'Pend'}
                    </Badge>
                    {confidence && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            },
            enableGrouping: false,
            enableSorting: true,
          })
        );

      return [...baseColumns, ...specColumns];
    } else {
      // Normal view - samples as rows
      return [
        columnHelper.accessor('code', {
          id: 'code',
          header: 'Código',
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
              <span className="font-medium">{getValue()}</span>
            </div>
          ),
          enableGrouping: false,
        }),
        columnHelper.accessor('type', {
          id: 'type',
          header: 'Tipo',
          cell: ({ getValue }) => (
            <Badge variant="outline">{getValue()}</Badge>
          ),
        }),
        columnHelper.accessor('batch', {
          id: 'batch',
          header: 'Lote',
          cell: ({ getValue }) => (
            <Badge variant="secondary">{getValue()}</Badge>
          ),
          enableGrouping: false,
        }),
        columnHelper.accessor('groupCategory', {
          id: 'groupCategory',
          header: 'Categoria',
          cell: ({ getValue }) => (
            <Badge variant="outline">{getValue()}</Badge>
          ),
        }),
        // Add evaluation status summary
        columnHelper.display({
          id: 'evaluationStatus',
          header: 'Status Geral',
          cell: ({ row }) => {
            const sample = row.original as TastingSessionSample;
            const compliant = sample.evaluationResults.filter(r => r.status === 'compliant').length;
            const total = sample.evaluationResults.length;
            const percentage = total > 0 ? (compliant / total) * 100 : 0;

            return (
              <div className="text-center">
                <div className="text-sm font-medium">
                  {compliant}/{total}
                </div>
                <Badge 
                  variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {percentage.toFixed(0)}%
                </Badge>
              </div>
            );
          },
          enableGrouping: false,
          enableSorting: true,
        }),
      ];
    }
  }, [isTransposed, specifications, visibleColumns, columnOrder]);

  const table = useReactTable({
    data,
    columns,
    state: {
      grouping,
      sorting,
      expanded,
    },
    onGroupingChange: setGrouping,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableGrouping: true,
    groupedColumnMode: false,
  });

  const getSortIcon = (isSorted: false | 'asc' | 'desc') => {
    if (isSorted === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (isSorted === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
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
                        className="font-semibold text-beer-dark text-center relative"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex items-center justify-center gap-2 p-2",
                              header.column.getCanSort() && "cursor-pointer select-none hover:bg-beer-light/20 rounded"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="ml-1">
                                {getSortIcon(header.column.getIsSorted())}
                              </span>
                            )}
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
                        <span className="text-sm text-muted-foreground">
                          Nenhum resultado encontrado.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}