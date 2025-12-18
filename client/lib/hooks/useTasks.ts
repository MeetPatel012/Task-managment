import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface Task {
  _id: string;
  project: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  order: number;
  tags: string[];
  subtasks: Array<{
    title: string;
    isCompleted: boolean;
  }>;
  attachments: Array<{
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  success: boolean;
  tasks: Task[];
}

export function useProjectTasks(
  projectId: string,
  params?: { status?: string; assignee?: string; search?: string }
) {
  return useQuery<TasksResponse>({
    queryKey: ["tasks", projectId, params],
    queryFn: async () => {
      const response = await api.tasks.getByProject(projectId, params);
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const response = await api.tasks.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      assignee?: string;
      dueDate?: string;
      tags?: string[];
    }) => {
      const response = await api.tasks.create(projectId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await api.tasks.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useReorderTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      order,
    }: {
      id: string;
      status: string;
      order: number;
    }) => {
      const response = await api.tasks.reorder(id, { status, order });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.tasks.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
