import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TastingSession } from '@/types';
import { mockSessions } from '@/lib/mock-data';
import { toast } from 'sonner';

// Mock API functions - these would connect to real API endpoints
const sessionApi = {
  getSessions: async (): Promise<TastingSession[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...mockSessions];
  },

  createSession: async (session: Omit<TastingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TastingSession> => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newSession: TastingSession = {
      id: `session-${Date.now()}`,
      nome: session.name,
      data: session.date,
      horario: session.time,
      type: session.type,
      status: session.status,
      amostras: session.samples,
      degustadores: session.tasters,
      observacoes: session.observations,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    mockSessions.unshift(newSession); // Add to beginning of array
    return newSession;
  },

  updateSession: async (id: string, updates: Partial<TastingSession>): Promise<TastingSession> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = mockSessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Sessão não encontrada');
    
    mockSessions[index] = {
      ...mockSessions[index],
      ...updates,
      atualizadoEm: new Date().toISOString(),
    };
    return mockSessions[index];
  },

  deleteSession: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockSessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Sessão não encontrada');
    mockSessions.splice(index, 1);
  },

  completeSession: async (id: string): Promise<TastingSession> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockSessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Sessão não encontrada');
    
    mockSessions[index] = {
      ...mockSessions[index],
      status: 'completed',
      atualizadoEm: new Date().toISOString(),
    };
    return mockSessions[index];
  },
};

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionApi.getSessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sessionApi.createSession,
    onSuccess: (newSession) => {
      queryClient.setQueryData(['sessions'], (oldData: TastingSession[] | undefined) => {
        return oldData ? [newSession, ...oldData] : [newSession];
      });
      toast.success('Sessão criada com sucesso!', {
        description: `A sessão "${newSession.nome}" foi criada e está pronta para uso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast.error('Erro ao criar sessão', {
        description: 'Não foi possível criar a sessão. Tente novamente.',
      });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TastingSession> }) =>
      sessionApi.updateSession(id, updates),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(['sessions'], (oldData: TastingSession[] | undefined) => {
        return oldData ? oldData.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        ) : [updatedSession];
      });
      toast.success('Sessão atualizada com sucesso!', {
        description: `As alterações na sessão "${updatedSession.nome}" foram salvas.`,
      });
    },
    onError: (error) => {
      console.error('Error updating session:', error);
      toast.error('Erro ao atualizar sessão', {
        description: 'Não foi possível salvar as alterações. Tente novamente.',
      });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sessionApi.deleteSession,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['sessions'], (oldData: TastingSession[] | undefined) => {
        return oldData ? oldData.filter(session => session.id !== deletedId) : [];
      });
      toast.success('Sessão excluída com sucesso!', {
        description: 'A sessão foi removida permanentemente do sistema.',
      });
    },
    onError: (error) => {
      console.error('Error deleting session:', error);
      toast.error('Erro ao excluir sessão', {
        description: 'Não foi possível excluir a sessão. Tente novamente.',
      });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sessionApi.completeSession,
    onSuccess: (completedSession) => {
      queryClient.setQueryData(['sessions'], (oldData: TastingSession[] | undefined) => {
        return oldData ? oldData.map(session => 
          session.id === completedSession.id ? completedSession : session
        ) : [completedSession];
      });
      toast.success('Sessão concluída com sucesso!', {
        description: `A sessão "${completedSession.nome}" foi marcada como concluída.`,
      });
    },
    onError: (error) => {
      console.error('Error completing session:', error);
      toast.error('Erro ao concluir sessão', {
        description: 'Não foi possível concluir a sessão. Tente novamente.',
      });
    },
  });
}