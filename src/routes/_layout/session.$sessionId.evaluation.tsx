import { createFileRoute } from '@tanstack/react-router';
import { SessionEvaluationPage } from '@/features/sessions/components/session-evaluation-page';

export const Route = createFileRoute('/_layout/session/$sessionId/evaluation')({
  component: SessionEvaluationComponent,
});

function SessionEvaluationComponent() {
  const { sessionId } = Route.useParams();
  return <SessionEvaluationPage sessionId={sessionId} />;
}