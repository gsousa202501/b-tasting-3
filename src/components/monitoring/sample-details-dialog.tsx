import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { FlaskConical, Calendar, Package, AlertTriangle, CheckCircle, XCircle, Clock, Thermometer, Droplets, Eye, DoorClosed as Nose, Coffee } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SampleMonitoring } from '@/types/monitoring';
import { cn } from '@/lib/utils';

interface SampleDetailsDialogProps {
  sample: SampleMonitoring | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const isValueInRange = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};

export function SampleDetailsDialog({ sample, open, onOpenChange }: SampleDetailsDialogProps) {
  if (!sample) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-beer-dark">
            <FlaskConical className="h-5 w-5" />
            Detalhes da Amostra - {sample.sampleCode}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-beer-dark">
                <Package className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-beer-dark">Código da Amostra</p>
                  <p className="text-lg font-mono">{sample.sampleCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-beer-dark">Nome do Produto</p>
                  <p className="text-lg">{sample.productName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-beer-dark">Lote</p>
                  <Badge variant="outline" className="font-mono">{sample.batch}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-beer-dark">Prioridade</p>
                  <Badge variant={sample.priority === 'critical' ? 'destructive' : 'default'}>
                    {sample.priority === 'critical' ? 'Crítica' : 
                     sample.priority === 'high' ? 'Alta' :
                     sample.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-beer-medium" />
                  <div>
                    <p className="text-sm font-medium text-beer-dark">Data de Fabricação</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sample.productionDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-beer-medium" />
                  <div>
                    <p className="text-sm font-medium text-beer-dark">Data de Validade</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sample.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-beer-dark">
                <span className="flex items-center gap-2">
                  {getStatusIcon(sample.complianceStatus.overall)}
                  Status de Conformidade
                </span>
                <span className={cn("text-3xl font-bold", getScoreColor(sample.complianceStatus.score))}>
                  {sample.complianceStatus.score}/100
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getStatusIcon(sample.complianceStatus.overall)}
                    <span className="font-medium">Geral</span>
                  </div>
                  {getStatusBadge(sample.complianceStatus.overall)}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Nose className="h-4 w-4 text-beer-medium" />
                    <span className="font-medium">Sensorial</span>
                  </div>
                  {getStatusBadge(sample.complianceStatus.sensory)}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-beer-medium" />
                    <span className="font-medium">Segurança</span>
                  </div>
                  {getStatusBadge(sample.complianceStatus.safety)}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-beer-medium" />
                    <span className="font-medium">Qualidade</span>
                  </div>
                  {getStatusBadge(sample.complianceStatus.quality)}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Score de Conformidade</span>
                  <span className={cn("text-sm font-bold", getScoreColor(sample.complianceStatus.score))}>
                    {sample.complianceStatus.score}%
                  </span>
                </div>
                <Progress 
                  value={sample.complianceStatus.score} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sensory Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-beer-dark">
                <Nose className="h-5 w-5" />
                Especificações Sensoriais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-beer-medium" />
                    <h4 className="font-medium">Cor</h4>
                  </div>
                  {getStatusBadge(sample.sensorySpecs.color.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Esperado</p>
                    <p className="text-muted-foreground">{sample.sensorySpecs.color.expected}</p>
                  </div>
                  <div>
                    <p className="font-medium">Faixa ({sample.sensorySpecs.color.unit})</p>
                    <p className="text-muted-foreground">
                      {sample.sensorySpecs.color.range.min} - {sample.sensorySpecs.color.range.max}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Atual</p>
                    <p className={cn(
                      "font-bold",
                      sample.sensorySpecs.color.current && 
                      isValueInRange(sample.sensorySpecs.color.current, sample.sensorySpecs.color.range.min, sample.sensorySpecs.color.range.max)
                        ? "text-green-600" : "text-red-600"
                    )}>
                      {sample.sensorySpecs.color.current?.toFixed(1)} {sample.sensorySpecs.color.unit}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Aroma */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Nose className="h-4 w-4 text-beer-medium" />
                    <h4 className="font-medium">Aroma</h4>
                  </div>
                  {getStatusBadge(sample.sensorySpecs.aroma.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-sm mb-2">Intensidade</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Faixa: {sample.sensorySpecs.aroma.intensity.min} - {sample.sensorySpecs.aroma.intensity.max}</span>
                        <span className={cn(
                          "font-bold",
                          sample.sensorySpecs.aroma.current && 
                          isValueInRange(sample.sensorySpecs.aroma.current.intensity, sample.sensorySpecs.aroma.intensity.min, sample.sensorySpecs.aroma.intensity.max)
                            ? "text-green-600" : "text-red-600"
                        )}>
                          Atual: {sample.sensorySpecs.aroma.current?.intensity.toFixed(1)}
                        </span>
                      </div>
                      <Progress 
                        value={(sample.sensorySpecs.aroma.current?.intensity || 0) * 10} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-2">Qualidade</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Faixa: {sample.sensorySpecs.aroma.quality.min} - {sample.sensorySpecs.aroma.quality.max}</span>
                        <span className={cn(
                          "font-bold",
                          sample.sensorySpecs.aroma.current && 
                          isValueInRange(sample.sensorySpecs.aroma.current.quality, sample.sensorySpecs.aroma.quality.min, sample.sensorySpecs.aroma.quality.max)
                            ? "text-green-600" : "text-red-600"
                        )}>
                          Atual: {sample.sensorySpecs.aroma.current?.quality.toFixed(1)}
                        </span>
                      </div>
                      <Progress 
                        value={(sample.sensorySpecs.aroma.current?.quality || 0) * 10} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm">Notas Esperadas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sample.sensorySpecs.aroma.notes.map((note, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Flavor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-beer-medium" />
                    <h4 className="font-medium">Sabor</h4>
                  </div>
                  {getStatusBadge(sample.sensorySpecs.flavor.status)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(sample.sensorySpecs.flavor).filter(([key]) => 
                    ['sweetness', 'bitterness', 'acidity', 'body'].includes(key)
                  ).map(([key, range]) => {
                    const current = sample.sensorySpecs.flavor.current?.[key as keyof typeof sample.sensorySpecs.flavor.current];
                    const isInRange = current !== undefined && isValueInRange(current, (range as any).min, (range as any).max);
                    
                    return (
                      <div key={key}>
                        <p className="font-medium text-sm capitalize mb-1">
                          {key === 'sweetness' ? 'Doçura' :
                           key === 'bitterness' ? 'Amargor' :
                           key === 'acidity' ? 'Acidez' : 'Corpo'}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{(range as any).min} - {(range as any).max}</span>
                            <span className={cn("font-bold", isInRange ? "text-green-600" : "text-red-600")}>
                              {current?.toFixed(1)}
                            </span>
                          </div>
                          <Progress 
                            value={(current || 0) * 10} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Texture */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-beer-medium" />
                    <h4 className="font-medium">Textura</h4>
                  </div>
                  {getStatusBadge(sample.sensorySpecs.texture.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Carbonatação</p>
                    <p className="text-muted-foreground">
                      Faixa: {sample.sensorySpecs.texture.carbonation.min} - {sample.sensorySpecs.texture.carbonation.max}
                    </p>
                    <p className={cn(
                      "font-bold",
                      sample.sensorySpecs.texture.current && 
                      isValueInRange(sample.sensorySpecs.texture.current.carbonation, sample.sensorySpecs.texture.carbonation.min, sample.sensorySpecs.texture.carbonation.max)
                        ? "text-green-600" : "text-red-600"
                    )}>
                      Atual: {sample.sensorySpecs.texture.current?.carbonation.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Sensação na Boca</p>
                    <p className="text-muted-foreground">
                      Esperado: {sample.sensorySpecs.texture.mouthfeel.join(', ')}
                    </p>
                    <p className="font-bold">
                      Atual: {sample.sensorySpecs.texture.current?.mouthfeel}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Espuma</p>
                    <p className="text-muted-foreground">
                      Retenção: {sample.sensorySpecs.texture.foam.retention}s
                    </p>
                    <p className="text-muted-foreground">
                      Qualidade: {sample.sensorySpecs.texture.foam.quality}/10
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-beer-dark">
                <AlertTriangle className="h-5 w-5" />
                Limites Críticos de Controle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Microbiological */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Microbiológico
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Contagem Total:</span>
                      <span className="font-mono">
                        ≤ {sample.criticalLimits.microbiological.totalCount.max} {sample.criticalLimits.microbiological.totalCount.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leveduras/Bolores:</span>
                      <span className="font-mono">
                        ≤ {sample.criticalLimits.microbiological.yeastMold.max} {sample.criticalLimits.microbiological.yeastMold.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bactérias:</span>
                      <span className="font-mono">
                        ≤ {sample.criticalLimits.microbiological.bacteria.max} {sample.criticalLimits.microbiological.bacteria.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chemical */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Químico
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>pH:</span>
                      <span className="font-mono">
                        {sample.criticalLimits.chemical.ph.min} - {sample.criticalLimits.chemical.ph.max}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Álcool:</span>
                      <span className="font-mono">
                        {sample.criticalLimits.chemical.alcohol.min} - {sample.criticalLimits.chemical.alcohol.max}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>SO₂:</span>
                      <span className="font-mono">
                        ≤ {sample.criticalLimits.chemical.so2.max} {sample.criticalLimits.chemical.so2.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Physical */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Físico
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Turbidez:</span>
                      <span className="font-mono">
                        ≤ {sample.criticalLimits.physical.turbidity.max} {sample.criticalLimits.physical.turbidity.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperatura:</span>
                      <span className="font-mono">
                        {sample.criticalLimits.physical.temperature.min} - {sample.criticalLimits.physical.temperature.max} {sample.criticalLimits.physical.temperature.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Observations */}
          {sample.specialObservations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-beer-dark">
                  <AlertTriangle className="h-5 w-5" />
                  Observações Especiais para Degustação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sample.specialObservations.map((observation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-beer-medium mt-1">•</span>
                      <span className="text-sm">{observation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Evaluation History */}
          {sample.lastEvaluation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-beer-dark">
                  <Clock className="h-5 w-5" />
                  Histórico de Avaliação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Última Avaliação</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sample.lastEvaluation), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  {sample.evaluatedBy && (
                    <div className="text-right">
                      <p className="font-medium">Avaliado por</p>
                      <p className="text-sm text-muted-foreground">{sample.evaluatedBy}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}