"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Task, useUpdateTask } from "@/lib/hooks/useTasks";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Clock,
  Edit2,
  Save,
  Tag,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TaskComments } from "./task-comments";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
}: TaskDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateTask = useUpdateTask();
  const { user } = useAuthStore();

  const form = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      dueDate: task?.dueDate || "",
    },
  });

  // Reset form values when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [task, form]);

  if (!task) return null;

  const handleSave = async () => {
    const data = form.getValues();
    try {
      await updateTask.mutateAsync({
        id: task._id,
        data,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const toggleSubtask = async (index: number) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[index].isCompleted = !updatedSubtasks[index].isCompleted;

    try {
      await updateTask.mutateAsync({
        id: task._id,
        data: { subtasks: updatedSubtasks },
      });
    } catch (error) {
      console.error("Failed to update subtask:", error);
    }
  };

  const priorityConfig = {
    low: {
      color: "bg-gray-100 text-gray-700 border-gray-300",
      icon: TrendingUp,
    },
    medium: {
      color: "bg-blue-100 text-blue-700 border-blue-300",
      icon: AlertCircle,
    },
    high: {
      color: "bg-orange-100 text-orange-700 border-orange-300",
      icon: Zap,
    },
    urgent: { color: "bg-red-100 text-red-700 border-red-300", icon: Zap },
  };

  const statusConfig = {
    todo: { color: "bg-slate-100 text-slate-700", label: "To Do" },
    in_progress: { color: "bg-blue-100 text-blue-700", label: "In Progress" },
    done: { color: "bg-green-100 text-green-700", label: "Done" },
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const now = new Date();
    const isOverdue = dueDate < now;
    const formattedDate = dueDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return { formattedDate, isOverdue };
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl">
                  {isEditing ? (
                    <Input
                      {...form.register("title")}
                      className="text-xl font-semibold"
                    />
                  ) : (
                    task.title
                  )}
                </SheetTitle>
                <SheetDescription className="mt-1 flex items-center gap-2">
                  <span>Created by {task.createdBy.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </SheetDescription>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Status & Priority Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-4 bg-gray-50/50">
              <h4 className="text-xs font-medium text-gray-500 mb-2">Status</h4>
              {isEditing ? (
                <Select
                  onValueChange={(value) =>
                    form.setValue("status", value as any)
                  }
                  defaultValue={task.status}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  className={`${
                    statusConfig[task.status].color
                  } border font-medium`}
                  variant="outline"
                >
                  {statusConfig[task.status].label}
                </Badge>
              )}
            </div>

            <div className="border rounded-lg p-4 bg-gray-50/50">
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Priority
              </h4>
              {isEditing ? (
                <Select
                  onValueChange={(value) =>
                    form.setValue("priority", value as any)
                  }
                  defaultValue={task.priority}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  className={`${
                    priorityConfig[task.priority].color
                  } border font-medium capitalize`}
                  variant="outline"
                >
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              Description
            </h4>
            {isEditing ? (
              <Textarea
                {...form.register("description")}
                rows={4}
                className="resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {task.description || (
                  <span className="text-gray-400 italic">
                    No description provided
                  </span>
                )}
              </p>
            )}
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Assignee */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 w-24">
                <User className="h-4 w-4" />
                <span>Assignee</span>
              </div>
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {getInitials(task.assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {task.assignee.name}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">Unassigned</span>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 w-24">
                <Calendar className="h-4 w-4" />
                <span>Due Date</span>
              </div>
              {isEditing ? (
                <Input
                  type="date"
                  {...form.register("dueDate")}
                  className="max-w-[200px]"
                />
              ) : task.dueDate ? (
                (() => {
                  const { formattedDate, isOverdue } = formatDueDate(
                    task.dueDate
                  );
                  return (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isOverdue ? "text-red-600" : "text-gray-700"
                        }`}
                      >
                        {formattedDate}
                      </span>
                      {isOverdue && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 text-xs"
                        >
                          Overdue
                        </Badge>
                      )}
                    </div>
                  );
                })()
              ) : (
                <span className="text-sm text-gray-400 italic">
                  No due date
                </span>
              )}
            </div>

            {/* Created */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 w-24">
                <Clock className="h-4 w-4" />
                <span>Created</span>
              </div>
              <span className="text-sm text-gray-700">
                {new Date(task.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Subtasks
                  <span className="text-xs font-normal text-gray-500">
                    ({task.subtasks.filter((s) => s.isCompleted).length}/
                    {task.subtasks.length})
                  </span>
                </h4>
                <div className="space-y-2">
                  {task.subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        checked={subtask.isCompleted}
                        onCheckedChange={() => toggleSubtask(index)}
                      />
                      <span
                        className={`text-sm flex-1 ${
                          subtask.isCompleted
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Comments Section */}
          {user && (
            <>
              <Separator />
              <TaskComments taskId={task._id} currentUserId={user.id} />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
