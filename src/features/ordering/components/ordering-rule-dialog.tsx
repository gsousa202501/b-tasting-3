import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Save, Settings, GripVertical, Package } from 'lucide-react';
import { OrderingRule, ProductOrder, Product } from '@/types/products';
import { toast } from 'sonner';

// Mock products data - in real app, this would come from props or API
const mockEligibleProducts: Product[] = [
  {
    id: 'product-1',
    name: 'IPA Premium',
    type: 'IPA',
    category: 'Premium',
    abv: 6.5,
    ibu: 65,
    srm: 8,
    isEligibleForTasting: true,
  },
  {
    id: 'product-3',
    name: 'Pilsner Especial',
    type: 'Pilsner',
    category: 'Premium',
    abv: 5.2,
    ibu: 35,
    srm: 3,
    isEligibleForTasting: true,
  }
] as Product[];

interface OrderingRuleDialogProps {
  rule?: OrderingRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rule: OrderingRule) => void;
}

interface SortableProductItemProps {
  productOrder: ProductOrder;
  product: Product;
  index: number;
  onUpdateOrder: (productId: string, order: number) => void;
  onToggleIncluded: (productId: string, included: boolean) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
}

function SortableProductItem({ 
  productOrder, 
  product, 
  index, 
  onUpdateOrder, 
  onToggleIncluded, 
  onUpdateNotes 
}: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: productOrder.productId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 space-y-3 transition-colors ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-beer-light/20'
      } ${productOrder.isIncluded ? 'bg-white' : 'bg-gray-50'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium text-white text-sm font-medium cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            {index + 1}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={productOrder.isIncluded}
                onCheckedChange={(checked) => onToggleIncluded(productOrder.productId, checked as boolean)}
              />
              <h4 className="font-medium text-beer-dark">{product.name}</h4>
              <Badge variant="outline">{product.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm">Ordem:</Label>
          <select
            className="px-2 py-1 border border-input rounded text-sm w-16"
            value={productOrder.order}
            onChange={(e) => onUpdateOrder(productOrder.productId, parseInt(e.target.value))}
            disabled={!productOrder.isIncluded}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
        </div>
      </div>

      {productOrder.isIncluded && (
        <div className="space-y-2">
          <Label className="text-sm">Observações (opcional)</Label>
          <Input
            placeholder="Ex: Começar com sabor mais suave..."
            value={productOrder.notes || ''}
            onChange={(e) => onUpdateNotes(productOrder.productId, e.target.value)}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}

export function OrderingRuleDialog({ rule, open, onOpenChange, onSave }: OrderingRuleDialogProps) {
  const [formData, setFormData] = useState<OrderingRule>(() => {
    if (rule) return rule;
    
    return {
      id: `rule-${Date.now()}`,
      name: '',
      description: '',
      isActive: true,
      sessionTypes: ['routine'],
      productOrders: mockEligibleProducts.map((product, index) => ({
        productId: product.id,
        order: index + 1,
        isIncluded: false,
        notes: ''
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isEditing = !!rule;

  const updateField = (field: keyof OrderingRule, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const updateProductOrder = (productId: string, updates: Partial<ProductOrder>) => {
    setFormData(prev => ({
      ...prev,
      productOrders: prev.productOrders.map(po => 
        po.productId === productId ? { ...po, ...updates } : po
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFormData(prev => {
        const oldIndex = prev.productOrders.findIndex(po => po.productId === active.id);
        const newIndex = prev.productOrders.findIndex(po => po.productId === over?.id);

        const newOrders = arrayMove(prev.productOrders, oldIndex, newIndex);
        
        // Update order numbers based on new positions
        const updatedOrders = newOrders.map((po, index) => ({
          ...po,
          order: index + 1
        }));

        return {
          ...prev,
          productOrders: updatedOrders,
          updatedAt: new Date().toISOString()
        };
      });
    }
  };

  const handleSessionTypeToggle = (type: 'routine' | 'extra', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sessionTypes: checked 
        ? [...prev.sessionTypes, type]
        : prev.sessionTypes.filter(t => t !== type),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da regra é obrigatório');
      return;
    }

    if (formData.sessionTypes.length === 0) {
      toast.error('Selecione pelo menos um tipo de sessão');
      return;
    }

    const includedProducts = formData.productOrders.filter(po => po.isIncluded);
    if (includedProducts.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    onSave(formData);
  };

  const includedCount = formData.productOrders.filter(po => po.isIncluded).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-beer-dark">
            <Settings className="h-5 w-5" />
            {isEditing ? 'Editar Regra de Ordenação' : 'Nova Regra de Ordenação'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-beer-dark">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Nome da Regra *</Label>
                    <Input
                      id="rule-name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Ex: Ordenação Padrão - Sessões de Rotina"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rule-description">Descrição</Label>
                    <Textarea
                      id="rule-description"
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Descreva quando e como esta regra deve ser aplicada..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => updateField('isActive', checked)}
                    />
                    <Label htmlFor="is-active">Regra ativa</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Session Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-beer-dark">Tipos de Sessão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="routine"
                      checked={formData.sessionTypes.includes('routine')}
                      onCheckedChange={(checked) => handleSessionTypeToggle('routine', checked as boolean)}
                    />
                    <Label htmlFor="routine">Sessões de Rotina</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extra"
                      checked={formData.sessionTypes.includes('extra')}
                      onCheckedChange={(checked) => handleSessionTypeToggle('extra', checked as boolean)}
                    />
                    <Label htmlFor="extra">Sessões Extras</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Product Ordering */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-beer-dark">
                    <span>Ordenação de Produtos</span>
                    <Badge variant="secondary">
                      {includedCount} de {formData.productOrders.length} selecionados
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione os produtos e defina a ordem de degustação. Arraste e solte para reordenar ou use o dropdown de ordem.
                  </p>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={formData.productOrders.map(po => po.productId)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {formData.productOrders.map((productOrder, index) => {
                          const product = mockEligibleProducts.find(p => p.id === productOrder.productId);
                          if (!product) return null;

                          return (
                            <SortableProductItem
                              key={productOrder.productId}
                              productOrder={productOrder}
                              product={product}
                              index={index}
                              onUpdateOrder={(productId, order) => updateProductOrder(productId, { order })}
                              onToggleIncluded={(productId, included) => updateProductOrder(productId, { isIncluded: included })}
                              onUpdateNotes={(productId, notes) => updateProductOrder(productId, { notes })}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="border-beer-medium/30 bg-beer-light/10">
                <CardHeader>
                  <CardTitle className="text-beer-dark">Resumo da Regra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-beer-dark">{includedCount}</p>
                      <p className="text-sm text-muted-foreground">Produtos Incluídos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-beer-dark">{formData.sessionTypes.length}</p>
                      <p className="text-sm text-muted-foreground">Tipos de Sessão</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-beer-dark">
                        {formData.isActive ? 'Ativa' : 'Inativa'}
                      </p>
                      <p className="text-sm text-muted-foreground">Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-beer-medium hover:bg-beer-dark">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Regra'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}