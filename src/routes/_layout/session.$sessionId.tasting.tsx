import { createFileRoute } from '@tanstack/react-router';
import { AdvancedTastingInterface } from '@/components/tasting-interface/advanced-tasting-interface';

export const Route = createFileRoute('/_layout/session/$sessionId/tasting')({
  component: TastingInterfaceComponent,
});

function TastingInterfaceComponent() {
  const { sessionId } = Route.useParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-beer-light via-background to-beer-light/50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
            Interface de Degustação Avançada
          </h1>
          <p className="text-muted-foreground">
            Sessão: {sessionId} - Análise completa com filtros dinâmicos e agrupamentos customizáveis
          </p>
        </div>
        
        <AdvancedTastingInterface sessionId={sessionId} />
      </div>
    </div>
  );
}