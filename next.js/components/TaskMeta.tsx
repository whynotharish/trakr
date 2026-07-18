"use client";

import { Task, Member, recurDayNames } from "@/lib/constants";
import { isOverdue, isDueSoon, formatDue } from "@/lib/utils";

export function DueMeta({ task }: { task: Task }) {
  if (!task.dueAt) return null;
  const cls = isOverdue(task) ? " overdue" : isDueSoon(task) ? " due-soon" : "";
  return (
    <span className={`task-due${cls}`}>
      <svg viewBox="0 0 12 12" fill="none" strokeWidth="1.3">
        <circle cx="6" cy="6" r="4.5" />
        <path d="M6 3.5V6l2 1.5" />
      </svg>
      {formatDue(task.dueAt)}
    </span>
  );
}

export function PrioMeta({ task }: { task: Task }) {
  if (!task.priority) return null;
  return <span className={`priority-badge ${task.priority}`}>{task.priority.toUpperCase()}</span>;
}

export function AssigneeMeta({ task, members }: { task: Task; members: Record<string, Member> }) {
  if (!task.assignee) return null;
  const m = members[task.assignee];
  if (!m) return <span className="assignee-badge">{task.assignee}</span>;
  return (
    <span className="assignee-badge">
      {m.avatar && <img src={m.avatar} alt="" />}
      {m.name.split(" ")[0]}
    </span>
  );
}

export function RecurMeta({ task }: { task: Task }) {
  if (!task.recurDays || !task.recurDays.length) return null;
  const label = task.recurDays.map((d) => recurDayNames[d] || d).join(", ");
  return (
    <span className="recur-badge">
      <svg viewBox="0 0 16 16" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 8a6 6 0 0111.3-2.8M14 8a6 6 0 01-11.3 2.8" />
        <path d="M14 2v4h-4M2 14v-4h4" />
      </svg>
      {label}
    </span>
  );
}

export function SubtaskCountMeta({ task }: { task: Task }) {
  if (!task.subtasks || !task.subtasks.length) return null;
  const done = task.subtasks.filter((s) => s.done).length;
  return (
    <span className="subtask-count">
      <svg viewBox="0 0 12 12" strokeWidth="1.3">
        <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" />
        <polyline points="3.5,6 5.5,8 8.5,4" fill="none" />
      </svg>
      {done}/{task.subtasks.length}
    </span>
  );
}

export function TagBadge({ tag, label }: { tag: string; label: string }) {
  return <span className={`task-tag ${tag}`}>{label}</span>;
}
