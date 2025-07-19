import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { SidebarProvider } from '@/components/sidebar-provider';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { AuthGuard } from '@/components/auth/auth-guard';

export const Route = createFileRoute('/_layout')({
  beforeLoad: ({ context, location }) => {
    // Check if user is authenticated
    if (!context.auth?.isAuthenticated) {
      // Store the current path for redirect after login
      sessionStorage.setItem('b-tasting-redirect-after-login', location.pathname);
      
      throw redirect({
        to: '/login',
      });
    }
  },
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <AuthGuard requireAuth={true}>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gradient-to-br from-beer-light via-background to-beer-light/50 layout-transition">
          <AppSidebar />
          <div className="flex flex-1 flex-col layout-transition">
            <TopBar />
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <Outlet />
            </main>
          </div>
          <FloatingActionButton />
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}