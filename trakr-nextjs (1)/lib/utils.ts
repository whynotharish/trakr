import { Timestamp } from "firebase/firestore";
import { months, Task } from "./constants";

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function linkify(text: string): string {
  return text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function renderText(text: string): string {
  return linkify(esc(text)).replace(/\n/g, "<br>");
}

export function isOverdue(t: Task): boolean {
  return !!(t.dueAt && !t.done && t.dueAt.toDate().getTime() < Date.now());
}

export function isDueSoon(t: Task): boolean {
  if (!t.dueAt || t.done) return false;
  const d = t.dueAt.toDate().getTime() - Date.now();
  return d > 0 && d <= 3600000;
}

export function formatDue(ts: Timestamp): string {
  const d = ts.toDate();
  const n = new Date();
  const tom = new Date(n);
  tom.setDate(tom.getDate() + 1);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === n.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === tom.toDateString()) return `Tomorrow, ${time}`;
  return `${months[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${time}`;
}

export function toLocal(ts?: Timestamp | null): string {
  if (!ts) return "";
  const d = ts.toDate();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function sortByDue(a: Task[]): Task[] {
  return [...a].sort((x, y) => {
    if (!x.dueAt && !y.dueAt) return 0;
    if (!x.dueAt) return 1;
    if (!y.dueAt) return -1;
    return x.dueAt.toDate().getTime() - y.dueAt.toDate().getTime();
  });
}

export function genCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function getNextRecurDate(rDays: string[], refTime?: Timestamp | Date | null): Date {
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayNum = today.getDay();
  const targets = rDays.map((d) => dayMap[d]).filter((n) => n !== undefined).sort((a, b) => a - b);
  if (!targets.length) return new Date();
  let diff: number | null = null;
  for (const t of targets) {
    const d = t - todayNum;
    if (d > 0) {
      diff = d;
      break;
    }
  }
  if (diff === null) diff = 7 - todayNum + targets[0];
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  if (refTime) {
    const rt = refTime instanceof Date ? refTime : refTime.toDate();
    next.setHours(rt.getHours(), rt.getMinutes(), 0, 0);
  } else {
    next.setHours(9, 0, 0, 0);
  }
  return next;
}
