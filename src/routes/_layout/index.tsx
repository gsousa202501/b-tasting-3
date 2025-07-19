import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Beer, Users, FlaskConical, CheckCircle, MoreHorizontal, Eye, ArrowRight, TestTube, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from '@tanstack/react-router';
import { useSessions } from '@/features/sessions/hooks/use-sessions';
import { CreateSessionDialog } from '@/features/sessions/components/create-session-dialog';
import { SessionDetailsDialog } from '@/features/sessions/components/session-details-dialog';
import { TastingSession } from '@/types';
import { useState } from 'react';
import { LottieLoader } from '@/components/ui/lottie-loader';

export const Route = createFileRoute('/_layout/')({
  component: Dashboard,
});

const statusConfig = {
  nao_iniciado: { label: 'Não Iniciado', variant: 'outline' as const },
  draft: { label: 'Rascunho', variant: 'secondary' as const },
  active: { label: 'Ativa', variant: 'default' as const },
  completed: { label: 'Concluída', variant: 'outline' as const },
};

const typeConfig = {
  routine: { label: 'Rotina', variant: 'default' as const },
  extra: { label: 'Extra', variant: 'secondary' as const },
};

function Dashboard() {
  const { data: allSessions, isLoading } = useSessions();
  const [viewSession, setViewSession] = useState<TastingSession | null>(null);

  // Filtrar apenas sessões ativas ou em andamento
  const activeSessions = allSessions?.filter(session => 
    session.status === 'active' || session.status === 'nao_iniciado'
  ) || [];

  // Calcular estatísticas
  const totalActiveSessions = activeSessions.length;
  const totalSamples = activeSessions.reduce((acc, session) => acc + session.amostras.length, 0);
  const totalTasters = new Set(activeSessions.flatMap(s => s.degustadores.map(t => t.id))).size;
  const urgentSessions = activeSessions.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
          Painel de Controle
        </h1>
        <p className="text-muted-foreground">
          Sessões ativas e em andamento - Controle de qualidade em tempo real
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessões Ativas
            </CardTitle>
            <Beer className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{totalActiveSessions}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento ou aguardando
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessões Urgentes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentSessions}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Amostras Pendentes
            </CardTitle>
            <FlaskConical className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{totalSamples}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando avaliação
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Degustadores Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{totalTasters}</div>
            <p className="text-xs text-muted-foreground">
              Envolvidos nas sessões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions Table */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-beer-dark">
                Sessões Ativas e Em Andamento
              </CardTitle>
              <CardDescription>
                Sessões que requerem atenção imediata ou estão aguardando início
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/sessions">
                <Button variant="outline" size="sm">
                  Ver Todas as Sessões
                </Button>
              </Link>
              <CreateSessionDialog>
                <Button className="bg-beer-medium hover:bg-beer-dark">
                  Nova Sessão
                </Button>
              </CreateSessionDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <LottieLoader size="lg" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-beer-dark">Carregando sessões...</p>
                  <p className="text-sm text-muted-foreground">Buscando sessões ativas</p>
                </div>
              </div>
            </div>
          ) : activeSessions.length > 0 ? (
            <div className="rounded-lg border border-beer-medium/20 bg-white/50 backdrop-blur-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-beer-light/30 hover:bg-beer-light/40">
                    <TableHead className="font-semibold text-beer-dark">Nome da Sessão</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Data/Hora</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Tipo</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Status</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Amostras</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Degustadores</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-beer-light/20 transition-colors">
                      <TableCell className="font-medium text-beer-dark">
                        {session.nome}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-beer-dark">
                            {format(new Date(session.data), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="text-muted-foreground">
                            {session.horario}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeConfig[session.type].variant}>
                          {typeConfig[session.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[session.status].variant}>
                          {statusConfig[session.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FlaskConical className="h-4 w-4" />
                          <span>{session.amostras.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{session.degustadores.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewSession(session)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/session/$sessionId/evaluation" params={{ sessionId: session.id }}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Ir para Avaliação
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/session/$sessionId/tasting" params={{ sessionId: session.id }}>
                                <TestTube className="mr-2 h-4 w-4" />
                                Interface de Degustação
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
                <h3 className="mt-4 text-lg font-semibold text-beer-dark">
                  Nenhuma sessão ativa
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Todas as sessões estão concluídas ou em rascunho.
                </p>
                <CreateSessionDialog>
                  <Button className="mt-4 bg-beer-medium hover:bg-beer-dark">
                    Criar Nova Sessão
                  </Button>
                </CreateSessionDialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Session Dialog */}
      {viewSession && (
        <SessionDetailsDialog
          session={viewSession}
          open={!!viewSession}
          onOpenChange={(open) => !open && setViewSession(null)}
        />
      )}
    </div>
  );
}