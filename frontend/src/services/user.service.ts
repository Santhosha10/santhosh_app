import apiClient from "../api-client/api";
import type { User } from "../types/index";

export const userService = {
  getAll: () => apiClient.get<User[]>("/users"),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (data: Omit<User, "id">) => apiClient.post<User>("/users", data),
  update: (id: string, data: Partial<User>) =>
    apiClient.put<User>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};
