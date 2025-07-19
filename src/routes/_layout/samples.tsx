import { createFileRoute } from '@tanstack/react-router';
import { SamplesDataTable } from '@/components/samples-data-table';

export const Route = createFileRoute('/_layout/samples')({
  component: Samples,
});

function Samples() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
          Resultados de Ensaios
        </h1>
        <p className="text-muted-foreground">
          Visualize e analise os resultados dos ensaios realizados nas amostras
        </p>
      </div>

      <SamplesDataTable />
    </div>
  );
}