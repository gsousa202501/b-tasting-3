import { createFileRoute } from '@tanstack/react-router';
import { MonitoringDashboard } from '@/components/monitoring/monitoring-dashboard';

export const Route = createFileRoute('/_layout/monitoring')({
  component: MonitoringPage,
});

function MonitoringPage() {
  return <MonitoringDashboard />;
}