import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Beer, FlaskConical, Users, Package, Zap } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { CreateSessionDialog } from '@/features/sessions/components/create-session-dialog';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      icon: Beer,
      label: 'Nova Sessão',
      description: 'Criar sessão de degustação',
      action: 'session',
      color: 'text-beer-medium',
    },
    {
      icon: FlaskConical,
      label: 'Nova Amostra',
      description: 'Registrar nova amostra',
      action: 'sample',
      color: 'text-blue-600',
    },
    {
      icon: Package,
      label: 'Novo Produto',
      description: 'Cadastrar produto',
      action: 'product',
      color: 'text-green-600',
    },
    {
      icon: Users,
      label: 'Novo Degustador',
      description: 'Adicionar degustador',
      action: 'taster',
      color: 'text-purple-600',
    },
    {
      icon: Zap,
      label: 'Nova Regra',
      description: 'Criar regra de ordenação',
      action: 'rule',
      color: 'text-orange-600',
    },
  ];

  const handleActionClick = (action: string) => {
    setIsOpen(false);
    // Handle different actions
    switch (action) {
      case 'session':
        // This will be handled by the CreateSessionDialog
        break;
      case 'sample':
        // Navigate to samples page or open modal
        break;
      case 'product':
        // Navigate to products page or open modal
        break;
      case 'taster':
        // Navigate to tasters page or open modal
        break;
      case 'rule':
        // Navigate to ordering rules page or open modal
        break;
    }
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <TooltipProvider>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className={cn(
                    "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
                    "bg-beer-medium hover:bg-beer-dark text-white",
                    "border-2 border-white/20 backdrop-blur-sm",
                    "transform hover:scale-105 active:scale-95",
                    isOpen && "rotate-45"
                  )}
                  aria-label="Ações rápidas"
                >
                  <Plus className={cn("h-6 w-6 transition-transform duration-300", isOpen && "rotate-45")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="mr-2">
                <p>Ações Rápidas</p>
              </TooltipContent>
            </Tooltip>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align="end" 
            side="top" 
            className="w-64 mb-2 border-beer-medium/20 bg-white/95 backdrop-blur-sm shadow-xl"
          >
            <div className="p-2">
              <h3 className="text-sm font-semibold text-beer-dark mb-2">Ações Rápidas</h3>
              {quickActions.map((action, index) => (
                <div key={action.action}>
                  {action.action === 'session' ? (
                    <CreateSessionDialog>
                      <DropdownMenuItem 
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-beer-light/30 rounded-lg transition-colors"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className={cn("p-2 rounded-full bg-gray-100", action.color)}>
                          <action.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-beer-dark">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </DropdownMenuItem>
                    </CreateSessionDialog>
                  ) : (
                    <DropdownMenuItem 
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-beer-light/30 rounded-lg transition-colors"
                      onClick={() => handleActionClick(action.action)}
                    >
                      <div className={cn("p-2 rounded-full bg-gray-100", action.color)}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-beer-dark">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {index < quickActions.length - 1 && <DropdownMenuSeparator className="my-1" />}
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  );
}