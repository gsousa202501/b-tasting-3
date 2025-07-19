import { Beer, Users, FlaskConical, BarChart3, Settings, Home, Zap, Package, Target, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-provider';

const sidebarItems = [
  {
    title: 'Painel',
    icon: Home,
    href: '/',
  },
  {
    title: 'Sessões',
    icon: Beer,
    href: '/sessions',
  },
  {
    title: 'Produtos',
    icon: Package,
    href: '/products',
  },
  {
    title: 'Amostras',
    icon: FlaskConical,
    href: '/samples',
  },
  {
    title: 'Monitoramento',
    icon: Monitor,
    href: '/monitoring',
  },
  {
    title: 'Degustadores',
    icon: Users,
    href: '/tasters',
  },
  {
    title: 'Ordenação',
    icon: Zap,
    href: '/ordering',
  },
  {
    title: 'Regras de Ordenação',
    icon: Target,
    href: '/ordering-rules',
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    href: '/reports',
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/settings',
  },
];

export function AppSidebar() {
  const { isOpen, isCollapsed, setIsOpen, toggleCollapse } = useSidebar();
  const location = useLocation();

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Don't render sidebar if not open on mobile
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          data-testid="sidebar-backdrop"
        />
      )}
      
      {/* Sidebar */}
      <aside
        data-sidebar
        className={cn(
          'fixed left-0 top-0 z-50 h-full transform border-r border-beer-medium/20 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out',
          'md:relative md:z-auto md:bg-white/90',
          // Mobile behavior
          isMobile && (isOpen ? 'translate-x-0' : '-translate-x-full'),
          // Desktop behavior
          !isMobile && 'translate-x-0',
          // Width based on collapsed state
          isCollapsed && !isMobile ? 'w-16' : 'w-64'
        )}
        style={{
          boxShadow: (isOpen || !isMobile) ? '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'
        }}
      >
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-beer-medium/20 transition-all duration-300",
          isCollapsed && !isMobile ? "px-3 justify-center" : "px-6"
        )}>
          <div className={cn(
            "flex items-center gap-2 transition-all duration-300",
            isCollapsed && !isMobile && "justify-center"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium">
              <Beer className="h-5 w-5 text-white" />
            </div>
            {(!isCollapsed || isMobile) && (
              <span className="text-xl font-bold text-beer-dark">B-Tasting</span>
            )}
          </div>
          
          {/* Collapse Toggle Button - Only on desktop */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className={cn(
                "ml-auto h-8 w-8 text-beer-dark hover:bg-beer-light/50 transition-all duration-300",
                isCollapsed && "ml-0"
              )}
              aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-1 transition-all duration-300",
          isCollapsed && !isMobile ? "p-2" : "p-4"
        )}>
          <TooltipProvider>
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              
              const linkContent = (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                    isCollapsed && !isMobile ? 'justify-center p-3' : 'gap-3 px-3 py-3',
                    isActive
                      ? 'bg-beer-medium text-white shadow-md'
                      : 'text-beer-dark hover:bg-beer-light/50 hover:text-beer-dark hover:shadow-sm'
                  )}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (isMobile) {
                      setIsOpen(false);
                    }
                  }}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <span className="transition-opacity duration-300">{item.title}</span>
                  )}
                </Link>
              );

              // Wrap with tooltip when collapsed on desktop
              if (isCollapsed && !isMobile) {
                return (
                  <Tooltip key={item.href} delayDuration={300}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </TooltipProvider>
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-beer-medium/20 transition-all duration-300",
          isCollapsed && !isMobile ? "p-2" : "p-4"
        )}>
          <div className={cn(
            "rounded-lg bg-beer-light/30 transition-all duration-300",
            isCollapsed && !isMobile ? "p-2 text-center" : "p-3"
          )}>
            {(!isCollapsed || isMobile) ? (
              <>
                <p className="text-xs text-beer-dark/70">
                  Sistema de Gestão de Degustação
                </p>
                <p className="text-xs font-medium text-beer-dark">
                  v1.0.0
                </p>
              </>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center">
                      <Beer className="h-4 w-4 text-beer-dark/70" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>B-Tasting v1.0.0</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}