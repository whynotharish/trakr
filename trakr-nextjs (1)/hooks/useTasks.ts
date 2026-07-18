"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task } from "@/lib/constants";

export function useTasks(teamId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!teamId) {
      setTasks([]);
      return;
    }
    const q = query(collection(db, "teams", teamId, "tasks"), orderBy("position"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) })));
    });
    return () => unsub();
  }, [teamId]);

  return tasks;
}
