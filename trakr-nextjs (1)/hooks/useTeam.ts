"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Team } from "@/lib/constants";

export function useTeam(teamId: string | null) {
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (!teamId) {
      setTeam(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "teams", teamId), (snap) => {
      if (!snap.exists()) return;
      setTeam({ id: snap.id, ...(snap.data() as Omit<Team, "id">) });
    });
    return () => unsub();
  }, [teamId]);

  return team;
}
