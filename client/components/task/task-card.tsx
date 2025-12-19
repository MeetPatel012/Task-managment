"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Calendar, GripVertical, Trash2, MessageSquare } from "lucide-react";
import { Task } from "@/lib/hooks/useTasks";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  low: "bg-slate-500/90 text-white border-slate-400/50",
  medium: "bg-blue-500/90 text-white border-blue-400/50",
  high: "bg-amber-500/90 text-white border-amber-400/50",
  urgent: "bg-red-500/90 text-white border-red-400/50",
};

const priorityDotColors = {
  low: "bg-slate-400",
  medium: "bg-blue-400",
  high: "bg-amber-400",
  urgent: "bg-red-400",
};

export function TaskCard({ task, onClick, onDelete }: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(task._id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "group cursor-pointer transition-all duration-200",
          "bg-card/50 backdrop-blur-sm border-border/50",
          "hover:bg-card hover:border-border hover:shadow-md hover:shadow-primary/5",
          "active:scale-[0.98]",
          isDragging && "ring-2 ring-primary/20"
        )}
        onClick={onClick}
      >
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "mt-1.5 h-2 w-2 rounded-full shrink-0",
                    priorityDotColors[task.priority]
                  )}
                />
                <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                  {task.title}
                </h4>
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-4">
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pl-4">
            <Badge
              variant="secondary"
              className={cn(
                priorityColors[task.priority],
                "text-[10px] font-semibold capitalize px-2 py-0.5 border shadow-sm"
              )}
            >
              {task.priority}
            </Badge>
            {task.tags && task.tags.length > 0 && (
              <>
                {task.tags.slice(0, 2).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-[10px] bg-primary/5 text-primary border-primary/20 px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50 pl-4">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {task.commentsCount > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="font-medium">{task.commentsCount}</span>
                </div>
              )}

              {task.assignee ? (
                <Avatar className="h-7 w-7 ring-2 ring-background">
                  <AvatarFallback className="text-[10px] font-semibold bg-primary text-primary-foreground">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-7 w-7 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-[8px] text-muted-foreground/50 font-medium">
                    ?
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
