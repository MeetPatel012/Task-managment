import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export interface DashboardOverview {
  projectsCount: number;
  tasksAssignedCount: number;
  tasksByStatus: {
    todo: number;
    in_progress: number;
    done: number;
  };
  upcomingTasks: Array<{
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    project: {
      _id: string;
      name: string;
      color: string;
    };
  }>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardOverview;
}

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.dashboard.getOverview();
      return response.data;
    },
  });
}
