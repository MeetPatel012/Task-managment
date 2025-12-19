"use client";

import { useState } from "react";
import { Project, useRemoveMember } from "@/lib/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddMemberDialog } from "./add-member-dialog";
import { Users, X } from "lucide-react";
import { toast } from "sonner";

interface ProjectMembersProps {
  project: Project;
  canManageMembers: boolean;
}

const roleColors = {
  owner: "bg-purple-500",
  manager: "bg-blue-500",
  member: "bg-green-500",
  viewer: "bg-gray-500",
};

export function ProjectMembers({
  project,
  canManageMembers,
}: ProjectMembersProps) {
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
  const removeMember = useRemoveMember();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    setMemberToRemove({ userId, userName });
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMember.mutateAsync({
        projectId: project._id,
        userId: memberToRemove.userId,
      });
      toast.success(`${memberToRemove.userName} removed from project`);
    } catch (error) {
      toast.error("Failed to remove member. Please try again.");
      console.error("Remove member error:", error);
    } finally {
      setMemberToRemove(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Members
            </CardTitle>
            {canManageMembers && (
              <AddMemberDialog projectId={project._id} project={project} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Members - Show owner badge for project owner */}
            {project.members.map((member) => {
              const isOwner = member.user._id === project.owner._id;

              return (
                <div
                  key={member.user._id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={
                          isOwner
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <Badge className="bg-purple-500 text-white">Owner</Badge>
                    )}
                    {!isOwner && (
                      <Badge
                        className={`${
                          roleColors[member.role as keyof typeof roleColors] ||
                          roleColors.member
                        } text-white`}
                      >
                        {member.role}
                      </Badge>
                    )}
                    {canManageMembers && !isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          handleRemoveMember(member.user._id, member.user.name)
                        }
                        disabled={removeMember.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {project.members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">No additional members yet</p>
                {canManageMembers && (
                  <p className="text-xs mt-1">
                    Add members to collaborate on this project
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.userName} from
              this project? They will lose access to all project tasks and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
