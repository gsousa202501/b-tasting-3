import { Menu, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-provider';
import { CreateSessionDialog } from '@/features/sessions/components/create-session-dialog';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';

export function TopBar() {
  const { toggle, isOpen, isCollapsed } = useSidebar();
  
  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <header className={cn(
      "flex h-16 items-center justify-between border-b border-beer-medium/20 bg-white/50 backdrop-blur-sm px-4 md:px-6 transition-all duration-300",
      // Add left margin when sidebar is collapsed on desktop
      !isMobile && isCollapsed && "md:ml-0"
    )}>
      <div className="flex items-center gap-4">
        {/* Show hamburger menu on mobile OR toggle button on desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="text-beer-dark hover:bg-beer-light/50"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobile ? (
            isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <CreateSessionDialog>
          <Button className="bg-beer-medium hover:bg-beer-dark text-white shadow-md hover:shadow-lg transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nova Sessão</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </CreateSessionDialog>
        <UserMenu />
      </div>
    </header>
  );
}