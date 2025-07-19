import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';
import { Sample } from '@/types';

interface OrderSamplesStepProps {
  samples: Sample[];
  orderedSamples: Sample[];
  onChange: (samples: Sample[]) => void;
}

interface SortableItemProps {
  sample: Sample;
  index: number;
}

function SortableItem({ sample, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sample.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 border rounded-lg bg-white transition-colors ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-beer-light/20'
      }`}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium text-white text-sm font-medium cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {index + 1}
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
        <div>
          <p className="font-medium text-beer-dark">{sample.code}</p>
          <p className="text-sm text-muted-foreground">{sample.description}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Tipo</p>
          <Badge variant="outline">{sample.type}</Badge>
        </div>
        <div>
          <p className="text-sm font-medium">Lote</p>
          <p className="text-sm text-muted-foreground">{sample.batch}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Produção</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(sample.productionDate), 'dd/MM/yyyy')}
          </p>
        </div>
      </div>

      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
    </div>
  );
}

export function OrderSamplesStep({ samples, orderedSamples, onChange }: OrderSamplesStepProps) {
  const [items, setItems] = useState<Sample[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Initialize ordered samples if not set
    if (orderedSamples.length === 0 && samples.length > 0) {
      setItems(samples);
      onChange(samples);
    } else {
      setItems(orderedSamples);
    }
  }, [samples, orderedSamples, onChange]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        onChange(newOrder);
        return newOrder;
      });
    }
  }

  if (samples.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FlaskConical className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-beer-dark">
              Nenhuma amostra selecionada
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Volte ao passo anterior para selecionar amostras.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <FlaskConical className="h-5 w-5" />
            Ordenar Amostras para Degustação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Arraste e solte as amostras para definir a ordem de degustação. 
            A numeração indica a sequência em que serão apresentadas aos degustadores.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((sample, index) => (
                  <SortableItem
                    key={sample.id}
                    sample={sample}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-beer-dark">Resumo da Ordem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total de amostras:</span>
              <span>{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Primeira amostra:</span>
              <span>{items[0]?.code || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Última amostra:</span>
              <span>{items[items.length - 1]?.code || '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}