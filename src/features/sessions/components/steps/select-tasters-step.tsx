import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, UserCheck, FileText } from 'lucide-react';
import { Taster } from '@/types';
import { mockTasters } from '@/lib/mock-data';

interface SelectTastersStepProps {
  selectedTasters: Taster[];
  observations: string;
  onChange: (tasters: Taster[], observations: string) => void;
}

export function SelectTastersStep({ selectedTasters, observations, onChange }: SelectTastersStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  // Get available active tasters
  const availableTasters = mockTasters.filter(taster => taster.isActive);
  
  // Get unique departments
  const departments = ['all', ...new Set(availableTasters.map(taster => taster.department))];

  // Filter tasters based on search and department
  const filteredTasters = availableTasters.filter(taster => {
    const matchesSearch = searchTerm === '' || 
      taster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taster.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taster.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || taster.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleTasterToggle = (taster: Taster, checked: boolean) => {
    let newTasters;
    if (checked) {
      newTasters = [...selectedTasters, taster];
    } else {
      newTasters = selectedTasters.filter(t => t.id !== taster.id);
    }
    onChange(newTasters, observations);
  };

  const handleObservationsChange = (value: string) => {
    onChange(selectedTasters, value);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Search className="h-5 w-5" />
            Buscar Degustadores
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

      {/* Available Tasters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Users className="h-5 w-5" />
            Degustadores Disponíveis ({filteredTasters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasters.length > 0 ? (
            <div className="grid gap-3">
              {filteredTasters.map((taster) => {
                const isSelected = selectedTasters.some(t => t.id === taster.id);
                return (
                  <div
                    key={taster.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                      isSelected ? 'bg-beer-light/30 border-beer-medium' : 'hover:bg-beer-light/20'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => 
                        handleTasterToggle(taster, checked as boolean)
                      }
                    />
                    
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-beer-medium text-white font-medium">
                      {taster.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-beer-dark">{taster.name}</p>
                        {isSelected && (
                          <UserCheck className="h-4 w-4 text-beer-medium" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{taster.email}</p>
                    </div>
                    
                    <Badge variant="outline">
                      {taster.department}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum degustador encontrado com os critérios de busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Tasters Summary */}
      {selectedTasters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <UserCheck className="h-5 w-5" />
              Degustadores Selecionados ({selectedTasters.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {selectedTasters.map((taster) => (
                <div key={taster.id} className="flex items-center gap-3 p-3 bg-beer-light/20 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-beer-medium text-white text-sm font-medium">
                    {taster.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-beer-dark text-sm">{taster.name}</p>
                    <p className="text-xs text-muted-foreground">{taster.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <FileText className="h-5 w-5" />
            Observações (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="observations">
            Adicione observações sobre esta sessão de degustação
          </Label>
          <Textarea
            id="observations"
            placeholder="Ex: Foco na análise de amargor e aroma. Verificar consistência com lote anterior..."
            rows={4}
            value={observations}
            onChange={(e) => handleObservationsChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Estas observações serão incluídas no relatório final da sessão.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}