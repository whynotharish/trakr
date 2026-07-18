"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { Task, Member } from "@/lib/constants";
import TaskItem from "./TaskItem";
import { toggleTask, deleteTask, toggleSubtask, addSubtaskToTask, saveTaskEdit, reorderTasks, EditPayload } from "@/lib/taskActions";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "done", label: "Done" },
  { key: "p0", label: "P0" },
  { key: "p1", label: "P1" },
  { key: "mine", label: "Mine" },
  { key: "overdue", label: "Overdue" },
];

const EMPTY_MESSAGES: Record<string, string> = {
  all: "No tasks yet.",
  active: "All caught up!",
  done: "None completed.",
  p0: "No P0 tasks.",
  p1: "No P1 tasks.",
  mine: "Nothing assigned to you.",
  overdue: "Nothing overdue!",
};

const LABELS: Record<string, string> = {
  all: "All tasks",
  active: "Active",
  done: "Completed",
  p0: "P0",
  p1: "P1",
  mine: "My tasks",
  overdue: "Overdue",
};

function isOverdueTask(t: Task) {
  return !!(t.dueAt && !t.done && t.dueAt.toDate().getTime() < Date.now());
}

export default function TaskList({
  teamId,
  tasks,
  members,
  user,
  onToast,
}: {
  teamId: string;
  tasks: Task[];
  members: Record<string, Member>;
  user: User;
  onToast: (m: string) => void;
}) {
  const [filter, setFilter] = useState("active");
  const [dragSrcId, setDragSrcId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const filtered = (() => {
    switch (filter) {
      case "active":
        return tasks.filter((t) => !t.done);
      case "done":
        return tasks.filter((t) => t.done);
      case "p0":
        return tasks.filter((t) => t.priority === "p0" && !t.done);
      case "p1":
        return tasks.filter((t) => t.priority === "p1" && !t.done);
      case "mine":
        return tasks.filter((t) => t.assignee === user.email && !t.done);
      case "overdue":
        return tasks.filter(isOverdueTask);
      default:
        return tasks;
    }
  })();

  const handleDrop = async (targetId: string) => {
    setDragOverId(null);
    if (!dragSrcId || targetId === dragSrcId) return;
    const src = tasks.find((t) => t.id === dragSrcId);
    const target = tasks.find((t) => t.id === targetId);
    if (!src || !target) return;
    await reorderTasks(teamId, src.id, src.position || 0, target.id, target.position || 0);
    setDragSrcId(null);
  };

  return (
    <div className="list-view">
      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="section-label">{LABELS[filter] || "All tasks"}</div>
      <ul className="task-list">
        {filtered.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            members={members}
            onToggle={() => toggleTask(teamId, task, user.email!, tasks).then((created) => created && onToast("Next occurrence created"))}
            onDelete={() => deleteTask(teamId, task.id)}
            onSave={(payload: EditPayload) => saveTaskEdit(teamId, task.id, payload).then(() => onToast("Updated"))}
            onToggleSubtask={(i) => toggleSubtask(teamId, task, i)}
            onAddSubtask={(text) => addSubtaskToTask(teamId, task, text)}
            dragProps={{
              draggable: true,
              onDragStart: () => setDragSrcId(task.id),
              onDragEnd: () => {
                setDragSrcId(null);
                setDragOverId(null);
              },
              onDragOver: (e) => {
                e.preventDefault();
                if (task.id !== dragSrcId) setDragOverId(task.id);
              },
              onDrop: () => handleDrop(task.id),
              dragOver: dragOverId === task.id,
              dragging: dragSrcId === task.id,
            }}
          />
        ))}
      </ul>
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="icon">&#9998;</div>
          <div>{EMPTY_MESSAGES[filter] || EMPTY_MESSAGES.all}</div>
        </div>
      )}
    </div>
  );
}
