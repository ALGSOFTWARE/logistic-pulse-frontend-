import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("joao@exemplo.com");
  const [password, setPassword] = useState("mit2024");
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Logo MIT cobrindo toda a área */}
      <div className="flex-1 relative overflow-hidden bg-white flex items-center justify-center p-8">
        <img 
          src="/lovable-uploads/mit logo preto.png" 
          alt="Logo MIT MOVE IN TECH"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Right Side - Login Form com cores do logo */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-12 py-8">
          {/* Tabs */}
          <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="login" 
                className="border-b-2 border-green-500 bg-transparent text-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-600 data-[state=active]:shadow-none rounded-none pb-2 font-medium"
              >
                LOGIN
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="border-b-2 border-transparent bg-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-green-600 data-[state=active]:border-green-500 data-[state=active]:shadow-none rounded-none pb-2 font-medium"
                onClick={() => navigate("/cadastro")}
              >
                NEW USER
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Bem-vindo ao MIT Tracking</h2>
                <p className="text-sm text-gray-600 mt-2">Use: senha padrão "mit2024"</p>
              </div>

              {/* Erro de login */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <div className="space-y-4">
                <div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 rounded-none bg-transparent focus:border-green-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Email"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 rounded-none bg-transparent focus:border-green-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Password"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <Button 
                onClick={handleLogin} 
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 mt-8 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'LOGIN'
                )}
              </Button>

              {/* Credenciais de teste */}
              <div className="text-center mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">Usuários de teste:</p>
                <p className="text-xs text-green-600 mt-1">
                  joao@exemplo.com, pedro@exemplo.com, maria@exemplo.com<br/>
                  <strong>Senha:</strong> mit2024
                </p>
              </div>

              <div className="text-center mt-6">
                <a href="#" className="text-green-600 hover:text-green-700 text-sm">
                  Forgot Password?
                </a>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Create Account</h2>
              </div>
              {/* Register form would go here */}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-12 py-6 text-center text-sm text-gray-500">
          Stagg Logistics 2025
        </div>
      </div>
    </div>
  );
};

export default Login;