import { createFileRoute } from '@tanstack/react-router';
import { OrderingManagement } from '@/features/ordering/components/ordering-management';

export const Route = createFileRoute('/_layout/ordering')({
  component: OrderingPage,
});

function OrderingPage() {
  return <OrderingManagement />;
}