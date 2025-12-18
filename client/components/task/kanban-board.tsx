import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { Task, useReorderTask, useDeleteTask } from "@/lib/hooks/useTasks";
import { toast } from "sonner";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const reorderTask = useReorderTask();
  const deleteTask = useDeleteTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;

    // Check if dropped over a column
    const newStatus = columns.find((col) => col.id === overId)?.id;

    if (newStatus) {
      // Dropped in a new column
      const tasksInNewStatus = getTasksByStatus(newStatus);
      const newOrder = tasksInNewStatus.length;

      if (activeTask.status !== newStatus) {
        // Moving to different column
        reorderTask.mutate({
          id: activeTask._id,
          status: newStatus,
          order: newOrder,
        });
      }
    } else {
      // Dropped over another task
      const overTask = tasks.find((t) => t._id === overId);
      if (!overTask) return;

      if (activeTask.status === overTask.status) {
        // Reordering within same column
        const tasksInColumn = getTasksByStatus(activeTask.status);
        const oldIndex = tasksInColumn.findIndex(
          (t) => t._id === activeTask._id
        );
        const newIndex = tasksInColumn.findIndex((t) => t._id === overTask._id);

        if (oldIndex !== newIndex) {
          reorderTask.mutate({
            id: activeTask._id,
            status: activeTask.status,
            order: newIndex,
          });
        }
      } else {
        // Moving to different column at specific position
        const tasksInNewColumn = getTasksByStatus(overTask.status);
        const newIndex = tasksInNewColumn.findIndex(
          (t) => t._id === overTask._id
        );

        reorderTask.mutate({
          id: activeTask._id,
          status: overTask.status,
          order: newIndex,
        });
      }
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task. Please try again.");
      console.error("Delete task error:", error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            status={column.id}
            tasks={getTasksByStatus(column.id)}
            onTaskClick={onTaskClick}
            onTaskDelete={handleTaskDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80">
            <TaskCard
              task={activeTask}
              onClick={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
