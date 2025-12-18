import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  task: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsResponse {
  success: boolean;
  comments: Comment[];
}

export function useComments(taskId: string) {
  return useQuery<CommentsResponse>({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      const response = await api.comments.getByTask(taskId);
      return response.data;
    },
    enabled: !!taskId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      content,
    }: {
      taskId: string;
      content: string;
    }) => {
      const response = await api.comments.create(taskId, { content });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate comments to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      taskId,
    }: {
      commentId: string;
      taskId: string;
    }) => {
      const response = await api.comments.delete(commentId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate comments to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
}
