import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { Task } from "@/lib/hooks/useTasks";

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const statusColors = {
  todo: "bg-muted/30 border-border/50",
  in_progress: "bg-blue-500/10 border-blue-500/30",
  under_review: "bg-yellow-500/10 border-yellow-500/30",
  done: "bg-green-500/10 border-green-500/30",
};

export function KanbanColumn({
  title,
  status,
  tasks,
  onTaskClick,
  onTaskDelete,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">
          {title}
        </h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border-2 border-dashed p-4 ${
          statusColors[status as keyof typeof statusColors] || statusColors.todo
        } min-h-[600px] transition-colors`}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground/50">
                <p className="text-xs">No tasks</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onDelete={onTaskDelete}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
