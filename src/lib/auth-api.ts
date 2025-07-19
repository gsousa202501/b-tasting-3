import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { LoginCredentials, AuthResponse, User } from "@/types/auth";

const API_BASE_URL = "https://baccess.api-centraldegestaoindustrial.com";

export const authApi = {
  async login({
    user: email,
    password,
  }: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/perfil/usuario`, {
        usuario: email,
        senha: password,
      });

      const { token } = response.data;

      if (!token) {
        throw new Error("Token não retornado pela API");
      }

      const decoded: any = jwtDecode(token);

      const usuario = decoded.usuario;

      if (!usuario) {
        throw new Error("Token inválido: dados do usuário não encontrados");
      }

      const user: User = {
        id: String(usuario.cod_usuario),
        name: usuario.nome,
        email: usuario.email,
        role: "user",
        department: "",
        permissions: [],
        isActive: true,
        matricula: usuario.matricula,
        filial: usuario.cod_filial,
      };

      return {
        user,
        token,
        refreshToken: "",
        expiresIn: decoded.exp ? decoded.exp - decoded.iat : 3600,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const msg = error.response.data?.message;

        if (status === 401) {
          throw new Error("Usuário ou senha inválidos");
        }

        throw new Error(msg || "Erro ao fazer login");
      }

      throw new Error("Erro de rede ou servidor fora do ar");
    }
  },

  async getCurrentUser(token: string): Promise<User> {
    try {
      const decoded: any = jwtDecode(token);

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        throw new Error("Token expirado");
      }

      const usuario = decoded.usuario;

      if (!usuario) {
        throw new Error("Token inválido: dados do usuário não encontrados");
      }

      return {
        id: String(usuario.cod_usuario),
        name: usuario.nome,
        email: usuario.email,
        role: "user",
        department: "",
        permissions: [],
        isActive: true,
        matricula: usuario.matricula,
        filial: usuario.cod_filial,
      };
    } catch (err) {
      throw new Error("Token inválido ou expirado");
    }
  },

  async logout(): Promise<void> {
    return;
  },

  async refreshToken(_refreshToken?: string): Promise<AuthResponse> {
    throw new Error("Refresh token não suportado pela API atual");
  },
};
