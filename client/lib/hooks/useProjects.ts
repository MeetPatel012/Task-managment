import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  members: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
  }>;
  status: "active" | "archived";
  startDate?: string;
  dueDate?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  success: boolean;
  projects: Project[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useProjects(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<ProjectsResponse>({
    queryKey: ["projects", params],
    queryFn: async () => {
      const response = await api.projects.getAll(params);
      return response.data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      startDate?: string;
      dueDate?: string;
      color?: string;
    }) => {
      const response = await api.projects.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await api.projects.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Project>;
    }) => {
      const response = await api.projects.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific project and projects list
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.projects.delete(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate projects list to remove archived project
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      email,
      role,
    }: {
      projectId: string;
      userId?: string;
      email?: string;
      role: string;
    }) => {
      const response = await api.projects.addMember(projectId, {
        userId,
        email,
        role,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate project to refresh members list
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => {
      const response = await api.projects.removeMember(projectId, userId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate project to refresh members list
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },
  });
}
