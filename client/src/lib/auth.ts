import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

export class AuthManager {
  private static instance: AuthManager;
  private user: User | null = null;
  private token: string | null = null;

  private constructor() {
    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadFromStorage() {
    try {
      this.token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user-data');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearAuth();
    }
  }

  private saveToStorage() {
    if (this.token) {
      localStorage.setItem('auth-token', this.token);
    }
    if (this.user) {
      localStorage.setItem('user-data', JSON.stringify(this.user));
    }
  }

  async login(username: string, password: string, loginType: "admin" | "exco"): Promise<User> {
    try {
      const { data } = await apiRequest("POST", "/api/admin/login", {
        username,
        password,
        loginType,
      });

      // Handle both old format (direct user) and new format (user + token)
      const user = data.user || data;
      const token = data.token;

      if (!user || !user.id) {
        throw new Error("Invalid response from server");
      }

      // Check if user role matches requested login type
      if (user.role !== loginType) {
        throw new Error(`You do not have ${loginType} privileges. Your role is ${user.role}.`);
      }

      this.user = user;
      this.token = token;
      this.saveToStorage();

      return user;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  async checkAuth(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const { data } = await apiRequest("GET", "/api/admin/check-auth");
      if (data && data.id) {
        this.user = data;
        this.saveToStorage();
        return data;
      } else {
        this.clearAuth();
        return null;
      }
    } catch (error) {
      this.clearAuth();
      return null;
    }
  }

  logout() {
    this.clearAuth();
  }

  private clearAuth() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.user !== null && this.token !== null;
  }

  hasRole(role: "admin" | "exco"): boolean {
    return this.user?.role === role;
  }

  isAdmin(): boolean {
    return this.user?.role === "admin";
  }

  isExco(): boolean {
    return this.user?.role === "exco" || this.user?.role === "admin";
  }
}

export const authManager = AuthManager.getInstance();
