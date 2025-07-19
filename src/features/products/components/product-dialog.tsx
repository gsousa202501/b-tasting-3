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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Save, Package, Settings, FlaskConical } from 'lucide-react';
import { Product } from '@/types/products';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductDialogProps {
  product?: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
}

export function ProductDialog({ product, open, onOpenChange, onSave }: ProductDialogProps) {
  const [formData, setFormData] = useState<Product>(() => {
    if (product) return product;
    
    return {
      id: `product-${Date.now()}`,
      name: '',
      description: '',
      type: '',
      category: '',
      abv: 0,
      ibu: 0,
      srm: 0,
      isEligibleForTasting: false,
      specifications: {
        ph: 4.0,
        density: 1.010,
        temperature: { min: 2, max: 6 },
        storageConditions: { temperature: 2, humidity: 60, light: 'protected' },
        shelfLife: 90,
        ingredients: [],
        allergens: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };
  });

  const isEditing = !!product;

  const updateField = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const updateSpecification = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    if (!formData.type.trim()) {
      toast.error('Tipo do produto é obrigatório');
      return;
    }

    onSave(formData);
  };

  const handleIngredientsChange = (value: string) => {
    const ingredients = value.split(',').map(i => i.trim()).filter(Boolean);
    updateSpecification('ingredients', ingredients);
  };

  const handleAllergensChange = (value: string) => {
    const allergens = value.split(',').map(a => a.trim()).filter(Boolean);
    updateSpecification('allergens', allergens);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-beer-dark">
            <Package className="h-5 w-5" />
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="basic" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="specs">Especificações</TabsTrigger>
              <TabsTrigger value="storage">Armazenamento</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="basic" className="space-y-6 p-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-beer-dark">
                      <Package className="h-5 w-5" />
                      Dados do Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Produto *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Ex: IPA Premium"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo *</Label>
                        <Input
                          id="type"
                          value={formData.type}
                          onChange={(e) => updateField('type', e.target.value)}
                          placeholder="Ex: IPA, Lager, Pilsner"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Descreva as características do produto..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <select
                          id="category"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          value={formData.category}
                          onChange={(e) => updateField('category', e.target.value)}
                        >
                          <option value="">Selecione uma categoria</option>
                          <option value="Standard">Standard</option>
                          <option value="Premium">Premium</option>
                          <option value="Artesanal">Artesanal</option>
                          <option value="Especial">Especial</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="eligible"
                          checked={formData.isEligibleForTasting}
                          onCheckedChange={(checked) => updateField('isEligibleForTasting', checked)}
                        />
                        <Label htmlFor="eligible">Elegível para Degustação</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specs" className="space-y-6 p-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-beer-dark">
                      <FlaskConical className="h-5 w-5" />
                      Especificações Técnicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="abv">Teor Alcoólico (ABV %)</Label>
                        <Input
                          id="abv"
                          type="number"
                          step="0.1"
                          value={formData.abv}
                          onChange={(e) => updateField('abv', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ibu">Amargor (IBU)</Label>
                        <Input
                          id="ibu"
                          type="number"
                          value={formData.ibu}
                          onChange={(e) => updateField('ibu', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="srm">Cor (SRM)</Label>
                        <Input
                          id="srm"
                          type="number"
                          value={formData.srm}
                          onChange={(e) => updateField('srm', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ph">pH</Label>
                        <Input
                          id="ph"
                          type="number"
                          step="0.1"
                          value={formData.specifications.ph}
                          onChange={(e) => updateSpecification('ph', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="density">Densidade</Label>
                        <Input
                          id="density"
                          type="number"
                          step="0.001"
                          value={formData.specifications.density}
                          onChange={(e) => updateSpecification('density', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Temperatura de Serviço (°C)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Mín"
                            value={formData.specifications.temperature.min}
                            onChange={(e) => updateSpecification('temperature', {
                              ...formData.specifications.temperature,
                              min: parseInt(e.target.value) || 0
                            })}
                          />
                          <Input
                            type="number"
                            placeholder="Máx"
                            value={formData.specifications.temperature.max}
                            onChange={(e) => updateSpecification('temperature', {
                              ...formData.specifications.temperature,
                              max: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ingredients">Ingredientes (separados por vírgula)</Label>
                        <Textarea
                          id="ingredients"
                          value={formData.specifications.ingredients.join(', ')}
                          onChange={(e) => handleIngredientsChange(e.target.value)}
                          placeholder="Ex: Malte Pilsen, Lúpulo Cascade, Levedura Ale"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="allergens">Alérgenos (separados por vírgula)</Label>
                        <Input
                          id="allergens"
                          value={formData.specifications.allergens.join(', ')}
                          onChange={(e) => handleAllergensChange(e.target.value)}
                          placeholder="Ex: Glúten, Sulfitos"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="storage" className="space-y-6 p-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-beer-dark">
                      <Settings className="h-5 w-5" />
                      Condições de Armazenamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storage-temp">Temperatura (°C)</Label>
                        <Input
                          id="storage-temp"
                          type="number"
                          value={formData.specifications.storageConditions.temperature}
                          onChange={(e) => updateSpecification('storageConditions', {
                            ...formData.specifications.storageConditions,
                            temperature: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="humidity">Umidade (%)</Label>
                        <Input
                          id="humidity"
                          type="number"
                          value={formData.specifications.storageConditions.humidity}
                          onChange={(e) => updateSpecification('storageConditions', {
                            ...formData.specifications.storageConditions,
                            humidity: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="shelf-life">Validade (dias)</Label>
                        <Input
                          id="shelf-life"
                          type="number"
                          min="1"
                          max="365"
                          value={formData.specifications.shelfLife}
                          onChange={(e) => updateSpecification('shelfLife', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="light">Exposição à Luz</Label>
                      <select
                        id="light"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={formData.specifications.storageConditions.light}
                        onChange={(e) => updateSpecification('storageConditions', {
                          ...formData.specifications.storageConditions,
                          light: e.target.value as 'protected' | 'exposed'
                        })}
                      >
                        <option value="protected">Protegida</option>
                        <option value="exposed">Exposta</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-beer-medium hover:bg-beer-dark">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}