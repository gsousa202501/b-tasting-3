import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Users, 
  FlaskConical,
  Beer,
  ArrowRight,
  TestTube
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from '@tanstack/react-router';
import { useSessions, useDeleteSession, useCompleteSession } from '../hooks/use-sessions';
import { TastingSession } from '@/types';
import { CreateSessionDialog } from './create-session-dialog';
import { SessionDetailsDialog } from './session-details-dialog';
import { toast } from 'sonner';
import { LottieLoader } from '@/components/ui/lottie-loader';

interface SessionsTableProps {
  filteredSessions?: TastingSession[];
}

const statusConfig = {
  nao_iniciado: { label: 'Não Iniciado', variant: 'outline' as const },
  draft: { label: 'Rascunho', variant: 'secondary' as const },
  active: { label: 'Ativa', variant: 'default' as const },
  completed: { label: 'Concluída', variant: 'outline' as const },
};

const typeConfig = {
  routine: { label: 'Rotina', variant: 'default' as const },
  extra: { label: 'Extra', variant: 'secondary' as const },
};

export function SessionsTable({ filteredSessions }: SessionsTableProps) {
  const { data: allSessions, isLoading, error } = useSessions();
  const sessions = filteredSessions || allSessions;
  const deleteSession = useDeleteSession();
  const completeSession = useCompleteSession();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [editSession, setEditSession] = useState<TastingSession | null>(null);
  const [viewSession, setViewSession] = useState<TastingSession | null>(null);

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (sessionToDelete) {
      try {
        await deleteSession.mutateAsync(sessionToDelete);
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
      } catch (error) {
        toast.error('Erro ao excluir sessão');
      }
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await completeSession.mutateAsync(sessionId);
    } catch (error) {
      toast.error('Erro ao concluir sessão');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <LottieLoader size="lg" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-beer-dark">Carregando sessões...</p>
            <p className="text-sm text-muted-foreground">Buscando dados das sessões de degustação</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Beer className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-beer-dark">
            Erro ao carregar sessões
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Não foi possível carregar as sessões. Tente novamente.
          </p>
        </div>
      </div>
    );
  }

  if (!sessions?.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Beer className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-beer-dark">
            {filteredSessions ? 'Nenhuma sessão encontrada com os filtros aplicados' : 'Nenhuma sessão encontrada'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredSessions ? 'Ajuste os filtros para ver mais resultados.' : 'Comece criando sua primeira sessão de degustação.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-beer-medium/20 bg-white/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-beer-light/30 hover:bg-beer-light/40">
              <TableHead className="font-semibold text-beer-dark">Nome da Sessão</TableHead>
              <TableHead className="font-semibold text-beer-dark">Data/Hora</TableHead>
              <TableHead className="font-semibold text-beer-dark">Tipo</TableHead>
              <TableHead className="font-semibold text-beer-dark">Status</TableHead>
              <TableHead className="font-semibold text-beer-dark">Amostras</TableHead>
              <TableHead className="font-semibold text-beer-dark">Degustadores</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id} className="hover:bg-beer-light/20 transition-colors">
                <TableCell className="font-medium text-beer-dark">
                  {session.nome}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium text-beer-dark">
                      {format(new Date(session.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="text-muted-foreground">
                      {session.horario}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={typeConfig[session.type].variant}>
                    {typeConfig[session.type].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[session.status].variant}>
                    {statusConfig[session.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FlaskConical className="h-4 w-4" />
                    <span>{session.amostras.length}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{session.degustadores.length}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewSession(session)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditSession(session)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {(session.status === 'active' || session.status === 'draft') && (
                        <DropdownMenuItem asChild>
                          <Link to="/session/$sessionId/evaluation" params={{ sessionId: session.id }}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Ir para Avaliação
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {(session.status === 'active' || session.status === 'draft') && (
                        <DropdownMenuItem asChild>
                          <Link to="/session/$sessionId/tasting" params={{ sessionId: session.id }}>
                            <TestTube className="mr-2 h-4 w-4" />
                            Interface de Degustação
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {session.status === 'active' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleCompleteSession(session.id)}
                            disabled={completeSession.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Concluir Sessão
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(session.id)}
                        className="text-destructive focus:text-destructive"
                        disabled={deleteSession.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Session Dialog */}
      {editSession && (
        <CreateSessionDialog
          session={editSession}
          open={!!editSession}
          onClose={() => setEditSession(null)}
        />
      )}

      {/* View Session Dialog */}
      {viewSession && (
        <SessionDetailsDialog
          session={viewSession}
          open={!!viewSession}
          onOpenChange={(open) => !open && setViewSession(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}