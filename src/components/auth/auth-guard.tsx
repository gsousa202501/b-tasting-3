import React, { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';
import { Beer } from 'lucide-react';
import { LottieLoader } from '@/components/ui/lottie-loader';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredPermissions = [],
  fallback 
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Store the current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('b-tasting-redirect-after-login', currentPath);
      
      // Redirect to login
      router.navigate({ to: '/login' });
    }
  }, [isLoading, requireAuth, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beer-light via-background to-beer-light/50">
        <div className="text-center space-y-4">
          <LottieLoader size="lg" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-beer-dark">Carregando...</p>
            <p className="text-sm text-muted-foreground">Verificando autenticação e restaurando sessão</p>
          </div>
        </div>
      </div>
    );
  }

  // If auth is not required, always show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If auth is required but user is not authenticated, don't render anything
  // (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beer-light via-background to-beer-light/50 p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg">
                <Beer className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-beer-dark">Acesso Negado</h2>
              <p className="text-sm text-muted-foreground">
                Você não tem permissão para acessar esta página.
              </p>
              <p className="text-xs text-muted-foreground">
                Entre em contato com o administrador se precisar de acesso.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}