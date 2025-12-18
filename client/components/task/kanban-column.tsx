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
  todo: "bg-gray-100 border-gray-300",
  in_progress: "bg-blue-50 border-blue-300",
  done: "bg-green-50 border-green-300",
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
        <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border-2 border-dashed p-3 ${
          statusColors[status as keyof typeof statusColors] || statusColors.todo
        } min-h-[500px]`}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task)}
                onDelete={onTaskDelete}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
