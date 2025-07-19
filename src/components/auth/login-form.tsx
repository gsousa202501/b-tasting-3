import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LottieLoader } from "@/components/ui/lottie-loader";
import { useAuth } from "@/providers/auth-provider";
import { LoginCredentials } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Beer,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  user: z.string().min(1, "Usuário é obrigatório"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha muito longa"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      user: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data as LoginCredentials);
    } catch (error) {
      // handled by provider
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beer-light via-background to-beer-light/50 p-4">
      <Card className="w-full max-w-md border-beer-medium/20 bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-beer-medium shadow-lg">
              <Beer className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-beer-dark">
              B-Tasting
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sistema de Gestão de Degustação
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="usuario"
                  type="text"
                  placeholder="Digite seu usuário"
                  className="pl-10"
                  {...register("user")}
                  disabled={isLoading || isSubmitting}
                />
              </div>
              {errors.user && (
                <p className="text-sm text-destructive">
                  {errors.user.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="pl-10 pr-10"
                  {...register("password")}
                  disabled={isLoading || isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}{" "}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue("rememberMe", checked as boolean)
                }
                disabled={isLoading || isSubmitting}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar de mim
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-beer-medium hover:bg-beer-dark"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <>
                  <LottieLoader size="sm" variant="processing" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
