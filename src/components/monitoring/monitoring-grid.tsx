import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Calendar,
  Package,
  Beaker
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SampleMonitoring } from '@/types/monitoring';
import { cn } from '@/lib/utils';

interface MonitoringGridProps {
  data: SampleMonitoring[];
  onViewDetails: (sample: SampleMonitoring) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'compliant':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'non-compliant':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'critical':
      return <AlertTriangle className="h-5 w-5 text-red-700" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
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
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="text-xs">
      {labels[status as keyof typeof labels] || status}
    </Badge>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'border-red-600 bg-red-50';
    case 'high':
      return 'border-orange-500 bg-orange-50';
    case 'medium':
      return 'border-blue-500 bg-blue-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export function MonitoringGrid({ data, onViewDetails }: MonitoringGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((sample) => (
        <Card 
          key={sample.id} 
          className={cn(
            "border-2 transition-all duration-200 hover:shadow-lg cursor-pointer",
            getPriorityColor(sample.priority),
            sample.complianceStatus.overall === 'critical' && "ring-2 ring-red-500 ring-opacity-50"
          )}
          onClick={() => onViewDetails(sample)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(sample.complianceStatus.overall)}
                <CardTitle className="text-lg font-mono">{sample.sampleCode}</CardTitle>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className={cn("text-2xl font-bold", getScoreColor(sample.complianceStatus.score))}>
                      {sample.complianceStatus.score}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Score de conformidade: {sample.complianceStatus.score}/100</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Product Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-beer-medium" />
                <span className="font-medium text-beer-dark text-sm">{sample.productName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Beaker className="h-4 w-4 text-beer-medium" />
                <Badge variant="outline" className="font-mono text-xs">
                  {sample.batch}
                </Badge>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Prod: {format(new Date(sample.productionDate), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Val: {format(new Date(sample.expirationDate), 'dd/MM/yyyy')}</span>
              </div>
            </div>

            {/* Sensory Specifications Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-beer-dark">Especificações Sensoriais</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Cor</span>
                    {getStatusBadge(sample.sensorySpecs.color.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Aroma</span>
                    {getStatusBadge(sample.sensorySpecs.aroma.status)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Sabor</span>
                    {getStatusBadge(sample.sensorySpecs.flavor.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Textura</span>
                    {getStatusBadge(sample.sensorySpecs.texture.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Limits Alert */}
            {sample.complianceStatus.overall === 'critical' && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-800">
                    Limites críticos excedidos
                  </span>
                </div>
              </div>
            )}

            {/* Special Observations */}
            {sample.specialObservations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-800">
                    Observações Especiais
                  </span>
                </div>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {sample.specialObservations.slice(0, 2).map((obs, index) => (
                    <li key={index}>• {obs}</li>
                  ))}
                  {sample.specialObservations.length > 2 && (
                    <li>• +{sample.specialObservations.length - 2} mais...</li>
                  )}
                </ul>
              </div>
            )}

            {/* Status Summary */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-1">
                {getStatusBadge(sample.complianceStatus.sensory)}
                {getStatusBadge(sample.complianceStatus.safety)}
                {getStatusBadge(sample.complianceStatus.quality)}
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                onViewDetails(sample);
              }}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}