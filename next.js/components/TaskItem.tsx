"use client";

import { useState } from "react";
import { Task, Member, Subtask, tagLabelsMap, tagOptions, priorityOptions, recurDayKeys, recurDayLabels } from "@/lib/constants";
import { renderText, toLocal } from "@/lib/utils";
import { DueMeta, PrioMeta, AssigneeMeta, RecurMeta, SubtaskCountMeta, TagBadge } from "./TaskMeta";
import { EditPayload } from "@/lib/taskActions";

interface Props {
  task: Task;
  members: Record<string, Member>;
  onToggle: () => void;
  onDelete: () => void;
  onSave: (payload: EditPayload) => void;
  onToggleSubtask: (index: number) => void;
  onAddSubtask: (text: string) => void;
  dragProps: {
    draggable: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    dragOver: boolean;
    dragging: boolean;
  };
}

export default function TaskItem({ task, members, onToggle, onDelete, onSave, onToggleSubtask, onAddSubtask, dragProps }: Props) {
  const [editing, setEditing] = useState(false);
  const [addSubtaskDraft, setAddSubtaskDraft] = useState("");

  const meta = [
    <DueMeta key="due" task={task} />,
    <PrioMeta key="prio" task={task} />,
    <AssigneeMeta key="assignee" task={task} members={members} />,
    <RecurMeta key="recur" task={task} />,
    <SubtaskCountMeta key="sub" task={task} />,
    task.tag ? <TagBadge key="tag" tag={task.tag} label={tagLabelsMap[task.tag] || task.tag} /> : null,
  ].filter(Boolean);

  const hasDetails = task.description || (task.subtasks && task.subtasks.length);

  if (editing) {
    return (
      <EditForm
        task={task}
        members={members}
        onCancel={() => setEditing(false)}
        onDelete={onDelete}
        onSave={(payload) => {
          onSave(payload);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <li
      className={`task-item${task.done ? " done" : ""}${dragProps.dragOver ? " drag-over" : ""}${dragProps.dragging ? " dragging" : ""}`}
      draggable={dragProps.draggable}
      onDragStart={dragProps.onDragStart}
      onDragEnd={dragProps.onDragEnd}
      onDragOver={dragProps.onDragOver}
      onDrop={dragProps.onDrop}
    >
      <div className="drag-handle">
        <span />
        <span />
        <span />
      </div>
      <div className="checkbox" onClick={onToggle}>
        <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <polyline points="2.5,6 5,8.5 9.5,3.5" />
        </svg>
      </div>
      <div className="task-content" onClick={() => setEditing(true)}>
        <div className="task-name" dangerouslySetInnerHTML={{ __html: renderText(task.text) }} />
        {meta.length > 0 && <div className="task-meta">{meta}</div>}
        {hasDetails ? (
          <div className="task-expand" onClick={(e) => e.stopPropagation()}>
            {task.description && (
              <div className="task-desc" dangerouslySetInnerHTML={{ __html: renderText(task.description) }} />
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <ul className="subtask-list">
                {task.subtasks.map((s, i) => (
                  <li key={i} className={`subtask-item${s.done ? " done" : ""}`}>
                    <div className={`subtask-check${s.done ? " done" : ""}`} onClick={() => onToggleSubtask(i)}>
                      <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <polyline points="2,5 4,7 8,3" />
                      </svg>
                    </div>
                    <span className="subtask-text">{s.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="subtask-add">
              <input
                type="text"
                placeholder="Add subtask..."
                value={addSubtaskDraft}
                onChange={(e) => setAddSubtaskDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = addSubtaskDraft.trim();
                    if (v) {
                      onAddSubtask(v);
                      setAddSubtaskDraft("");
                    }
                  }
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
      <div className="task-actions">
        <button className="edit-btn" onClick={() => setEditing(true)}>
          <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11.5 2.5l2 2-8 8H3.5v-2z" />
            <path d="M9.5 4.5l2 2" />
          </svg>
        </button>
        <button className="delete-btn" onClick={onDelete}>
          <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>
      </div>
    </li>
  );
}

function EditForm({
  task,
  members,
  onCancel,
  onDelete,
  onSave,
}: {
  task: Task;
  members: Record<string, Member>;
  onCancel: () => void;
  onDelete: () => void;
  onSave: (payload: EditPayload) => void;
}) {
  const [text, setText] = useState(task.text);
  const [description, setDescription] = useState(task.description || "");
  const [due, setDue] = useState(toLocal(task.dueAt));
  const [priority, setPriority] = useState(task.priority || "");
  const [tag, setTag] = useState(task.tag || "");
  const [assignee, setAssignee] = useState(task.assignee || "");
  const [recurOpen, setRecurOpen] = useState(!!(task.recurDays && task.recurDays.length));
  const [recurDays, setRecurDays] = useState<string[]>(task.recurDays ? [...task.recurDays] : []);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks ? task.subtasks.map((s) => ({ ...s })) : []);
  const [subtaskDraft, setSubtaskDraft] = useState("");

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave({
      text: trimmed,
      description: description.trim(),
      dueValue: due,
      priority,
      tag,
      assignee,
      recurDays,
      subtasks,
    });
  };

  return (
    <li className="task-item editing">
      <div className="edit-form">
        <textarea
          className="edit-text"
          rows={1}
          value={text}
          autoFocus
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
            if (e.key === "Escape") onCancel();
          }}
        />
        <textarea
          className="edit-desc"
          rows={1}
          placeholder="Add description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="edit-subtask-list">
          {subtasks.map((s, i) => (
            <div key={i} className="edit-subtask-item">
              <input
                type="text"
                value={s.text}
                onChange={(e) =>
                  setSubtasks((prev) => prev.map((p, idx) => (idx === i ? { ...p, text: e.target.value } : p)))
                }
              />
              <button
                className="edit-subtask-remove"
                onClick={() => setSubtasks((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <svg viewBox="0 0 12 12" fill="none" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="3" y1="3" x2="9" y2="9" />
                  <line x1="9" y1="3" x2="3" y2="9" />
                </svg>
              </button>
            </div>
          ))}
          <div className="subtask-add">
            <input
              type="text"
              placeholder="Add subtask..."
              value={subtaskDraft}
              onChange={(e) => setSubtaskDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = subtaskDraft.trim();
                  if (v) {
                    setSubtasks((prev) => [...prev, { text: v, done: false }]);
                    setSubtaskDraft("");
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="edit-form-options">
          <input type="datetime-local" className="opt-datetime edit-due" value={due} onChange={(e) => setDue(e.target.value)} />
          <select className="opt-select edit-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {priorityOptions.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <select className="opt-select edit-tag" value={tag} onChange={(e) => setTag(e.target.value)}>
            {tagOptions.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <select className="opt-select edit-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Assign to</option>
            {Object.entries(members).map(([email, m]) => (
              <option key={email} value={email}>
                {m.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`repeat-btn edit-repeat-btn${recurOpen ? " active" : ""}`}
            onClick={() => {
              const next = !recurOpen;
              setRecurOpen(next);
              if (!next) setRecurDays([]);
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 8a6 6 0 0111.3-2.8M14 8a6 6 0 01-11.3 2.8" />
              <path d="M14 2v4h-4M2 14v-4h4" />
            </svg>
            Repeat
          </button>
          <div className="edit-form-actions">
            <button className="delete-btn" style={{ opacity: 0.5, marginRight: "auto" }} title="Delete task" onClick={onDelete}>
              <svg viewBox="0 0 16 16" fill="none" stroke="var(--overdue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4h12M5.3 4V2.7a1 1 0 011-1h3.4a1 1 0 011 1V4M6.5 7v4.5M9.5 7v4.5" />
                <path d="M3.5 4l.7 8.3a1.5 1.5 0 001.5 1.4h4.6a1.5 1.5 0 001.5-1.4l.7-8.3" />
              </svg>
            </button>
            <button className="edit-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="edit-save-btn" onClick={save}>
              Save
            </button>
          </div>
        </div>
        <div className={`day-picker edit-day-picker${recurOpen ? " open" : ""}`}>
          {recurDayKeys.map((key, i) => (
            <button
              key={key}
              type="button"
              className={`day-toggle${recurDays.includes(key) ? " active" : ""}`}
              onClick={() =>
                setRecurDays((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]))
              }
            >
              {recurDayLabels[i]}
            </button>
          ))}
        </div>
      </div>
    </li>
  );
}
