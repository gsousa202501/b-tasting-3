import { createFileRoute } from '@tanstack/react-router';
import { SessionsTable } from '@/features/sessions/components/sessions-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beer, Users, FlaskConical, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/_layout/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
          Painel de Controle
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas sessões de degustação e controle de qualidade
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
            <div className="text-2xl font-bold text-beer-dark">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Degustadores
            </CardTitle>
            <Users className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">8</div>
            <p className="text-xs text-muted-foreground">
              4 ativos hoje
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
            <div className="text-2xl font-bold text-beer-dark">142</div>
            <p className="text-xs text-muted-foreground">
              +18 esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conformidade
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-beer-dark">
            Sessões de Degustação
          </CardTitle>
          <CardDescription>
            Gerencie e monitore todas as suas sessões de degustação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsTable />
        </CardContent>
      </Card>
    </div>
  );
}