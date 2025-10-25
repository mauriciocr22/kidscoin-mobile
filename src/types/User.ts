/**
 * Types relacionados a usuários
 */

export type UserRole = 'PARENT' | 'CHILD';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  familyId: string;
  avatarUrl: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  familyName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface CreateChildData {
  fullName: string;
  age: number;
  pin: string;
  avatarUrl?: string;
}
