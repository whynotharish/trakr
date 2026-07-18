import { addDoc, collection, deleteDoc, doc, serverTimestamp, Timestamp, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { Task, Subtask } from "./constants";
import { getNextRecurDate } from "./utils";

export function taskRef(teamId: string, id: string) {
  return doc(db, "teams", teamId, "tasks", id);
}

export async function toggleTask(teamId: string, task: Task, userEmail: string, allTasks: Task[]) {
  await updateDoc(taskRef(teamId, task.id), { done: !task.done });
  if (!task.done && task.recurDays && task.recurDays.length > 0) {
    const nextDate = getNextRecurDate(task.recurDays, task.dueAt ?? null);
    const maxPos = allTasks.reduce((m, t) => Math.max(m, t.position || 0), 0);
    await addDoc(collection(db, "teams", teamId, "tasks"), {
      text: task.text,
      description: task.description || null,
      tag: task.tag || null,
      priority: task.priority || null,
      dueAt: Timestamp.fromDate(nextDate),
      assignee: task.assignee || null,
      recurDays: task.recurDays,
      subtasks: task.subtasks ? task.subtasks.map((s) => ({ text: s.text, done: false })) : null,
      done: false,
      createdBy: userEmail,
      position: maxPos + 1,
      createdAt: serverTimestamp(),
    });
    return true; // signals "next occurrence created"
  }
  return false;
}

export async function deleteTask(teamId: string, id: string) {
  await deleteDoc(taskRef(teamId, id));
}

export async function toggleSubtask(teamId: string, task: Task, index: number) {
  if (!task.subtasks) return;
  const updated = task.subtasks.map((s, i) => (i === index ? { ...s, done: !s.done } : { ...s }));
  await updateDoc(taskRef(teamId, task.id), { subtasks: updated });
}

export async function addSubtaskToTask(teamId: string, task: Task, text: string) {
  const subs: Subtask[] = task.subtasks ? [...task.subtasks] : [];
  subs.push({ text, done: false });
  await updateDoc(taskRef(teamId, task.id), { subtasks: subs });
}

export interface EditPayload {
  text: string;
  description: string;
  dueValue: string; // datetime-local value or ""
  priority: string;
  tag: string;
  assignee: string;
  recurDays: string[];
  subtasks: Subtask[];
}

export async function saveTaskEdit(teamId: string, id: string, payload: EditPayload) {
  const cleanSubs = payload.subtasks.filter((s) => s.text.trim()).map((s) => ({ text: s.text.trim(), done: s.done }));
  await updateDoc(taskRef(teamId, id), {
    text: payload.text,
    description: payload.description || null,
    dueAt: payload.dueValue ? Timestamp.fromDate(new Date(payload.dueValue)) : null,
    priority: payload.priority || null,
    tag: payload.tag || null,
    assignee: payload.assignee || null,
    recurDays: payload.recurDays.length > 0 ? payload.recurDays : null,
    subtasks: cleanSubs.length > 0 ? cleanSubs : null,
  });
}

export async function reorderTasks(teamId: string, srcId: string, srcPos: number, targetId: string, targetPos: number) {
  const batch = writeBatch(db);
  batch.update(taskRef(teamId, srcId), { position: targetPos });
  batch.update(taskRef(teamId, targetId), { position: srcPos });
  await batch.commit();
}

export async function moveTaskToTag(teamId: string, id: string, tag: string | null) {
  await updateDoc(taskRef(teamId, id), { tag });
}
