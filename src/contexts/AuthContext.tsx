/**
 * Contexto de autenticação
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services';
import { User, LoginData, RegisterData } from '../types';
import { getErrorMessage } from '../services/api';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (data: LoginData) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega dados do usuário ao iniciar
  useEffect(() => {
    loadStoredUser();
  }, []);

  /**
   * Carrega usuário do storage
   */
  const loadStoredUser = async () => {
    try {
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        // Valida o token buscando dados atualizados
        const currentUser = await authService.getMe();
        setUser(currentUser);
      }
    } catch (error) {
      console.log('Token inválido ou expirado:', error);
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fazer login
   */
  const signIn = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      setUser(response.user);
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  };

  /**
   * Fazer cadastro
   */
  const signUp = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  };

  /**
   * Fazer logout
   */
  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  /**
   * Atualizar dados do usuário
   */
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};

export default AuthContext;
