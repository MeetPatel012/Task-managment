"use client";

import { use, useState } from "react";
import { useProject } from "@/lib/hooks/useProjects";
import { useProjectTasks } from "@/lib/hooks/useTasks";
import { useAuth } from "@/lib/context/AuthContext";
import { KanbanBoard } from "@/components/task/kanban-board";
import { NewTaskDialog } from "@/components/task/new-task-dialog";
import { TaskDetailSheet } from "@/components/task/task-detail-sheet";
import { EditProjectDialog } from "@/components/project/edit-project-dialog";
import { ArchiveProjectDialog } from "@/components/project/archive-project-dialog";
import { ProjectMembers } from "@/components/project/project-members";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Task } from "@/lib/hooks/useTasks";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId);
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
  } = useProjectTasks(projectId);

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];

  // Check if user can edit project (owner or manager)
  const canEditProject =
    user &&
    project &&
    (project.owner._id === user.id ||
      project.members.some(
        (member: { user: { _id: string }; role: string }) =>
          member.user._id === user.id &&
          (member.role === "owner" || member.role === "manager")
      ));

  if (projectLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[500px]" />
          ))}
        </div>
      </div>
    );
  }

  if (projectError || tasksError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Failed to load project
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          {projectError instanceof Error
            ? projectError.message
            : "An error occurred"}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Project not found
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              {project.name}
            </h1>
            <Badge
              variant={project.status === "active" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground max-w-3xl">
              {project.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{project.members.length} members</span>
            {project.dueDate && (
              <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {canEditProject && (
            <>
              <EditProjectDialog project={project} />
              <ArchiveProjectDialog
                projectId={project._id}
                projectName={project.name}
              />
            </>
          )}
          <NewTaskDialog projectId={projectId} project={project} />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-card rounded-lg border p-6">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-6 mb-4">
              <svg
                className="h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No tasks yet
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Get started by creating your first task for this project.
            </p>
            <NewTaskDialog projectId={projectId} project={project} />
          </div>
        ) : (
          <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />
        )}
      </div>

      {/* Project Members */}
      <ProjectMembers project={project} canManageMembers={!!canEditProject} />

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
