import { StrictMode, useEffect } from 'react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

import { routeTree } from './routeTree.gen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createRouter({ 
  routeTree,
  context: {
    auth: undefined!, // This will be set by the AuthProvider
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppWithAuth() {
  const auth = useAuth();

  useEffect(() => {
    // Update router context with auth state
    router.update({
      context: {
        auth,
      },
    });
  }, [auth]);

  // Handle post-login redirect
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      const redirectPath = sessionStorage.getItem('b-tasting-redirect-after-login');
      if (redirectPath && redirectPath !== '/login') {
        sessionStorage.removeItem('b-tasting-redirect-after-login');
        router.navigate({ to: redirectPath });
      }
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  // Handle post-login redirect
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      const redirectPath = sessionStorage.getItem('b-tasting-redirect-after-login');
      if (redirectPath && redirectPath !== '/login') {
        sessionStorage.removeItem('b-tasting-redirect-after-login');
        router.navigate({ to: redirectPath });
      }
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="b-tasting-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-beer-light via-background to-beer-light/50">
              <AppWithAuth />
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
            </div>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}

export default App;