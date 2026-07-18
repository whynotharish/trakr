"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { Task, Member, tagKeys, tagLabelsMap, tagColors } from "@/lib/constants";
import { sortByDue } from "@/lib/utils";
import { DueMeta, PrioMeta, AssigneeMeta, RecurMeta, SubtaskCountMeta } from "./TaskMeta";
import { toggleTask, deleteTask, moveTaskToTag } from "@/lib/taskActions";

export default function KanbanBoard({
  teamId,
  tasks,
  members,
  user,
  onToast,
  onEditRequest,
}: {
  teamId: string;
  tasks: Task[];
  members: Record<string, Member>;
  user: User;
  onToast: (m: string) => void;
  onEditRequest: (id: string) => void;
}) {
  const [dragSrcId, setDragSrcId] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const columns: (string | null)[] = [...tagKeys, null];

  return (
    <div className="kanban-view">
      <div className="kanban-board">
        {columns.map((tagKey) => {
          const colTasks = sortByDue(tasks.filter((t) => (t.tag || null) === tagKey));
          if (!colTasks.length) return null;
          const label = tagKey ? tagLabelsMap[tagKey as keyof typeof tagLabelsMap] : "Untagged";
          const color = tagKey ? tagColors[tagKey as keyof typeof tagColors] : "#8A8580";
          const colId = tagKey || "__none";
          return (
            <div key={colId} className="kanban-col">
              <div className="kanban-col-header">
                <div className="col-label">
                  <div className="col-dot" style={{ background: color }} />
                  <span className="kanban-col-title">{label}</span>
                </div>
                <span className="kanban-col-count">{colTasks.length}</span>
              </div>
              <ul
                className={`kanban-cards${dragOverCol === colId ? " drag-over-col" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!dragOverCardId) setDragOverCol(colId);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null);
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  setDragOverCardId(null);
                  if (!dragSrcId) return;
                  await moveTaskToTag(teamId, dragSrcId, tagKey);
                  onToast(`Moved to ${tagKey ? tagLabelsMap[tagKey as keyof typeof tagLabelsMap] : "Untagged"}`);
                  setDragSrcId(null);
                }}
              >
                {colTasks.map((task) => (
                  <li
                    key={task.id}
                    className={`kanban-card${task.done ? " done" : ""}${dragOverCardId === task.id ? " drag-over" : ""}${
                      dragSrcId === task.id ? " dragging" : ""
                    }`}
                    draggable
                    onDragStart={() => setDragSrcId(task.id)}
                    onDragEnd={() => {
                      setDragSrcId(null);
                      setDragOverCardId(null);
                      setDragOverCol(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (task.id !== dragSrcId) setDragOverCardId(task.id);
                    }}
                  >
                    <div className="k-card-top">
                      <div
                        className="k-card-check"
                        onClick={() =>
                          toggleTask(teamId, task, user.email!, tasks).then((created) => created && onToast("Next occurrence created"))
                        }
                      >
                        <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <polyline points="2,5 4,7 8,3" />
                        </svg>
                      </div>
                      <span className="k-card-name">{task.text}</span>
                      <div className="k-card-actions">
                        <button onClick={() => onEditRequest(task.id)}>
                          <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11.5 2.5l2 2-8 8H3.5v-2z" />
                            <path d="M9.5 4.5l2 2" />
                          </svg>
                        </button>
                        <button onClick={() => deleteTask(teamId, task.id)}>
                          <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.5" strokeLinecap="round">
                            <line x1="4" y1="4" x2="12" y2="12" />
                            <line x1="12" y1="4" x2="4" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="k-card-meta">
                      <DueMeta task={task} />
                      <PrioMeta task={task} />
                      <AssigneeMeta task={task} members={members} />
                      <RecurMeta task={task} />
                      <SubtaskCountMeta task={task} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
