import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TastingSession, SessionFormData } from '@/types';
import { sessionStorage } from '@/lib/session-storage';
import { useCreateSession, useUpdateSession } from '../hooks/use-sessions';
import { SessionDataStep } from './steps/session-data-step';
import { SearchSamplesStep } from './steps/search-samples-step';
import { OrderSamplesStep } from './steps/order-samples-step';
import { SelectTastersStep } from './steps/select-tasters-step';
import { SummaryStep } from './steps/summary-step';
import { EditSamplesStep } from './steps/edit-samples-step';
import { EditTastersStep } from './steps/edit-tasters-step';

interface CreateSessionDialogProps {
  children?: React.ReactNode;
  session?: TastingSession;
  open?: boolean;
  onClose?: () => void;
}

const TOTAL_STEPS = 5;

const stepTitles = [
  'Dados da Sessão',
  'Buscar Amostras',
  'Ordenar Amostras',
  'Selecionar Degustadores',
  'Resumo e Finalização',
];

export function CreateSessionDialog({ children, session, open: externalOpen, onClose }: CreateSessionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Use external open state when provided (for editing), otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOpen !== undefined ? (value: boolean) => {
    if (!value && onClose) onClose();
  } : setInternalOpen;
  
  const [formData, setFormData] = useState<SessionFormData>(() => {
    if (session) {
      // If editing, populate with session data
      return {
        step: 1,
        sessionData: {
          name: session.nome,
          date: session.data,
          time: session.horario,
          type: session.type,
        },
        selectedSamples: session.amostras,
        orderedSamples: session.amostras,
        selectedTasters: session.degustadores,
        observations: session.observacoes || '',
      };
    }
    // Otherwise load from session storage or use defaults
    const saved = sessionStorage.getSessionForm();
    return {
      step: saved.step || 1,
      sessionData: saved.sessionData || {
        name: '',
        date: '',
        time: '',
        type: 'routine',
      },
      selectedSamples: saved.selectedSamples || [],
      orderedSamples: saved.orderedSamples || [],
      selectedTasters: saved.selectedTasters || [],
      observations: saved.observations || '',
    };
  });

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();

  const isEditing = !!session;

  useEffect(() => {
    if (formData.step) {
      setCurrentStep(formData.step);
    }
  }, [formData.step]);

  useEffect(() => {
    if (open && !isEditing) {
      // Save form data to session storage when dialog is open (except when editing)
      sessionStorage.saveSessionForm({ ...formData, step: currentStep });
    }
  }, [formData, currentStep, open, isEditing]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      if (onClose) {
        onClose();
      }
      if (!isEditing) {
        // Clear session storage when closing (except when editing)
        sessionStorage.clearSessionForm();
      }
    }
  };

  const updateFormData = (updates: Partial<SessionFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (!isEditing) {
      sessionStorage.saveSessionForm(updates);
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateFormData({ step: nextStep });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateFormData({ step: prevStep });
    }
  };

  const handleSubmit = async () => {
    try {
      const sessionData = {
        name: formData.sessionData.name,
        date: formData.sessionData.date,
        time: formData.sessionData.time,
        type: formData.sessionData.type,
        status: 'draft' as const,
        samples: formData.orderedSamples,
        tasters: formData.selectedTasters,
        observations: formData.observations,
      };

      if (isEditing && session) {
        await updateSession.mutateAsync({
          id: session.id,
          updates: sessionData,
        });
      } else {
        await createSession.mutateAsync(sessionData);
      }

      handleOpenChange(false);
      if (!isEditing) {
        sessionStorage.clearSessionForm();
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const renderStep = () => {
    // Se estiver editando, usar componentes específicos para edição
    if (isEditing && session) {
      switch (currentStep) {
        case 1:
          return (
            <SessionDataStep
              data={formData.sessionData}
              onChange={(data) => updateFormData({ sessionData: data })}
            />
          );
        case 2:
          return (
            <EditSamplesStep
              session={session}
              selectedSamples={formData.selectedSamples}
              onChange={(samples) => updateFormData({ selectedSamples: samples, orderedSamples: samples })}
            />
          );
        case 3:
          return (
            <OrderSamplesStep
              samples={formData.selectedSamples}
              orderedSamples={formData.orderedSamples}
              onChange={(samples) => updateFormData({ orderedSamples: samples })}
            />
          );
        case 4:
          return (
            <EditTastersStep
              session={session}
              selectedTasters={formData.selectedTasters}
              observations={formData.observations}
              onChange={(tasters, observations) => updateFormData({ 
                selectedTasters: tasters, 
                observations 
              })}
            />
          );
        case 5:
          return (
            <SummaryStep
              formData={formData}
              isEditing={isEditing}
            />
          );
        default:
          return null;
      }
    }

    // Fluxo normal de criação
    switch (currentStep) {
      case 1:
        return (
          <SessionDataStep
            data={formData.sessionData}
            onChange={(data) => updateFormData({ sessionData: data })}
          />
        );
      case 2:
        return (
          <SearchSamplesStep
            selectedSamples={formData.selectedSamples}
            onChange={(samples) => updateFormData({ selectedSamples: samples })}
            sessionData={formData.sessionData}
          />
        );
      case 3:
        return (
          <OrderSamplesStep
            samples={formData.selectedSamples}
            orderedSamples={formData.orderedSamples}
            onChange={(samples) => updateFormData({ orderedSamples: samples })}
          />
        );
      case 4:
        return (
          <SelectTastersStep
            selectedTasters={formData.selectedTasters}
            observations={formData.observations}
            onChange={(tasters, observations) => updateFormData({ 
              selectedTasters: tasters, 
              observations 
            })}
          />
        );
      case 5:
        return (
          <SummaryStep
            formData={formData}
            isEditing={isEditing}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.sessionData.name && formData.sessionData.date && formData.sessionData.time;
      case 2:
        return formData.selectedSamples.length > 0;
      case 3:
        return formData.orderedSamples.length > 0;
      case 4:
        return formData.selectedTasters.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const isLoading = createSession.isPending || updateSession.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && (
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-beer-dark">
            {isEditing ? 'Editar Sessão' : 'Criar Nova Sessão'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Passo {currentStep} de {TOTAL_STEPS}</span>
            <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}% concluído</span>
          </div>
          <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
          <p className="text-sm font-medium text-beer-dark">
            {stepTitles[currentStep - 1]}
          </p>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-beer-medium hover:bg-beer-dark"
              >
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="bg-beer-medium hover:bg-beer-dark"
              >
                {isLoading 
                  ? (isEditing ? 'Salvando...' : 'Criando...') 
                  : (isEditing ? 'Salvar Sessão' : 'Finalizar Sessão')
                }
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}