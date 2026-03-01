export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  avatarUrl?: string;
  language?: string;
  timezone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
