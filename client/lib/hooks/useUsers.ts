import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
}

export function useUsers(
  params?: { search?: string; isActive?: string },
  options?: { enabled?: boolean }
) {
  return useQuery<UsersResponse>({
    queryKey: ["users", params],
    queryFn: async () => {
      const response = await api.auth.getAllUsers(params);
      return response.data;
    },
    enabled: options?.enabled !== false,
  });
}
