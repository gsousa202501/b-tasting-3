import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Search, Plus, MoreHorizontal, Edit, UserCheck, UserX, Mail } from 'lucide-react';
import { useState } from 'react';
import { mockTasters } from '@/lib/mock-data';

export const Route = createFileRoute('/_layout/tasters')({
  component: Tasters,
});

function Tasters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  // Get unique departments
  const departments = ['all', ...new Set(mockTasters.map(taster => taster.department))];

  // Filter tasters
  const filteredTasters = mockTasters.filter(taster => {
    const matchesSearch = searchTerm === '' || 
      taster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taster.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taster.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && taster.isActive) ||
      (filterStatus === 'inactive' && !taster.isActive);
    
    const matchesDepartment = filterDepartment === 'all' || taster.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
            Degustadores
          </h1>
          <p className="text-muted-foreground">
            Gerencie a equipe de degustadores e suas informações
          </p>
        </div>

        <Button className="bg-beer-medium hover:bg-beer-dark">
          <Plus className="mr-2 h-4 w-4" />
          Novo Degustador
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Degustadores
            </CardTitle>
            <Users className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">{mockTasters.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ativos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">
              {mockTasters.filter(t => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inativos
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">
              {mockTasters.filter(t => !t.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Departamentos
            </CardTitle>
            <Users className="h-4 w-4 text-beer-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-beer-dark">
              {departments.length - 1}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou departamento..."
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
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <select
              className="px-3 py-2 border border-input rounded-md bg-background"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">Todos os departamentos</option>
              {departments.slice(1).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tasters Table */}
      <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-beer-dark">
            Degustadores ({filteredTasters.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os degustadores cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasters.length > 0 ? (
            <div className="rounded-md border border-beer-medium/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-beer-light/30">
                    <TableHead className="font-semibold text-beer-dark">Degustador</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Email</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Departamento</TableHead>
                    <TableHead className="font-semibold text-beer-dark">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasters.map((taster) => (
                    <TableRow key={taster.id} className="hover:bg-beer-light/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-beer-medium text-white font-medium">
                            {taster.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-beer-dark">{taster.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{taster.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {taster.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={taster.isActive ? "default" : "secondary"}>
                          {taster.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {taster.isActive ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Ativar
                                </>
                              )}
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
                <Users className="mx-auto h-12 w-12 text-beer-medium opacity-50" />
                <h3 className="mt-4 text-lg font-semibold text-beer-dark">
                  Nenhum degustador encontrado
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ajuste os filtros ou adicione novos degustadores.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}