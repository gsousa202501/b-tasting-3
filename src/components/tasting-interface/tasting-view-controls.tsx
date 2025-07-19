import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Settings,
  Save,
  Eye,
  Columns,
  RotateCcw,
  Download,
  Shuffle
} from 'lucide-react';
import { TastingViewConfiguration, TastingSpecification } from '@/types/tasting-interface';

interface TastingViewControlsProps {
  viewConfigurations: TastingViewConfiguration[];
  currentView: string;
  specifications: TastingSpecification[];
  isTransposed: boolean;
  groupBy: string[];
  visibleColumns: string[];
  columnOrder: string[];
  onLoadView: (viewId: string) => void;
  onSaveView: (name: string, description: string) => void;
  onToggleTranspose: () => void;
  onUpdateGrouping: (groupBy: string[]) => void;
  onToggleColumnVisibility: (columnId: string, visible: boolean) => void;
  onReorderColumns: (newOrder: string[]) => void;
  onExportData: (format: 'csv' | 'excel' | 'pdf' | 'json') => void;
}

const groupingOptions = [
  { value: 'type', label: 'Tipo de Amostra' },
  { value: 'groupCategory', label: 'Categoria' },
  { value: 'batch', label: 'Lote' },
  { value: 'status', label: 'Status' },
  { value: 'testType', label: 'Tipo de Teste' },
];

export function TastingViewControls({
  viewConfigurations,
  currentView,
  specifications,
  isTransposed,
  groupBy,
  visibleColumns,
  columnOrder,
  onLoadView,
  onSaveView,
  onToggleTranspose,
  onUpdateGrouping,
  onToggleColumnVisibility,
  onReorderColumns,
  onExportData
}: TastingViewControlsProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    
    onSaveView(newViewName, newViewDescription);
    setNewViewName('');
    setNewViewDescription('');
    setSaveDialogOpen(false);
  };

  const handleGroupingChange = (field: string, checked: boolean) => {
    if (checked) {
      onUpdateGrouping([...groupBy, field]);
    } else {
      onUpdateGrouping(groupBy.filter(g => g !== field));
    }
  };

  const allColumns = [
    'code',
    'type',
    'batch',
    'groupCategory',
    ...specifications.map(s => s.name)
  ];

  return (
    <div className="space-y-4">
      {/* View Selection and Controls */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Eye className="h-5 w-5" />
            Controles de Visualização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* View Selection */}
            <div className="flex items-center gap-2">
              <Label>Visualização:</Label>
              <Select value={currentView} onValueChange={onLoadView}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {viewConfigurations.map(view => (
                    <SelectItem key={view.id} value={view.id}>
                      <div className="flex items-center gap-2">
                        {view.name}
                        {view.isDefault && <Badge variant="outline" className="text-xs">Padrão</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transpose Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="transpose"
                checked={isTransposed}
                onCheckedChange={onToggleTranspose}
              />
              <Label htmlFor="transpose">Transpor Tabela</Label>
            </div>

            {/* Save View */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Visualização
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Configuração de Visualização</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      placeholder="Nome da visualização"
                      value={newViewName}
                      onChange={(e) => setNewViewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      placeholder="Descrição opcional"
                      value={newViewDescription}
                      onChange={(e) => setNewViewDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveView} className="bg-beer-medium hover:bg-beer-dark">
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Grouping Controls */}
          <div className="space-y-2">
            <Label>Agrupamento:</Label>
            <div className="flex flex-wrap gap-2">
              {groupingOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`group-${option.value}`}
                    checked={groupBy.includes(option.value)}
                    onChange={(e) => handleGroupingChange(option.value, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`group-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Column Controls */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns className="mr-2 h-4 w-4" />
                  Colunas ({visibleColumns.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {allColumns.map(column => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    checked={visibleColumns.includes(column)}
                    onCheckedChange={(checked) => onToggleColumnVisibility(column, checked)}
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onReorderColumns([...columnOrder].sort())}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Reorganizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Controls */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Download className="h-5 w-5" />
            Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportData('csv')}
            >
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportData('excel')}
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportData('pdf')}
            >
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportData('json')}
            >
              JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-beer-dark">
                {isTransposed ? 'Transposta' : 'Normal'}
              </div>
              <p className="text-sm text-muted-foreground">Visualização</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-beer-dark">{groupBy.length}</div>
              <p className="text-sm text-muted-foreground">Agrupamentos</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-beer-dark">{visibleColumns.length}</div>
              <p className="text-sm text-muted-foreground">Colunas Visíveis</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-beer-dark">
                {specifications.length}
              </div>
              <p className="text-sm text-muted-foreground">Especificações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}