"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null | undefined>(undefined); // undefined = not checked yet

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setTeamId(null);
        setLoading(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists() && snap.data().teamId) {
        setTeamId(snap.data().teamId);
      } else {
        await setDoc(
          doc(db, "users", u.uid),
          { email: u.email, name: u.displayName, avatar: u.photoURL, teamId: null },
          { merge: true }
        );
        setTeamId(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Sign-in failed:", err);
      throw err;
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const setUserTeamId = (id: string) => setTeamId(id);

  return { user, loading, teamId, signIn, logOut, setUserTeamId };
}
