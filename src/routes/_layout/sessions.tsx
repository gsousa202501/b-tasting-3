import { createFileRoute } from '@tanstack/react-router';
import { SessionsTable } from '@/features/sessions/components/sessions-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_layout/sessions')({
  component: Sessions,
});

function Sessions() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
          Sessões de Degustação
        </h1>
        <p className="text-muted-foreground">
          Gerencie todas as suas sessões de degustação e controle de qualidade
        </p>
      </div>

      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-beer-dark">
            Todas as Sessões
          </CardTitle>
          <CardDescription>
            Lista completa de sessões criadas, ativas e finalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsTable />
        </CardContent>
      </Card>
    </div>
  );
}