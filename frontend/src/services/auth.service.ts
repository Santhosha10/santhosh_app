import apiClient from "../api-client/api";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  User,
} from "../types";

export const authService = {
  login: async (payload: LoginPayload): Promise<User> => {
    const { email, password } = payload;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;
    if (!token) {
      throw new Error("Invalid login response");
    }

    localStorage.setItem("token", token);
    return user;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const { name, email, password } = payload;

    if (!name || !email || !password) {
      throw new Error("Name, email and password are required");
    }

    const response = await apiClient.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });

    const { token, user } = response.data;
    if (!token) {
      throw new Error("Invalid register response");
    }

    localStorage.setItem("token", token);
    return user;
  },

  logout: (): void => {
    localStorage.removeItem("token");
  },

  isAuthenticated: async (): Promise<User | false> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        authService.logout();
        return Promise.resolve(false);
      }
      let { data } = await apiClient.get<{ user: User }>("/auth/me");
      const user = data.user;
      if (!user) {
        authService.logout();
        return Promise.resolve(false);
      }
      return Promise.resolve(user);
    } catch (error) {
      return Promise.resolve(false);
    }
  },
};
