"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTeam } from "@/hooks/useTeam";
import { useTasks } from "@/hooks/useTasks";
import { useTheme } from "@/hooks/useTheme";
import AuthView from "@/components/AuthView";
import TeamSetup from "@/components/TeamSetup";
import Header from "@/components/Header";
import TeamBar from "@/components/TeamBar";
import StatsRow from "@/components/StatsRow";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import KanbanBoard from "@/components/KanbanBoard";
import InviteModal from "@/components/InviteModal";
import Toast from "@/components/Toast";
import { days, months } from "@/lib/constants";
import { isOverdue } from "@/lib/utils";

export default function Home() {
  const { user, loading, teamId, signIn, logOut, setUserTeamId } = useAuth();
  const team = useTeam(teamId ?? null);
  const tasks = useTasks(team?.id ?? null);
  const theme = useTheme();

  const [view, setView] = useState<"list" | "kanban">("list");
  const [notifsOn, setNotifsOn] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("trakr_view");
    if (stored === "kanban" || stored === "list") setView(stored);
    setNotifsOn(localStorage.getItem("trakr_notif") === "true");
    try {
      setNotifiedIds(new Set(JSON.parse(localStorage.getItem("trakr_notified") || "[]")));
    } catch {
      /* ignore */
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2500);
  }, []);

  const toggleView = () => {
    const next = view === "kanban" ? "list" : "kanban";
    setView(next);
    localStorage.setItem("trakr_view", next);
  };

  useEffect(() => {
    document.body.classList.toggle("kanban-mode", view === "kanban");
  }, [view]);

  const toggleNotifs = async () => {
    if (!notifsOn) {
      if (!("Notification" in window)) return showToast("Not supported");
      const p = await Notification.requestPermission();
      if (p === "granted") {
        setNotifsOn(true);
        localStorage.setItem("trakr_notif", "true");
        showToast("Alerts on");
      } else {
        showToast("Permission denied");
      }
    } else {
      setNotifsOn(false);
      localStorage.setItem("trakr_notif", "false");
      showToast("Alerts off");
    }
  };

  useEffect(() => {
    if (!notifsOn) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const fiveMin = 300000;
      const newlyNotified: string[] = [];
      tasks.forEach((t) => {
        if (t.done || !t.dueAt || notifiedIds.has(t.id)) return;
        const diff = t.dueAt.toDate().getTime() - now;
        if (diff <= fiveMin && diff > -fiveMin) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`${t.priority ? t.priority.toUpperCase() + ": " : ""}${t.text}`, {
              body: diff > 0 ? "Due in < 5 min" : "Overdue",
              tag: t.id,
            });
          }
          newlyNotified.push(t.id);
        }
      });
      if (newlyNotified.length) {
        setNotifiedIds((prev) => {
          const next = new Set(prev);
          newlyNotified.forEach((id) => next.add(id));
          localStorage.setItem("trakr_notified", JSON.stringify([...next]));
          return next;
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [notifsOn, tasks, notifiedIds]);

  const dateText = useMemo(() => {
    const now = new Date();
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  }, []);

  const stats = useMemo(() => {
    const active = tasks.filter((t) => !t.done).length;
    const done = tasks.filter((t) => t.done).length;
    const overdue = tasks.filter(isOverdue).length;
    return { active, done, overdue };
  }, [tasks]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-logo">
          Trakr<span className="logo-dot" />
        </div>
        <div className="loading-bar" />
      </div>
    );
  }

  if (!user) {
    return <AuthView onSignIn={signIn} />;
  }

  if (!teamId) {
    return <TeamSetup user={user} onTeamReady={setUserTeamId} />;
  }

  if (!team) {
    return (
      <div className="loading">
        <div className="loading-logo">
          Trakr<span className="logo-dot" />
        </div>
        <div className="loading-bar" />
      </div>
    );
  }

  return (
    <div className="app-view active">
      <div className="container">
        <Header
          dateText={dateText}
          view={view}
          onToggleView={toggleView}
          notifsOn={notifsOn}
          onToggleNotifs={toggleNotifs}
          accent={theme.accent}
          bg={theme.bg}
          mode={theme.mode}
          setAccent={theme.setAccent}
          setBg={theme.setBg}
          setMode={theme.setMode}
        />
        <TeamBar team={team} onInvite={() => setInviteOpen(true)} onSignOut={logOut} />
        <StatsRow active={stats.active} done={stats.done} overdue={stats.overdue} />
        <TaskInput team={team} user={user} tasks={tasks} />
        {view === "kanban" ? (
          <KanbanBoard
            teamId={team.id}
            tasks={tasks}
            members={team.members || {}}
            user={user}
            onToast={showToast}
            onEditRequest={() => setView("list")}
          />
        ) : (
          <TaskList teamId={team.id} tasks={tasks} members={team.members || {}} user={user} onToast={showToast} />
        )}
      </div>
      <InviteModal open={inviteOpen} code={team.inviteCode} onClose={() => setInviteOpen(false)} onToast={showToast} />
      <Toast message={toastMsg} show={toastShow} />
    </div>
  );
}
