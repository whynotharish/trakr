"use client";

export default function StatsRow({ active, done, overdue }: { active: number; done: number; overdue: number }) {
  return (
    <div className="stats-row">
      <div className="stat-pill">
        <strong>{active}</strong> active
      </div>
      <div className="stat-pill">
        <strong>{done}</strong> done
      </div>
      {overdue > 0 && (
        <div className="stat-pill has-overdue">
          <strong>{overdue}</strong> overdue
        </div>
      )}
    </div>
  );
}
