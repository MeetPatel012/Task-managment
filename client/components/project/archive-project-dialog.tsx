"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProject } from "@/lib/hooks/useProjects";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ArchiveProjectDialogProps {
  projectId: string;
  projectName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ArchiveProjectDialog({
  projectId,
  projectName,
  onSuccess,
  trigger,
}: ArchiveProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deleteProject = useDeleteProject();

  const handleArchive = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      setOpen(false);

      // Call onSuccess callback or redirect to projects list
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/projects");
      }
    } catch (error) {
      alert("Failed to archive project. Please try again.");
      console.error("Archive project error:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Archive Project
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Project?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive <strong>{projectName}</strong>?
            This will hide it from active project lists. You can restore it
            later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={deleteProject.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteProject.isPending ? "Archiving..." : "Archive Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
