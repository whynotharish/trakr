"use client";

import { useRef, useState } from "react";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { Task, Subtask, Team, tagOptions, priorityOptions, recurDayKeys, recurDayLabels } from "@/lib/constants";
import { getNextRecurDate } from "@/lib/utils";

export default function TaskInput({ team, user, tasks }: { team: Team; user: User; tasks: Task[] }) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("");
  const [tag, setTag] = useState("");
  const [assignee, setAssignee] = useState("");
  const [recurOpen, setRecurOpen] = useState(false);
  const [recurDays, setRecurDays] = useState<string[]>([]);

  const textRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const toggleRecurDay = (key: string) => {
    setRecurDays((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
  };

  const addTask = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const cleanSubtasks = [
      ...subtasks,
      ...(subtaskDraft.trim() ? [{ text: subtaskDraft.trim(), done: false }] : []),
    ].filter((s) => s.text.trim());
    const maxPos = tasks.reduce((m, t) => Math.max(m, t.position || 0), 0);
    const hasRecur = recurDays.length > 0;
    let dueAt: Timestamp | null = null;
    if (due) {
      dueAt = Timestamp.fromDate(new Date(due));
    } else if (hasRecur) {
      dueAt = Timestamp.fromDate(getNextRecurDate(recurDays, null));
    }

    await addDoc(collection(db, "teams", team.id, "tasks"), {
      text: trimmed,
      description: description.trim() || null,
      subtasks: cleanSubtasks.length > 0 ? cleanSubtasks : null,
      tag: tag || null,
      priority: priority || null,
      dueAt,
      assignee: assignee || null,
      done: false,
      recurDays: hasRecur ? [...recurDays] : null,
      createdBy: user.email,
      position: maxPos + 1,
      createdAt: serverTimestamp(),
    });

    setText("");
    setDescription("");
    setSubtasks([]);
    setSubtaskDraft("");
    setDue("");
    setPriority("");
    setTag("");
    setAssignee("");
    setRecurDays([]);
    setRecurOpen(false);
    requestAnimationFrame(() => {
      autoGrow(textRef.current);
      autoGrow(descRef.current);
      textRef.current?.focus();
    });
  };

    return (
    <div className="glow-wrap">
    <div className="input-area">
      <div className="input-main">
        <textarea
          ref={textRef}
          rows={1}
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoGrow(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addTask();
            }
          }}
        />
      </div>
      <textarea
        ref={descRef}
        className="input-desc"
        rows={1}
        placeholder="Add description..."
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          autoGrow(e.target);
        }}
      />
      {subtasks.length > 0 && (
        <ul className="subtask-list">
          {subtasks.map((s, i) => (
            <li key={i} className="subtask-item">
              <div
                className="subtask-check"
                onClick={() => setSubtasks((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <svg viewBox="0 0 10 10" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8" />
                  <line x1="8" y1="2" x2="2" y2="8" />
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
      <div className="input-options">
        <input type="datetime-local" className="opt-datetime" value={due} onChange={(e) => setDue(e.target.value)} />
        <select className="opt-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
          {priorityOptions.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select className="opt-select" value={tag} onChange={(e) => setTag(e.target.value)}>
          {tagOptions.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select className="opt-select" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">Assign to</option>
          {Object.entries(team.members || {}).map(([email, m]) => (
            <option key={email} value={email}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`repeat-btn${recurOpen ? " active" : ""}`}
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
        <span className="spacer" />
        <button className="add-btn" onClick={addTask}>
          Add
        </button>
      </div>
      <div className={`day-picker${recurOpen ? " open" : ""}`}>
        {recurDayKeys.map((key, i) => (
          <button
            key={key}
            type="button"
            className={`day-toggle${recurDays.includes(key) ? " active" : ""}`}
            onClick={() => toggleRecurDay(key)}
          >
            {recurDayLabels[i]}
          </button>
        ))}
            </div>
    </div>
    </div>
  );
}
