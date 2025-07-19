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
  Eye,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderingRule } from '@/types/products';
import { OrderingRuleDialog } from './ordering-rule-dialog';
import { toast } from 'sonner';

// Mock data para demonstração
const mockOrderingRules: OrderingRule[] = [
  {
    id: 'rule-1',
    name: 'Ordenação Padrão - Sessões de Rotina',
    description: 'Ordem padrão para sessões de rotina: Pilsner → Lager → IPA',
    isActive: true,
    sessionTypes: ['routine'],
    productOrders: [
      { productId: 'product-3', order: 1, isIncluded: true, notes: 'Começar com sabor mais suave' },
      { productId: 'product-2', order: 2, isIncluded: true },
      { productId: 'product-1', order: 3, isIncluded: true, notes: 'Finalizar com mais amargor' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'rule-2',
    name: 'Ordenação Especial - Análise de Amargor',
    description: 'Ordem crescente de amargor para análise comparativa',
    isActive: false,
    sessionTypes: ['extra'],
    productOrders: [
      { productId: 'product-2', order: 1, isIncluded: true },
      { productId: 'product-3', order: 2, isIncluded: true },
      { productId: 'product-1', order: 3, isIncluded: true }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  }
];

export function OrderingRulesManagement() {
  const [rules, setRules] = useState<OrderingRule[]>(mockOrderingRules);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  const [editRule, setEditRule] = useState<OrderingRule | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter rules
  const filteredRules = rules.filter(rule => {
    const matchesSearch = searchTerm === '' || 
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && rule.isActive) ||
      (filterStatus === 'inactive' && !rule.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (ruleToDelete) {
      setRules(prev => prev.filter(r => r.id !== ruleToDelete));
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
      toast.success('Regra de ordenação excluída com sucesso');
    }
  };

  const handleSaveRule = (rule: OrderingRule) => {
    const isEditing = rules.some(r => r.id === rule.id);
    
    if (isEditing) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      toast.success('Regra de ordenação atualizada com sucesso');
    } else {
      setRules(prev => [...prev, rule]);
      toast.success('Regra de ordenação criada com sucesso');
    }

    setEditRule(null);
    setCreateDialogOpen(false);
  };

  const handleToggleActive = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
        : rule
    ));
    
    const rule = rules.find(r => r.id === ruleId);
    toast.success(
      rule?.isActive 
        ? 'Regra desativada' 
        : 'Regra ativada'
    );
  };

  const activeCount = rules.filter(r => r.isActive).length;
  const inactiveCount = rules.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
            Regras de Ordenação
          </h1>
          <p className="text-muted-foreground">
            Configure regras de ordenação automática para produtos em sessões
          </p>
        </div>

        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-beer-medium hover:bg-beer-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Regras
            </CardTitle>
            <Settings className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{rules.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Regras Ativas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{activeCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Regras Inativas
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{inactiveCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Para Rotina
            </CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">
              {rules.filter(r => r.sessionTypes.includes('routine')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Search className="h-5 w-5" />
            Buscar e Filtrar Regras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-input rounded-md bg-background"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-beer-dark">
            Regras de Ordenação ({filteredRules.length})
          </CardTitle>
          <CardDescription>
            Lista de todas as regras de ordenação configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRules.length > 0 ? (
            <div className="rounded-md border border-beer-medium/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-beer-light/30">
                    <TableHead className="font-semibold text-beer-dark">Nome</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Descrição</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Tipos de Sessão</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Produtos</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Status</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Atualizado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id} className="hover:bg-beer-light/20">
                      <TableCell className="font-medium text-beer-dark">
                        {rule.name}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {rule.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rule.sessionTypes.map(type => (
                            <Badge key={type} variant="outline">
                              {type === 'routine' ? 'Rotina' : 'Extra'}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {rule.productOrders.filter(p => p.isIncluded).length} produtos
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(rule.id)}
                          >
                            {rule.isActive ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(rule.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
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
                            <DropdownMenuItem onClick={() => setEditRule(rule)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditRule(rule)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(rule.id)}
                              className="text-destructive focus:text-destructive"
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
                  Nenhuma regra encontrada
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ajuste os filtros ou crie uma nova regra de ordenação.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Dialog */}
      {(editRule || createDialogOpen) && (
        <OrderingRuleDialog
          rule={editRule}
          open={!!editRule || createDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditRule(null);
              setCreateDialogOpen(false);
            }
          }}
          onSave={handleSaveRule}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta regra de ordenação? Esta ação não pode ser desfeita.
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