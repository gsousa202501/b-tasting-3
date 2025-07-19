import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Settings,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Star,
  Eye,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderingConfiguration } from '@/types/ordering';
import { OrderingConfigurationDialog } from './ordering-configuration';
import { toast } from 'sonner';

// Mock data para demonstração
const mockConfigurations: OrderingConfiguration[] = [
  {
    id: 'config-1',
    name: 'Ordenação Padrão - Rotina',
    description: 'Configuração padrão para sessões de rotina, priorizando qualidade e data de produção',
    criteria: [],
    isDefault: true,
    sessionType: 'routine',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'config-2',
    name: 'Ordenação por Risco',
    description: 'Prioriza amostras com maior risco e necessidade de avaliação urgente',
    criteria: [],
    isDefault: false,
    sessionType: 'extra',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'config-3',
    name: 'Ordenação por Frequência',
    description: 'Baseada na frequência de testes e última avaliação',
    criteria: [],
    isDefault: false,
    sessionType: 'all',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function OrderingManagement() {
  const [configurations, setConfigurations] = useState<OrderingConfiguration[]>(mockConfigurations);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<OrderingConfiguration | null>(null);

  const filteredConfigurations = configurations.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveConfiguration = (config: OrderingConfiguration) => {
    const isEditing = configurations.some(c => c.id === config.id);
    
    if (isEditing) {
      setConfigurations(prev => prev.map(c => c.id === config.id ? config : c));
    } else {
      setConfigurations(prev => [...prev, config]);
    }

    setEditConfig(null);
  };

  const handleDeleteClick = (configId: string) => {
    setConfigToDelete(configId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (configToDelete) {
      setConfigurations(prev => prev.filter(c => c.id !== configToDelete));
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
      toast.success('Configuração excluída com sucesso');
    }
  };

  const handleDuplicate = (config: OrderingConfiguration) => {
    const duplicated: OrderingConfiguration = {
      ...config,
      id: `config-${Date.now()}`,
      name: `${config.name} (Cópia)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConfigurations(prev => [...prev, duplicated]);
    toast.success('Configuração duplicada com sucesso');
  };

  const handleSetDefault = (configId: string) => {
    setConfigurations(prev => prev.map(c => ({
      ...c,
      isDefault: c.id === configId,
      updatedAt: new Date().toISOString()
    })));
    toast.success('Configuração padrão atualizada');
  };

  const getSessionTypeLabel = (type?: string) => {
    switch (type) {
      case 'routine': return 'Rotina';
      case 'extra': return 'Extra';
      default: return 'Todas';
    }
  };

  const getSessionTypeVariant = (type?: string) => {
    switch (type) {
      case 'routine': return 'default' as const;
      case 'extra': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
            Configurações de Ordenação
          </h1>
          <p className="text-muted-foreground">
            Gerencie as configurações de ordenação automática de amostras
          </p>
        </div>

        <OrderingConfigurationDialog onSave={handleSaveConfiguration}>
          <Button className="bg-beer-medium hover:bg-beer-dark">
            <Plus className="mr-2 h-4 w-4" />
            Nova Configuração
          </Button>
        </OrderingConfigurationDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Configurações
            </CardTitle>
            <Settings className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{configurations.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Configuração Padrão
            </CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-beer-dark">
              {configurations.find(c => c.isDefault)?.name || 'Nenhuma'}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Para Rotina
            </CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">
              {configurations.filter(c => c.sessionType === 'routine').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Para Extra
            </CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">
              {configurations.filter(c => c.sessionType === 'extra').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Search className="h-5 w-5" />
            Buscar Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurations Table */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-beer-dark">
            Configurações ({filteredConfigurations.length})
          </CardTitle>
          <CardDescription>
            Lista de todas as configurações de ordenação disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConfigurations.length > 0 ? (
            <div className="rounded-md border border-beer-medium/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-beer-light/30">
                    <TableHead className="font-semibold text-beer-dark">Nome</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Descrição</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Tipo de Sessão</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Status</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Criado em</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConfigurations.map((config) => (
                    <TableRow key={config.id} className="hover:bg-beer-light/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {config.isDefault && (
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                          )}
                          <span className="font-medium text-beer-dark">{config.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {config.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSessionTypeVariant(config.sessionType)}>
                          {getSessionTypeLabel(config.sessionType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.isDefault ? "default" : "secondary"}>
                          {config.isDefault ? "Padrão" : "Ativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(config.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditConfig(config)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(config)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                            {!config.isDefault && (
                              <DropdownMenuItem onClick={() => handleSetDefault(config.id)}>
                                <Star className="mr-2 h-4 w-4" />
                                Definir como Padrão
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(config.id)}
                              className="text-destructive focus:text-destructive"
                              disabled={config.isDefault}
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
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Settings className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
                <h3 className="mt-4 text-lg font-semibold text-beer-dark">
                  Nenhuma configuração encontrada
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ajuste os filtros ou crie uma nova configuração.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Configuration Dialog */}
      {editConfig && (
        <OrderingConfigurationDialog
          configuration={editConfig}
          onSave={handleSaveConfiguration}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta configuração? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}