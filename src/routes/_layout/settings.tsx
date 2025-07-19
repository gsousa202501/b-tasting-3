import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Shield, 
  Database,
  Mail,
  Save
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_layout/settings')({
  component: Settings,
});

function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-beer-dark">
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema e preferências
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Informações básicas do usuário do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Seu nome completo" defaultValue="Administrador" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu.email@brewery.com" defaultValue="admin@brewery.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa/Cervejaria</Label>
              <Input id="company" placeholder="Nome da cervejaria" defaultValue="B-Tasting Brewery" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como e quando receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber emails sobre sessões e resultados
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label>Tipos de Notificação</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="session-created" defaultChecked />
                  <Label htmlFor="session-created" className="text-sm">
                    Nova sessão criada
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="session-completed" defaultChecked />
                  <Label htmlFor="session-completed" className="text-sm">
                    Sessão concluída
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="quality-issues" defaultChecked />
                  <Label htmlFor="quality-issues" className="text-sm">
                    Problemas de qualidade detectados
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <SettingsIcon className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup">Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Fazer backup automático dos dados diariamente
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Usar tema escuro na interface
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="session-duration">Duração Padrão da Sessão (horas)</Label>
              <Input 
                id="session-duration" 
                type="number" 
                placeholder="2" 
                defaultValue="2"
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input id="current-password" type="password" placeholder="Digite sua senha atual" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" placeholder="Digite a nova senha" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <Input id="confirm-password" type="password" placeholder="Confirme a nova senha" />
              </div>
            </div>
            
            <Button variant="outline" className="w-full md:w-auto">
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-beer-medium/20 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-beer-dark">
              <Database className="h-5 w-5" />
              Gerenciamento de Dados
            </CardTitle>
            <CardDescription>
              Backup, exportação e limpeza de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Fazer Backup
              </Button>
              <Button variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Restaurar Backup
              </Button>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Exportar Dados
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Limpeza de Dados</Label>
              <p className="text-sm text-muted-foreground">
                Remover dados antigos automaticamente após:
              </p>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="12" 
                  defaultValue="12"
                  className="w-20"
                />
                <span className="text-sm">meses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            className="bg-beer-medium hover:bg-beer-dark"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}