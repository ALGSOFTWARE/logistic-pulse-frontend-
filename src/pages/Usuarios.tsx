import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Search, 
  Shield, 
  User,
  Clock, 
  Mail,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  UserCog,
  Settings
} from "lucide-react";

const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case "admin": return "bg-red-100 text-red-800 border-red-300";
    case "funcionario": return "bg-blue-100 text-blue-800 border-blue-300";
    case "cliente": return "bg-green-100 text-green-800 border-green-300";
    default: return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getUserTypeIcon = (userType: string) => {
  switch (userType) {
    case "admin": return Shield;
    case "funcionario": return UserCog;
    case "cliente": return User;
    default: return User;
  }
};

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isDefaultPasswordDialogOpen, setIsDefaultPasswordDialogOpen] = useState(false);
  
  const { users, loading, error, refetch, setDefaultPasswords, changePassword } = useUsers();
  const { user: currentUser } = useAuth();
  
  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmitPasswordChange = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      form.setError("confirmPassword", { 
        type: "manual", 
        message: "As senhas não coincidem" 
      });
      return;
    }

    if (!selectedUser) return;

    const success = await changePassword(selectedUser, data.newPassword);
    if (success) {
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      form.reset();
    }
  };

  const handleSetDefaultPasswords = async (forceUpdate: boolean = false) => {
    const success = await setDefaultPasswords(forceUpdate);
    if (success) {
      setIsDefaultPasswordDialogOpen(false);
    }
  };

  const openPasswordDialog = (userId: string) => {
    setSelectedUser(userId);
    setIsPasswordDialogOpen(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="w-8 h-8 animate-spin mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Carregando usuários...</h2>
              <p className="text-muted-foreground">Conectando ao banco de dados</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">Administre usuários do sistema MIT Tracking</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isDefaultPasswordDialogOpen} onOpenChange={setIsDefaultPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  Senhas Padrão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Definir Senhas Padrão</DialogTitle>
                  <DialogDescription>
                    Define a senha padrão "mit2024" para todos os usuários do sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Esta ação irá alterar a senha de todos os usuários para "mit2024".
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDefaultPasswordDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => handleSetDefaultPasswords(true)} className="bg-orange-500 hover:bg-orange-600">
                      Confirmar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.is_active).length}</div>
              <p className="text-xs text-muted-foreground">
                {users.length > 0 ? Math.round((users.filter(u => u.is_active).length / users.length) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.user_type === 'admin').length}</div>
              <p className="text-xs text-muted-foreground">Usuários admin</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Senha</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.has_password).length}</div>
              <p className="text-xs text-muted-foreground">Senhas definidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>
                  {users.length} usuários cadastrados no sistema
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-[300px]"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhum usuário encontrado para a busca' : 'Nenhum usuário cadastrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const TypeIcon = getUserTypeIcon(user.user_type);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-brand-dark">
                                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">ID: {user.id.slice(-8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getUserTypeColor(user.user_type)}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {user.user_type === 'admin' ? 'Admin' : 
                             user.user_type === 'funcionario' ? 'Funcionário' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {user.is_active ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 mr-2" />
                            )}
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                            {user.last_login 
                              ? new Date(user.last_login).toLocaleDateString('pt-BR') 
                              : 'Nunca'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPasswordDialog(user.id)}
                            disabled={currentUser?.id === user.id}
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Senha
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog para alterar senha */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Senha do Usuário</DialogTitle>
              <DialogDescription>
                Digite a nova senha para o usuário selecionado.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Digite a nova senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirme a nova senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90 text-brand-dark">
                    Alterar Senha
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}