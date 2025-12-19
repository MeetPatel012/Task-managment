"use client";

import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Project } from "@/lib/hooks/useProjects";
import { Users, Calendar, CheckCircle2 } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

const roleColors = {
  owner: "bg-purple-500",
  manager: "bg-blue-500",
  member: "bg-green-500",
  viewer: "bg-gray-500",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useAuthStore();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine user's role in this project
  const isOwner = project.owner._id === user?.id;
  const memberRole = project.members.find((m) => m.user._id === user?.id)?.role;
  const userRole = isOwner ? "owner" : memberRole || "viewer";

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link href={`/projects/${project._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color || "#3b82f6" }}
                />
                <h3 className="font-semibold text-lg line-clamp-1">
                  {project.name}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description || "No description"}
              </p>
            </div>
            <Badge
              className={`${
                roleColors[userRole as keyof typeof roleColors]
              } text-white flex-shrink-0`}
            >
              {userRole.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Owner Info */}
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                {getInitials(project.owner.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">
              {isOwner ? "You" : project.owner.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{project.members.length}</span>
            </div>

            {project.dueDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">{formatDate(project.dueDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
