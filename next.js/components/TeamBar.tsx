"use client";

import { Team } from "@/lib/constants";

export default function TeamBar({
  team,
  onInvite,
  onSignOut,
}: {
  team: Team;
  onInvite: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="team-bar">
      <span className="team-name-pill">{team.name}</span>
      <div className="member-avatars">
        {Object.entries(team.members || {}).map(([email, m]) =>
          m.avatar ? (
            <img key={email} className="member-av" src={m.avatar} title={m.name} alt={m.name} />
          ) : (
            <div key={email} className="member-av" title={m.name}>
              {m.name[0]}
            </div>
          )
        )}
      </div>
      <button className="invite-btn" onClick={onInvite}>
        + Invite
      </button>
      <div className="user-menu">
        <button className="signout-btn" onClick={onSignOut}>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 2.5a6 6 0 1 0 4 0" />
            <line x1="8" y1="1" x2="8" y2="7" />
          </svg>{" "}
          Sign out
        </button>
      </div>
    </div>
  );
}
