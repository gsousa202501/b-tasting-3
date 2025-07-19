import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarDays, 
  Clock, 
  Settings, 
  FlaskConical, 
  Users, 
  FileText,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SessionFormData } from '@/types';

interface SummaryStepProps {
  formData: SessionFormData;
  isEditing: boolean;
}

const typeConfig = {
  routine: { label: 'Rotina', variant: 'default' as const },
  extra: { label: 'Extra', variant: 'secondary' as const },
};

export function SummaryStep({ formData, isEditing }: SummaryStepProps) {
  const { sessionData, orderedSamples, selectedTasters, observations } = formData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-beer-medium/30">
        <CardHeader className="bg-beer-light/20">
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <CheckCircle className="h-5 w-5" />
            {isEditing ? 'Confirmar Alterações' : 'Resumo da Sessão'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {isEditing 
              ? 'Revise as informações abaixo e confirme as alterações na sessão.'
              : 'Revise todas as informações abaixo antes de finalizar a criação da sessão.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Session Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Settings className="h-5 w-5" />
            Dados da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-beer-dark">Nome da Sessão</p>
            <p className="text-lg">{sessionData.name}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-beer-medium" />
              <div>
                <p className="text-sm font-medium text-beer-dark">Data</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(sessionData.date), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-beer-medium" />
              <div>
                <p className="text-sm font-medium text-beer-dark">Horário</p>
                <p className="text-sm text-muted-foreground">{sessionData.time}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-beer-dark">Tipo</p>
              <Badge variant={typeConfig[sessionData.type].variant}>
                {typeConfig[sessionData.type].label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Samples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <FlaskConical className="h-5 w-5" />
            Amostras Selecionadas ({orderedSamples.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orderedSamples.map((sample, index) => (
              <div key={sample.id} className="flex items-center gap-4 p-3 border rounded-lg bg-beer-light/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium text-white text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <p className="font-medium text-beer-dark">{sample.code}</p>
                    <p className="text-sm text-muted-foreground">{sample.description}</p>
                  </div>
                  <div>
                    <Badge variant="outline">{sample.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lote: {sample.batch}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Users className="h-5 w-5" />
            Degustadores Selecionados ({selectedTasters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {selectedTasters.map((taster) => (
              <div key={taster.id} className="flex items-center gap-3 p-3 border rounded-lg bg-beer-light/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-beer-medium text-white font-medium">
                  {taster.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-beer-dark">{taster.name}</p>
                  <p className="text-sm text-muted-foreground">{taster.department}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Observations */}
      {observations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <FileText className="h-5 w-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {observations}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Final Summary */}
      <Card className="border-beer-medium/30 bg-beer-light/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-beer-dark">{orderedSamples.length}</p>
              <p className="text-sm text-muted-foreground">Amostras</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-beer-dark">{selectedTasters.length}</p>
              <p className="text-sm text-muted-foreground">Degustadores</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-beer-dark">
                {orderedSamples.length * selectedTasters.length}
              </p>
              <p className="text-sm text-muted-foreground">Avaliações Esperadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}