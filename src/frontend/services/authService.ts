/// <reference lib="dom" />

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export class AuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor() {
    this.checkAuthState();
  }

  public async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer login');
      }

      const data: LoginResponse = await response.json();
      this.user = data.user;
      this.token = data.token;
      
      this.updateAuthHeaders();
      this.dispatchAuthEvent(true);
      
      return this.user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  private checkAuthState(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      this.token = token;
      this.user = JSON.parse(userData);
      this.updateAuthHeaders();
      this.dispatchAuthEvent(true);
    } else {
      this.dispatchAuthEvent(false);
    }
  }

  private updateAuthHeaders(): void {
    if (this.token) {
      localStorage.setItem('token', this.token);
      if (this.user) {
        localStorage.setItem('user', JSON.stringify(this.user));
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  public logout(): void {
    this.user = null;
    this.token = null;
    this.updateAuthHeaders();
    this.dispatchAuthEvent(false);
  }

  private dispatchAuthEvent(isLoggedIn: boolean): void {
    const event = new CustomEvent('authStateChange', {
      detail: { isLoggedIn, user: this.user }
    });
    window.dispatchEvent(event);
  }

  public getUser(): User | null {
    return this.user;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  public async refreshToken(): Promise<void> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o token');
      }

      const data = await response.json();
      this.token = data.token;
      this.updateAuthHeaders();
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      this.logout();
    }
  }

  public async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data = await response.json();
      if (data.valid && data.user) {
        this.user = data.user;
        this.updateAuthHeaders();
        this.dispatchAuthEvent(true);
        return true;
      }

      this.logout();
      return false;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      this.logout();
      return false;
    }
  }
} 