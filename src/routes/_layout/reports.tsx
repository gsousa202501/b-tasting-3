import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockSessions } from '@/lib/mock-data';

export const Route = createFileRoute('/_layout/reports')({
  component: Reports,
});

function Reports() {
  // Calculate some basic statistics
  const totalSessions = mockSessions.length;
  const completedSessions = mockSessions.filter(s => s.status === 'completed').length;
  const activeSessions = mockSessions.filter(s => s.status === 'active').length;
  const totalSamples = mockSessions.reduce((acc, session) => acc + session.amostras.length, 0);
  const totalTasters = new Set(mockSessions.flatMap(s => s.degustadores.map(t => t.id))).size;

  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
            Relatórios
          </h1>
          <p className="text-muted-foreground">
            Análise e métricas das sessões de degustação
          </p>
        </div>

        <Button className="bg-beer-medium hover:bg-beer-dark">
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Sessões
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Todas as sessões criadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedSessions} de {totalSessions} concluídas
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Amostras Analisadas
            </CardTitle>
            <FlaskConical className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{totalSamples}</div>
            <p className="text-xs text-muted-foreground">
              Em todas as sessões
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
              Participaram de sessões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Status Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <BarChart3 className="h-5 w-5" />
              Status das Sessões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Concluídas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{completedSessions}</span>
                <Badge variant="outline">{completionRate}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-beer-medium" />
                <span className="text-sm">Ativas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{activeSessions}</span>
                <Badge variant="default">{activeSessions > 0 ? ((activeSessions / totalSessions) * 100).toFixed(1) : '0'}%</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Rascunhos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{totalSessions - completedSessions - activeSessions}</span>
                <Badge variant="secondary">{totalSessions > 0 ? (((totalSessions - completedSessions - activeSessions) / totalSessions) * 100).toFixed(1) : '0'}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <TrendingUp className="h-5 w-5" />
              Métricas de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
              <p className="text-sm text-muted-foreground">Taxa de Conformidade Geral</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-xl font-semibold text-beer-dark">87</div>
                <p className="text-xs text-muted-foreground">Amostras Conformes</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-red-600">5</div>
                <p className="text-xs text-muted-foreground">Não Conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions Table */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-beer-dark">
            Sessões Recentes
          </CardTitle>
          <CardDescription>
            Últimas sessões realizadas com seus resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-beer-medium/20">
            <Table>
              <TableHeader>
                <TableRow className="bg-beer-light/30">
                  <TableHead className="font-semibold text-beer-dark">Sessão</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Data</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Status</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Amostras</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Degustadores</TableHead>
                  <TableHead className="font-semibold text-beer-dark">Conformidade</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSessions.slice(0, 5).map((session) => (
                  <TableRow key={session.id} className="hover:bg-beer-light/20">
                    <TableCell className="font-medium text-beer-dark">
                      {session.nome}
                    </TableCell>
                    <TableCell>
                      {format(new Date(session.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        session.status === 'completed' ? 'outline' :
                        session.status === 'active' ? 'default' : 'secondary'
                      }>
                        {session.status === 'completed' ? 'Concluída' :
                         session.status === 'active' ? 'Ativa' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        {session.amostras.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {session.degustadores.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.status === 'completed' ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">96%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}