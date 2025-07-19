import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FlaskConical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Product } from '@/types/products';
import { ProductDialog } from './product-dialog';
import { toast } from 'sonner';

// Mock data para demonstração
const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'IPA Premium',
    description: 'India Pale Ale com lúpulo americano',
    type: 'IPA',
    category: 'Premium',
    abv: 6.5,
    ibu: 65,
    srm: 8,
    isEligibleForTasting: true,
    specifications: {
      ph: 4.2,
      density: 1.012,
      temperature: { min: 4, max: 6 },
      storageConditions: { temperature: 2, humidity: 65, light: 'protected' },
      shelfLife: 90,
      ingredients: ['Malte Pilsen', 'Lúpulo Cascade', 'Levedura Ale'],
      allergens: ['Glúten']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'product-2',
    name: 'Lager Tradicional',
    description: 'Cerveja lager de baixa fermentação',
    type: 'Lager',
    category: 'Standard',
    abv: 4.8,
    ibu: 25,
    srm: 4,
    isEligibleForTasting: false,
    specifications: {
      ph: 4.0,
      density: 1.008,
      temperature: { min: 2, max: 4 },
      storageConditions: { temperature: 1, humidity: 60, light: 'protected' },
      shelfLife: 120,
      ingredients: ['Malte Pilsen', 'Lúpulo Saaz', 'Levedura Lager'],
      allergens: ['Glúten']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'product-3',
    name: 'Pilsner Especial',
    description: 'Pilsner tcheca com malte especial',
    type: 'Pilsner',
    category: 'Premium',
    abv: 5.2,
    ibu: 35,
    srm: 3,
    isEligibleForTasting: true,
    specifications: {
      ph: 4.1,
      density: 1.010,
      temperature: { min: 3, max: 5 },
      storageConditions: { temperature: 2, humidity: 62, light: 'protected' },
      shelfLife: 100,
      ingredients: ['Malte Pilsner', 'Lúpulo Saaz', 'Levedura Lager'],
      allergens: ['Glúten']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  }
];

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEligibility, setFilterEligibility] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Get unique types for filter
  const availableTypes = ['all', ...new Set(products.map(p => p.type))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || product.type === filterType;
    
    const matchesEligibility = filterEligibility === 'all' ||
      (filterEligibility === 'eligible' && product.isEligibleForTasting) ||
      (filterEligibility === 'not-eligible' && !product.isEligibleForTasting);
    
    return matchesSearch && matchesType && matchesEligibility;
  });

  const handleToggleEligibility = (productId: string, isEligible: boolean) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isEligibleForTasting: isEligible, updatedAt: new Date().toISOString() }
        : product
    ));
    
    toast.success(
      isEligible 
        ? 'Produto habilitado para degustação' 
        : 'Produto desabilitado para degustação'
    );
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success('Produto excluído com sucesso');
    }
  };

  const handleSaveProduct = (product: Product) => {
    const isEditing = products.some(p => p.id === product.id);
    
    if (isEditing) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      toast.success('Produto atualizado com sucesso');
    } else {
      setProducts(prev => [...prev, product]);
      toast.success('Produto criado com sucesso');
    }

    setEditProduct(null);
    setCreateDialogOpen(false);
  };

  const eligibleCount = products.filter(p => p.isEligibleForTasting).length;
  const notEligibleCount = products.length - eligibleCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
            Gerenciamento de Produtos
          </h1>
          <p className="text-muted-foreground">
            Gerencie produtos e configure elegibilidade para degustação
          </p>
        </div>

        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-beer-medium hover:bg-beer-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Elegíveis para Degustação
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{eligibleCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Não Elegíveis
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{notEligibleCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tipos de Produto
            </CardTitle>
            <FlaskConical className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{availableTypes.length - 1}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Search className="h-5 w-5" />
            Buscar e Filtrar Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, descrição ou tipo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-input rounded-md bg-background"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              {availableTypes.slice(1).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-input rounded-md bg-background"
              value={filterEligibility}
              onChange={(e) => setFilterEligibility(e.target.value)}
            >
              <option value="all">Todas as elegibilidades</option>
              <option value="eligible">Elegíveis</option>
              <option value="not-eligible">Não elegíveis</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-beer-dark">
            Produtos ({filteredProducts.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os produtos cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <div className="rounded-md border border-beer-medium/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-beer-light/30">
                    <TableHead className="font-semibold text-beer-dark">Produto</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Tipo</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Categoria</TableHead>
                    <TableHead className="font-semibold text-beer-dark">ABV</TableHead>
                    <TableHead className="font-semibold text-beer-dark">IBU</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Elegível para Degustação</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Atualizado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-beer-light/20">
                      <TableCell>
                        <div>
                          <p className="font-medium text-beer-dark">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.abv}%</TableCell>
                      <TableCell>{product.ibu}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={product.isEligibleForTasting}
                            onCheckedChange={(checked) => 
                              handleToggleEligibility(product.id, checked)
                            }
                          />
                          <Label className="text-sm">
                            {product.isEligibleForTasting ? 'Sim' : 'Não'}
                          </Label>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(product.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
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
                            <DropdownMenuItem onClick={() => setEditProduct(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(product.id)}
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
                <Package className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
                <h3 className="mt-4 text-lg font-semibold text-beer-dark">
                  Nenhum produto encontrado
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ajuste os filtros ou crie um novo produto.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      {(editProduct || createDialogOpen) && (
        <ProductDialog
          product={editProduct}
          open={!!editProduct || createDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditProduct(null);
              setCreateDialogOpen(false);
            }
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
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