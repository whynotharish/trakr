"use client";

import { useState } from "react";
import { addDoc, collection, doc, query, updateDoc, where, getDocs } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { genCode } from "@/lib/utils";

export default function TeamSetup({
  user,
  onTeamReady,
}: {
  user: User;
  onTeamReady: (teamId: string) => void;
}) {
  const [newTeamName, setNewTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const firstName = (user.displayName || "there").split(" ")[0];

  const createTeam = async () => {
    const name = newTeamName.trim();
    if (!name) return setError("Enter a team name");
    const code = genCode();
    const ref = await addDoc(collection(db, "teams"), {
      name,
      inviteCode: code,
      createdBy: user.uid,
      members: {
        [user.email!]: { name: user.displayName, avatar: user.photoURL, role: "admin" },
      },
    });
    await updateDoc(doc(db, "users", user.uid), { teamId: ref.id });
    onTeamReady(ref.id);
  };

  const joinTeam = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return setError("Enter an invite code");
    const q = query(collection(db, "teams"), where("inviteCode", "==", code));
    const snap = await getDocs(q);
    if (snap.empty) return setError("Invalid invite code");
    const teamDoc = snap.docs[0];
    await updateDoc(teamDoc.ref, {
      [`members.${user.email}`]: { name: user.displayName, avatar: user.photoURL, role: "member" },
    });
    await updateDoc(doc(db, "users", user.uid), { teamId: teamDoc.id });
    onTeamReady(teamDoc.id);
  };

  const skipTeam = async () => {
    const code = genCode();
    const ref = await addDoc(collection(db, "teams"), {
      name: `${firstName}'s Tasks`,
      inviteCode: code,
      createdBy: user.uid,
      personal: true,
      members: {
        [user.email!]: { name: user.displayName, avatar: user.photoURL, role: "admin" },
      },
    });
    await updateDoc(doc(db, "users", user.uid), { teamId: ref.id });
    onTeamReady(ref.id);
  };

  return (
    <div className="team-view active">
      <div className="team-card">
        <div className="logo">
          Trakr<span className="logo-dot" />
        </div>
        <p>Hey {firstName}! Create a team or join one.</p>
        {error && (
          <p style={{ color: "var(--overdue)", fontSize: 12, marginTop: -12, marginBottom: 12 }}>{error}</p>
        )}
        <h2>Create Team</h2>
        <input
          className="team-input"
          placeholder="Team name (e.g. Marketing)"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
        />
        <button className="team-btn" onClick={createTeam}>
          Create Team
        </button>
        <div className="divider">or</div>
        <h2>Join Team</h2>
        <input
          className="team-input"
          placeholder="Enter invite code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <button className="team-btn secondary" onClick={joinTeam}>
          Join Team
        </button>
        <div className="divider">or</div>
        <button className="team-btn secondary" onClick={skipTeam}>
          Use individually
        </button>
        <p style={{ fontSize: 11, marginBottom: 0, marginTop: 4 }}>You can always invite others later</p>
      </div>
    </div>
  );
}
