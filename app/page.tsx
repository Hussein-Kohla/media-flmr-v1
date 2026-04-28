"use client";

import { useAuthQuery as useQuery } from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import { useMemo, useState, useEffect } from "react";
import { Users, CalendarDays, ArrowUpRight, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context_fixed";

function CountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

function HomeSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="h-24 w-3/4 bg-white/[0.05] rounded-xl" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-white/[0.05]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 h-96 rounded-xl bg-white/[0.05]" />
        <div className="h-96 rounded-xl bg-white/[0.05]" />
      </div>
    </div>
  );
}

export default function Home() {
  const { t, language } = useApp();
  const clients = useQuery(api.clients.listClients, {});
  const projects = useQuery(api.projects.listProjects, {});
  const tasks = useQuery(api.calendar.listCalendarTasks, {});

  const isLoading =
    clients === undefined || projects === undefined || tasks === undefined;

  const today = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const todayTasks = useMemo(
    () => (tasks ?? []).filter((t: CalendarTask) => t.date === today),
    [tasks, today],
  );

  const activeProjects = useMemo(
    () =>
      (projects ?? []).filter((p: Project) => p.status === "active" || !p.status),
    [projects],
  );

  const stats = [
    { label: "Total Clients", value: (clients ?? []).length, href: "/clients" },
    {
      label: "Active Projects",
      value: activeProjects.length,
      href: "/editing",
    },
    { label: "Today's Tasks", value: todayTasks.length, href: "/calendar" },
    {
      label: "Publishing",
       value: (projects ?? []).filter((p: Project) => p.status === "publishing")
        .length,
      href: "/publishing",
    },
  ];

  const upcomingTasks = useMemo(
    () =>
      [...(tasks ?? [])]
         .filter((t: CalendarTask) => t.date >= today)
         .sort((a: CalendarTask, b: CalendarTask) =>
          `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
        )
        .slice(0, 6),
    [tasks, today],
  );

  const nextTask = upcomingTasks[0];

  const taskTypeColors: Record<string, string> = {
    meeting: "text-sky-500",
    deadline: "text-rose-500",
    reminder: "text-amber-500",
    shoot: "text-emerald-500",
    other: "text-slate-500",
  };

  const actions = [
    { label: "New Project", icon: Zap, href: "/editing" },
    { label: "Client Hub", icon: Users, href: "/clients" },
    { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  ];

  if (isLoading) return <HomeSkeleton />;

  return (
    <div className="relative flex flex-col justify-between w-full h-full gap-12 px-6 py-12">
      {/* Floating Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero */}
      <section className="reveal-1 relative z-10 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 border rounded-full bg-purple-500/10 border-purple-500/20">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-purple-400">
                {new Date().toLocaleDateString(
                  language === "ar" ? "ar-EG" : "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white leading-[0.8] drop-shadow-2xl uppercase">
              {t("dashboard_title")
                .split(" ")
                .map((word: string, i: number) => (
                  <span key={i} className={i === 1 ? "text-purple-600" : ""}>
                    {word}{" "}
                  </span>
                ))}
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/editing"
              className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-display font-black text-lg uppercase tracking-tight btn-premium-shadow flex items-center gap-3 transition-all duration-300 ease-out hover:brightness-110 hover:scale-[1.05] hover:shadow-[0_8px_30px_rgba(147,51,234,0.3)] active:scale-95"
            >
              <Zap className="w-5 h-5 fill-current" />
              Launch Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="reveal-2 relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto w-full">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="group relative p-7 rounded-3xl bg-black border border-white/10 transition-all duration-300 hover:scale-[1.04] hover:border-purple-500/40 hover:bg-purple-950/20 overflow-hidden btn-premium-shadow flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-4 transition-all duration-300 opacity-5 group-hover:opacity-30 group-hover:translate-x-1 group-hover:-translate-y-1">
              <Zap className="w-12 h-12 text-purple-500" />
            </div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] group-hover:text-purple-400 transition-colors duration-200">
              {stat.label}
            </p>
            <p className="mt-4 text-5xl font-black text-white transition-transform duration-200 origin-left font-display group-hover:scale-105">
              <CountUp value={stat.value} />
            </p>
          </Link>
        ))}
      </section>

      {/* Main Grid */}
      <div className="reveal-3 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-[1400px] mx-auto w-full pb-6">
        {/* Timeline */}
        <div className="space-y-8 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="flex items-center gap-4 text-2xl font-black tracking-tight text-white uppercase font-display">
              Timeline
              <span className="px-2 py-0.5 rounded-lg text-[9px] bg-purple-500 text-black font-black">
                Live
              </span>
            </h2>
            <Link
              href="/calendar"
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-purple-400 transition-colors duration-200"
            >
              View All
              <ArrowUpRight className="w-3 h-3 transition-transform duration-200 hover:translate-x-0.5 hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="grid gap-4">
             {upcomingTasks.slice(0, 3).map((task: CalendarTask, i: number) => (
              <div
                key={task._id || i}
                className="group relative p-6 rounded-[1.5rem] bg-black border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:border-white/15 hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div
                      className={`p-4 rounded-xl bg-white/5 border border-white/10 ${taskTypeColors[task.type] || "text-gray-500"} group-hover:scale-110 group-hover:bg-white/10 transition-all duration-200`}
                    >
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest ${taskTypeColors[task.type] || "text-gray-500"}`}
                        >
                          {t("task_" + task.type)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[9px] font-mono font-bold text-gray-500">
                          {task.time || "00:00"}
                        </span>
                      </div>
                      <p className="text-xl font-bold leading-tight text-white transition-colors duration-200 group-hover:text-purple-400">
                        {task.title}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-purple-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-between h-full gap-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display">
              Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {actions.map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  className="w-full group flex items-center justify-between p-5 rounded-2xl bg-purple-600 text-white btn-premium-shadow font-display font-black text-xl uppercase tracking-tighter transition-all duration-300 ease-out hover:scale-[1.05] hover:brightness-110 hover:shadow-[0_8px_30px_rgba(147,51,234,0.3)] active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <action.icon className="w-5 h-5 transition-opacity duration-200 fill-current opacity-60 group-hover:opacity-100" />
                    {action.label}
                  </div>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </Link>
              ))}
            </div>
          </div>

          {/* Next Task Card */}
          {nextTask && (
            <div className="relative p-8 rounded-[2.5rem] bg-purple-600 text-white overflow-hidden group btn-premium-shadow flex-1 flex flex-col justify-between min-h-[180px] transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <Zap className="w-8 h-8 transition-all duration-300 text-white/40 group-hover:text-white/70 group-hover:scale-110" />
                  <div className="px-3 py-0.5 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-widest">
                    Priority
                  </div>
                </div>
                <p className="text-4xl font-display font-black leading-[0.8] tracking-tighter">
                  {nextTask.title}
                </p>
              </div>
              <div className="relative z-10 flex items-end justify-between pt-4 border-t border-white/20">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold opacity-60 uppercase">
                    {nextTask.date}
                  </p>
                  <p className="font-mono text-xl font-bold">{nextTask.time}</p>
                </div>
                <ArrowUpRight className="w-6 h-6 p-1 transition-colors duration-200 rounded-lg bg-white/20 group-hover:bg-white/30" />
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-[100%] h-[100%] bg-white/10 blur-[80px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
