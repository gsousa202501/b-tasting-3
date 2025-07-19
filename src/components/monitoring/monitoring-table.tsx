import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Edit,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SampleMonitoring } from '@/types/monitoring';
import { cn } from '@/lib/utils';

interface MonitoringTableProps {
  data: SampleMonitoring[];
  onViewDetails: (sample: SampleMonitoring) => void;
  onEditSample: (sample: SampleMonitoring) => void;
  onGenerateReport: (sample: SampleMonitoring) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'compliant':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'non-compliant':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-red-700" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants = {
    compliant: 'default',
    'non-compliant': 'destructive',
    pending: 'secondary',
    critical: 'destructive'
  } as const;

  const labels = {
    compliant: 'Conforme',
    'non-compliant': 'Não Conforme',
    pending: 'Pendente',
    critical: 'Crítico'
  };

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>
  );
};

const getPriorityBadge = (priority: string) => {
  const variants = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
    critical: 'destructive'
  } as const;

  const labels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica'
  };

  return (
    <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>
      {labels[priority as keyof typeof labels] || priority}
    </Badge>
  );
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export function MonitoringTable({ 
  data, 
  onViewDetails, 
  onEditSample, 
  onGenerateReport 
}: MonitoringTableProps) {
  return (
    <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="rounded-md border border-beer-medium/20 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-beer-light/30">
                  <TableHead className="font-semibold text-beer-dark">Código</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Produto</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Lote</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Produção</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Validade</TableHead>
                  <TableHead className="font-semibold text-beer-dark text-center">Sensorial</TableHead>
                  <TableHead className="font-semibold text-beer-dark text-center">Segurança</TableHead>
                  <TableHead className="font-semibold text-beer-dark text-center">Qualidade</TableHead>
                  <TableHead className="font-semibold text-beer-dark text-center">Score</TableHead>
                  <TableHead className="font-semibold text-beer-dark text-center">Prioridade</TableHead>
                  <TableHead className="font-semibold text-beer-dark text-center">Status Geral</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Observações</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((sample) => (
                  <TableRow 
                    key={sample.id} 
                    className={cn(
                      "hover:bg-beer-light/20 transition-colors",
                      sample.complianceStatus.overall === 'critical' && "bg-red-50 border-l-4 border-l-red-500",
                      sample.priority === 'critical' && "bg-red-50"
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(sample.complianceStatus.overall)}
                        <span className="font-mono text-sm">{sample.sampleCode}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium text-beer-dark">{sample.productName}</p>
                        {sample.lastEvaluation && (
                          <p className="text-xs text-muted-foreground">
                            Avaliado em {format(new Date(sample.lastEvaluation), 'dd/MM HH:mm')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {sample.batch}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(sample.productionDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(sample.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {getStatusBadge(sample.complianceStatus.sensory)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {getStatusBadge(sample.complianceStatus.safety)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {getStatusBadge(sample.complianceStatus.quality)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className={cn("font-bold text-lg", getScoreColor(sample.complianceStatus.score))}>
                              {sample.complianceStatus.score}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Score de conformidade geral</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {getPriorityBadge(sample.priority)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {getStatusBadge(sample.complianceStatus.overall)}
                    </TableCell>
                    
                    <TableCell>
                      {sample.specialObservations.length > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-xs">
                                {sample.specialObservations.length} obs.
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <ul className="text-xs space-y-1">
                                {sample.specialObservations.map((obs, index) => (
                                  <li key={index}>• {obs}</li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails(sample)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditSample(sample)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onGenerateReport(sample)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Gerar Relatório
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}