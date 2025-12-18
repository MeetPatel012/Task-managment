"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useProjects } from "@/lib/hooks/useProjects";
import { ProjectCard } from "@/components/project/project-card";
import { NewProjectDialog } from "@/components/project/new-project-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FolderOpen, Users } from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuthStore();
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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load projects
          </h3>
          <p className="text-gray-600 text-center max-w-md">
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
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <FolderOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
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
                    <h2 className="text-xl font-semibold text-gray-900">
                      My Projects
                    </h2>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      {myProjects.length}
                    </Badge>
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
                    <Users className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Shared with Me
                    </h2>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {sharedProjects.length}
                    </Badge>
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

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
