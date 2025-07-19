import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Users, FlaskConical, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TastingSession } from '@/types';

interface SessionDetailsDialogProps {
  session: TastingSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  draft: { label: 'Rascunho', variant: 'secondary' as const },
  active: { label: 'Ativa', variant: 'default' as const },
  completed: { label: 'Concluída', variant: 'outline' as const },
};

const typeConfig = {
  routine: { label: 'Rotina', variant: 'default' as const },
  extra: { label: 'Extra', variant: 'secondary' as const },
};

export function SessionDetailsDialog({ session, open, onOpenChange }: SessionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-beer-dark">
            Detalhes da Sessão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-beer-dark">{session.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-beer-medium" />
                  <div>
                    <p className="text-sm font-medium text-beer-dark">Data</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-beer-medium" />
                  <div>
                    <p className="text-sm font-medium text-beer-dark">Horário</p>
                    <p className="text-sm text-muted-foreground">{session.horario}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-beer-dark mb-1">Tipo</p>
                  <Badge variant={typeConfig[session.type].variant}>
                    {typeConfig[session.type].label}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-beer-dark mb-1">Status</p>
                  <Badge variant={statusConfig[session.status].variant}>
                    {statusConfig[session.status].label}
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
                Amostras ({session.amostras.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {session.amostras.map((sample, index) => (
                  <div key={sample.id} className="flex items-center justify-between border rounded-lg p-3 bg-beer-light/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-beer-dark">{sample.code}</p>
                        <p className="text-sm text-muted-foreground">{sample.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-beer-dark">{sample.type}</p>
                      <p className="text-xs text-muted-foreground">Lote: {sample.batch}</p>
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
                Degustadores ({session.degustadores.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {session.degustadores.map((taster) => (
                  <div key={taster.id} className="flex items-center gap-3 border rounded-lg p-3 bg-beer-light/20">
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
          {session.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-beer-dark">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {session.observacoes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
            <span>
              Criado em: {format(new Date(session.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
            <span>
              Atualizado em: {format(new Date(session.atualizadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}