"use client";

import { NewProjectDialog } from "@/components/project/new-project-dialog";
import { ProjectCard } from "@/components/project/project-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/lib/hooks/useProjects";
import { useAuth } from "@/lib/context/AuthContext";
import { AlertCircle, FolderOpen, Users } from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useProjects({ status: "active" });

  // Separate projects into categories
  const myProjects =
    data?.projects.filter((project) => project.owner._id === user?.id) || [];

  const sharedProjects =
    data?.projects.filter((project) => project.owner._id !== user?.id) || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your team projects and collaborate effectively
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load projects
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching projects"}
          </p>
        </div>
      )}

      {/* Projects Content */}
      {!isLoading && !error && data && (
        <>
          {/* Empty State - No Projects at All */}
          {data.projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-6 mb-4">
                <FolderOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No projects yet
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Get started by creating your first project to organize tasks and
                collaborate with your team.
              </p>
              <NewProjectDialog />
            </div>
          ) : (
            <div className="space-y-10">
              {/* My Projects Section */}
              {myProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="h-5 w-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-foreground">
                      My Projects
                    </h2>
                    <Badge variant="secondary">{myProjects.length}</Badge>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                </div>
              )}

              {/* Shared with Me Section */}
              {sharedProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">
                      Shared with Me
                    </h2>
                    <Badge variant="secondary">{sharedProjects.length}</Badge>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sharedProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
