"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useAuthQuery as useQuery, useAuthMutation as useMutation } from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CalendarTask, Client, Project, TaskType, ViewMode } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Plus, ChevronLeft, ChevronRight, Clock, 
    Calendar as CalendarIcon, Tag, Trash2, 
    Loader2
  } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/lib/context_fixed";
import { ClientAvatar } from "@/components/ui/DataDisplay";

type Mode = "create" | "edit";
type FormState = {
  title: string;
  date: string;
  time: string;
  duration: number;
  type: TaskType;
  assignees: string;
  clientId: string;
  projectId: string;
  notes: string;
};

const taskConfig: Record<TaskType, { label: string; color: string; dot: string }> = {
  meeting:  { label: "Meeting",  color: "#8b5cf6", dot: "bg-[#8b5cf6]" }, // Purple
  deadline: { label: "Deadline", color: "#f43f5e", dot: "bg-[#f43f5e]" }, // Rose
  reminder: { label: "Reminder", color: "#38bdf8", dot: "bg-[#38bdf8]" }, // Sky
  shoot:    { label: "Shoot",    color: "#34d399", dot: "bg-[#34d399]" }, // Emerald
  other:    { label: "Other",    color: "#94a3b8", dot: "bg-[#94a3b8]" }, // Slate
};

const emptyForm = (date = new Date()): FormState => ({
  title: "", date: toYMD(date), time: "09:00", duration: 60, type: "meeting",
  assignees: "", clientId: "", projectId: "", notes: "",
});

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}
function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function fromYMD(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const res = new Date(y, m - 1, d);
  res.setHours(0, 0, 0, 0);
  return res;
}

// Avatar is now imported from DataDisplay

const CalendarTaskItem = React.memo(({ 
  task, colIndex, weekDays, resizingTask, setResizingTask, setIsResizing, isResizing,
  openEdit, handleResize, updateTask, clientMap, projectMap, taskConfig 
}: { 
  task: CalendarTask; colIndex: number; weekDays: Date[]; 
    resizingTask: { id: string; height: number; type: "top" | "bottom" } | null; 
    setResizingTask: React.Dispatch<React.SetStateAction<{ id: string; height: number; type: "top" | "bottom" } | null>>; 
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>; 
    isResizing: boolean;
    openEdit: (task: CalendarTask) => void; 
    handleResize: (task: CalendarTask, duration: number) => Promise<void>; 
    updateTask: (args: any) => Promise<void>; 
    clientMap: Record<string, Client>; 
    projectMap: Record<string, Project>; 
    taskConfig: Record<TaskType, { label: string; color: string; dot: string }>;
}) => {
  let top = 0;
  let height = 80; 
  if (task.time) {
    const [h, m] = task.time.split(":").map(Number);
    top = h * 80 + (m / 60) * 80;
  }
  if (task.duration) {
     height = (task.duration / 60) * 80;
  }

  const cfg = taskConfig[task.type];
  const resolvedClientId = task.clientId || (task.projectId ? projectMap[task.projectId]?.clientId : "");
  const client = resolvedClientId ? clientMap[resolvedClientId] : undefined;
  const customColor = client?.color || cfg.color;

  return (
    <button key={task._id} 
      draggable 
      onDragStart={(e) => { e.dataTransfer.setData("taskId", task._id); }}
      onClick={(e) => { e.stopPropagation(); if(!isResizing) openEdit(task); }}
      className="absolute rounded-lg p-2 text-left shadow-lg overflow-hidden transition-all hover:scale-[1.02] hover:z-50 hover:!bg-blue-600/30 hover:!border-blue-400 group cursor-grab active:cursor-grabbing"
      style={{ 
        left: `calc(60px + ${colIndex} * (100% - 60px) / 7 + 4px)`, 
        width: `calc((100% - 60px) / 7 - 8px)`, 
        top: resizingTask?.id === task._id && resizingTask.type === "top" ? `${top - (resizingTask.height - height)}px` : `${top}px`, 
        height: resizingTask?.id === task._id ? `${resizingTask.height}px` : `${height}px`,
        backgroundColor: `${customColor}25`, 
        borderWidth: "1px",
        borderLeftWidth: "4px",
        borderStyle: "solid",
        borderColor: `${customColor}40`,
        borderLeftColor: customColor,
        backdropFilter: "blur(4px)"
      }}>
       {/* Top Resize Handle */}
        <div className="absolute top-0 inset-x-0 h-3 py-1 cursor-ns-resize hover:bg-white/20 z-20"
         onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsResizing(true);
            const startY = e.clientY;
            const startHeight = height;
            const startTop = top;
            const onMove = (moveEvent: MouseEvent) => {
              const deltaY = moveEvent.clientY - startY;
              const newHeight = Math.max(20, startHeight - deltaY);
              setResizingTask({ id: task._id, height: newHeight, type: "top" });
            };
            const onUp = (upEvent: MouseEvent) => {
              const deltaY = upEvent.clientY - startY;
              const finalDur = Math.max(15, Math.round(((startHeight - deltaY) / 80) * 60 / 15) * 15);
              const newTop = startTop + deltaY;
              const newTotalMinutes = Math.max(0, Math.round((newTop / 80) * 60 / 15) * 15);
              const newH = Math.floor(newTotalMinutes / 60);
              const newM = newTotalMinutes % 60;
              const newTime = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
              
               updateTask({
                 id: task._id as Id<"calendar_tasks">,
                 title: task.title,
                 date: task.date,
                 time: newTime,
                 duration: finalDur,
                 type: task.type,
                 assignees: task.assignees,
               } as any);
              
              setResizingTask(null);
              setTimeout(() => setIsResizing(false), 100);
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
         }}
       />

       <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-bold text-foreground/95 truncate leading-tight">{task.title}</span>
       </div>
       <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/60 font-medium">{task.time || "00:00"} ({task.duration || 60}m)</span>
          {client && <ClientAvatar client={client} size={4} />}
       </div>

       {/* Bottom Resize Handle */}
        <div className="absolute bottom-0 inset-x-0 h-3 py-1 cursor-ns-resize hover:bg-white/20"
         onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsResizing(true);
            const startY = e.clientY;
            const startHeight = height;
            const onMove = (moveEvent: MouseEvent) => {
              const deltaY = moveEvent.clientY - startY;
              const newHeight = Math.max(20, startHeight + deltaY);
              setResizingTask({ id: task._id, height: newHeight, type: "bottom" });
            };
            const onUp = (upEvent: MouseEvent) => {
              const deltaY = upEvent.clientY - startY;
              const finalDur = Math.max(15, Math.round(((startHeight + deltaY) / 80) * 60 / 15) * 15);
              handleResize(task, finalDur);
              setResizingTask(null);
              setTimeout(() => setIsResizing(false), 100);
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
         }}
       />
    </button>
  );
});
CalendarTaskItem.displayName = "CalendarTaskItem";

const CalendarSkeleton = ({ viewMode }: { viewMode: ViewMode }) => {
  if (viewMode === "week") {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col mt-4">
        <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-white/[0.06]">
          <div className="p-3"></div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-3 border-l border-white/[0.03] text-center">
              <Skeleton className="h-3 w-12 mx-auto mb-2" />
              <Skeleton className="h-6 w-6 rounded-full mx-auto" />
            </div>
          ))}
        </div>
        <div className="relative overflow-y-auto max-h-[800px] no-scrollbar">
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative">
            {Array.from({ length: 24 }).map((_, i) => (
              <React.Fragment key={i}>
                <div className="h-20 border-b border-white/[0.06] w-[60px]" />
                {Array.from({ length: 7 }).map((_, col) => (
                  <div key={col} className="h-20 border-b border-l border-white/[0.03]" />
                ))}
              </React.Fragment>
            ))}
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={`col-tasks-${col}`} className="absolute top-0 bottom-0 flex flex-col gap-4 p-4" 
                style={{ left: `calc(60px + ${col} * (100% - 60px) / 7 + 4px)`, width: `calc((100% - 60px) / 7 - 8px)` }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 opacity-50" style={{ marginTop: `${(i * 37) % 80}px` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "month") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 h-32">
            <div className="flex justify-between mb-3">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-3 w-full opacity-60" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 min-h-[400px] space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-full h-20 rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center gap-4">
            <Skeleton className="w-12 h-4" />
            <Skeleton className="w-1 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CalendarEmptyState = ({ title, description, action }: { title: string, description: string, action?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 w-full">
    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/20">
      <CalendarIcon className="w-8 h-8" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground/40 max-w-[300px] mx-auto">{description}</p>
    </div>
    {action && (
      <button onClick={action} className="px-4 py-2 rounded-xl bg-[#8b5cf6] text-white text-sm font-bold hover:bg-[#7c3aed] transition-all">
        {title === "No Tasks Found" ? "Add Your First Task" : "Add Task"}
      </button>
    )}
  </div>
);

const formClasses = {
  input: "bg-white/[0.05] border-white/10 text-foreground placeholder:text-muted-foreground/30 focus:border-[#8b5cf6]/50",
  select: "h-10 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-foreground focus:outline-none focus:border-[#8b5cf6]/50",
  label: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
};

const FormFields = React.memo(({ 
  t, form, sync, clients, projects 
}: { 
  t: (key: string) => string; form: FormState; sync: (field: keyof FormState, val: any) => void; clients: Client[]; projects: Project[] 
}) => (
  <div className="space-y-4 py-4">
     <div className="space-y-1.5">
       <Label htmlFor="task-title" className={formClasses.label}>{t("task_title")}</Label>
       <div className="relative">
         <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
         <Input id="task-title" value={form.title} onChange={e => sync("title", e.target.value)} placeholder="e.g. Shooting..." className={`${formClasses.input} pl-9`} />
       </div>
     </div>

    <div className="grid grid-cols-2 gap-4">
       <div className="space-y-1.5">
         <Label htmlFor="due-date" className={formClasses.label}>{t("due_date")}</Label>
         <div className="relative">
           <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
           <Input id="due-date" type="date" min={toYMD(new Date())} value={form.date} onChange={e => sync("date", e.target.value)} className={`${formClasses.input} pl-9`} />
         </div>
       </div>
       <div className="space-y-1.5">
         <Label htmlFor="start-time" className={formClasses.label}>{t("start_time")}</Label>
         <div className="relative">
           <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/40" />
           <Input id="start-time" type="time" value={form.time} onChange={e => sync("time", e.target.value)} className={`${formClasses.input} pl-9`} />
         </div>
       </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
       <div className="space-y-1.5">
         <Label htmlFor="duration" className={formClasses.label}>{t("duration_mins")}</Label>
         <Input id="duration" type="number" step="15" value={form.duration} onChange={e => sync("duration", parseInt(e.target.value)||60)} className={formClasses.input} />
       </div>
       <div className="space-y-1.5">
         <Label htmlFor="task-type" className={formClasses.label}>{t("video_type")}</Label>
         <select id="task-type" value={form.type} onChange={e => sync("type", e.target.value)} className={formClasses.select}>
           {Object.entries(taskConfig).map(([k, v]) => <option key={k} value={k} className="bg-[#0f1117]">{t(`task_${k}`)}</option>)}
         </select>
       </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
       <div className="space-y-1.5">
         <Label htmlFor="client-id" className={formClasses.label}>{t("client")} ({t("other")})</Label>
         <select id="client-id" value={form.clientId} onChange={e => sync("clientId", e.target.value)} className={formClasses.select}>
           <option value="" className="bg-[#0f1117]">{t("no_client")}</option>
           {clients.map(c => <option key={c._id} value={c._id} className="bg-[#0f1117]">{c.name}</option>)}
         </select>
       </div>
       <div className="space-y-1.5">
         <Label htmlFor="project-id" className={formClasses.label}>{t("project")} ({t("other")})</Label>
         <select id="project-id" value={form.projectId} onChange={e => sync("projectId", e.target.value)} className={formClasses.select}>
           <option value="" className="bg-[#0f1117]">{t("no_project")}</option>
           {projects.map(p => <option key={p._id} value={p._id} className="bg-[#0f1117]">{p.projectName}</option>)}
         </select>
       </div>
    </div>
  </div>
));
FormFields.displayName = "FormFields";

export default function CalendarPage() {

  const { t, language, formatDate, formatDateTime } = useApp();
  const tasks = useQuery(api.calendar.listCalendarTasks, {}) as CalendarTask[] | undefined;
  const clients = useQuery(api.clients.listClients, {}) as Client[] | undefined;
  const projects = useQuery(api.projects.listProjects, {}) as Project[] | undefined;
  
  const isLoading = tasks === undefined || clients === undefined || projects === undefined;

  const createTask = useMutation(api.calendar.createCalendarTask);
  const updateTask = useMutation(api.calendar.updateCalendarTask);
  const deleteTask = useMutation(api.calendar.deleteCalendarTask);

  const today = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(toYMD(today));
  const [mode, setMode] = useState<Mode>("create");
  const [activeTask, setActiveTask] = useState<CalendarTask | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(today));
  const [draft, setDraft] = useState<FormState | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const clientMap = useMemo(() => (clients ? Object.fromEntries(clients.map(c => [c._id, c])) : {}) as Record<string, Client>, [clients]);
  const projectMap = useMemo(() => (projects ? Object.fromEntries(projects.map(p => [p._id, p])) : {}) as Record<string, Project>, [projects]);
  const sortedTasks = useMemo(() => (tasks ? [...tasks].sort((a, b) => `${a.date}${a.time||""}`.localeCompare(`${b.date}${b.time||""}`)) : []), [tasks]);
  const weekStart = useMemo(() => startOfWeek(fromYMD(selectedDate)), [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const [resizingTask, setResizingTask] = useState<{ id: string; height: number; type: "top" | "bottom" } | null>(null);
  const monthDays = useMemo(() => {
    const anchor = fromYMD(selectedDate);
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return Array.from({ length: last.getDate() }, (_, i) => new Date(anchor.getFullYear(), anchor.getMonth(), i + 1));
  }, [selectedDate]);

  const tasksByDay = (date: string) => sortedTasks.filter(tsk => tsk.date === date);

  const openCreate = useCallback((date?: Date) => {
    setMode("create"); setActiveTask(null);
    setForm(draft || emptyForm(date || fromYMD(selectedDate)));
    setOpen(true);
  }, [draft, selectedDate]);

  const openEdit = useCallback((task: CalendarTask) => {
    setMode("edit"); setActiveTask(task);
    setForm({
      title: task.title,
      date: task.date,
      time: task.time || "09:00",
      duration: task.duration || 60,
      type: task.type,
      assignees: task.assignees.join(", "),
      clientId: task.clientId || "",
      projectId: task.projectId || "",
      notes: task.notes || "",
    });
    setOpen(true);
  }, []);

  const sync = useCallback((field: keyof FormState, val: any) => setForm(f => ({ ...f, [field]: val })), []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      assignees: form.assignees.split(",").map(s => s.trim()).filter(Boolean),
      clientId: form.clientId || undefined,
      projectId: form.projectId || undefined,
      notes: form.notes || undefined,
    };

    try {
      if (mode === "create") {
          await createTask(payload as any);
          setDraft(null);
      } else {
          await updateTask({ id: activeTask!._id as Id<"calendar_tasks">, ...payload } as any);
      }
      setOpen(false);
     } catch (err) {
         alert(mode === "create" ? t("create_failed") : t("update_failed"));
       }
  }, [form, mode, activeTask, createTask, updateTask]);

  const handleDrop = useCallback(async (e: React.DragEvent, date: string, hour: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks?.find(tsk => tsk._id === taskId);
    if (!task) return;

    const newTime = `${String(hour).padStart(2, "0")}:00`;
    try {
      await updateTask({
        id: taskId as Id<"calendar_tasks">,
        title: task.title,
        date: date,
        time: newTime,
        duration: task.duration || 60,
        type: task.type,
        assignees: task.assignees,
        clientId: (task.clientId as Id<"clients">) || undefined,
        projectId: (task.projectId as Id<"projects">) || undefined,
      } as any);
    } catch (err) {
      alert(t("update_failed"));
    }
  }, [tasks, updateTask]);

  const handleResize = useCallback(async (task: CalendarTask, newDur: number) => {
    try {
      await updateTask({
        id: task._id as Id<"calendar_tasks">,
        title: task.title,
        date: task.date,
        time: task.time,
        duration: newDur,
        type: task.type,
        assignees: task.assignees,
        clientId: (task.clientId as Id<"clients">) || undefined,
        projectId: (task.projectId as Id<"projects">) || undefined,
      } as any);
    } catch (err) {
      alert(t("update_failed"));
    }
  }, [updateTask]);

  const navigate = useCallback((dir: number) => {
    const d = fromYMD(selectedDate);
    if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
    else if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir);
    setSelectedDate(toYMD(d));
  }, [selectedDate, viewMode]);

  const viewLabel = useMemo(() => {
    const d = fromYMD(selectedDate);
    if (viewMode === "week") {
       const end = addDays(weekStart, 6);
       return `${weekStart.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {month:"short",day:"numeric"})} - ${end.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {month:"short",day:"numeric",year:"numeric"})}`;
    }
    if (viewMode === "month") return d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { month: "long", year: "numeric" });
    return d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { weekday: "long", month: "long", day: "numeric" });
  }, [selectedDate, viewMode, weekStart, language]);


  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8b5cf6] mb-1">{t("schedule")}</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{t("calendar")}</h1>
        </div>
        <button onClick={() => openCreate()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02]">
          <Plus className="w-4 h-4" /> {t("add_task")}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
        {/* View switcher */}
        <div className="flex rounded-xl bg-white/[0.05] p-1 gap-1">
          {(["week","month","day"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                viewMode === v ? "bg-[#8b5cf6] text-white" : "text-muted-foreground hover:text-foreground"
              }`}>{t(v)}</button>
          ))}
        </div>

        {/* Nav */}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-white/20 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-foreground/70 min-w-[200px] text-center">{viewLabel}</span>
          <button onClick={() => navigate(1)}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-white/20 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setSelectedDate(toYMD(today))}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-muted-foreground/50 hover:text-foreground hover:border-white/20 transition-all">
            {t("today")}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <CalendarSkeleton viewMode={viewMode} />
      ) : tasks.length === 0 ? (
        <CalendarEmptyState 
          title="No Tasks Found" 
          description="Your calendar is completely empty. Start organizing your schedule by adding some tasks."
          action={() => openCreate()}
        />
      ) : (
        <>
          {/* Week View (Time Grid) */}
          {viewMode === "week" && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col mt-4">
          {/* Header Row (Days) */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-white/[0.06]">
            <div className="p-3"></div>
            {weekDays.map(day => {
               const key = toYMD(day);
               const isToday = key === toYMD(today);
               return (
                 <button key={key} onClick={() => { setSelectedDate(key); setViewMode("day"); }}
                   className={`p-3 text-center border-l border-white/[0.03] transition-colors hover:bg-white/[0.02] ${isToday ? "bg-[#8b5cf6]/5" : ""}`}>
                   <div className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest mb-1">
                     {day.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US",{weekday:"short"})}
                   </div>
                   <div className={`text-xl font-bold ${isToday ? "text-[#8b5cf6]" : "text-foreground/80"}`}>
                     {String(day.getDate()).padStart(2, "0")}
                   </div>
                 </button>
               );
            })}
          </div>
          
          {/* Grid Body */}
          <div className="relative overflow-y-auto max-h-[800px] no-scrollbar">
            <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative">
              {/* background grid lines for 24 hours */}
              {Array.from({ length: 24 }).map((_, i) => (
                <React.Fragment key={i}>
                  {/* Time label */}
                  <div className="h-20 border-b border-white/[0.06] text-right pr-2 pt-2 text-[12px] font-extrabold text-white uppercase tracking-tighter">
                    {i === 0 ? (language === "ar" ? "١٢ ص" : "12 AM") : i > 12 ? `${i - 12} ${language === "ar" ? "م" : "PM"}` : i === 12 ? (language === "ar" ? "١٢ م" : "12 PM") : `${i} ${language === "ar" ? "ص" : "AM"}`}
                  </div>
                  {/* Cell borders for 7 days */}
                  {Array.from({ length: 7 }).map((_, col) => (
                     <div key={col} className="h-20 border-b border-l border-white/[0.03] transition-colors relative"
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => handleDrop(e, toYMD(weekDays[col]), i)}
                       onClick={() => {
                          if (isResizing) return;
                          const clickedDay = weekDays[col];
                          const targetTime = `${String(i).padStart(2, "0")}:00`;
                          setSelectedDate(toYMD(clickedDay));
                          setForm(f => ({ ...f, date: toYMD(clickedDay), time: targetTime }));
                          openCreate(clickedDay);
                       }}>
                     </div>
                  ))}
                </React.Fragment>
              ))}

               {/* Absolute overlay for tasks */}
               {weekDays.map((day, colIndex) => {
                 const dayTasks = sortedTasks.filter(tsk => tsk.date === toYMD(day));
                 return dayTasks.map(task => (
                   <CalendarTaskItem 
                     key={task._id}
                     task={task}
                     colIndex={colIndex}
                     weekDays={weekDays}
                     resizingTask={resizingTask}
                     setResizingTask={setResizingTask}
                     setIsResizing={setIsResizing}
                     isResizing={isResizing}
                     openEdit={openEdit}
                     handleResize={handleResize}
                     updateTask={updateTask}
                     clientMap={clientMap}
                     projectMap={projectMap}
                     taskConfig={taskConfig}
                   />
                 ));
               })}
             </div>
           </div>
          </div>
       )}

       {/* Month View */}
      {viewMode === "month" && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {monthDays.map(day => {
            const key = toYMD(day);
            const isToday = key === toYMD(today);
            const dayTasks = tasksByDay(key);
            return (
              <div key={key} className={`rounded-2xl border p-4 transition-all ${
                isToday ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/5" : "border-white/[0.06] bg-white/[0.03]"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => { setSelectedDate(key); setViewMode("day"); }}>
                    <span className={`text-sm font-bold ${isToday ? "text-[#8b5cf6]" : "text-foreground/70"}`}>
                      {day.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US",{day:"numeric",month:"short"})}
                    </span>
                  </button>
                  {dayTasks.length > 0 && (
                    <span className="text-xs text-muted-foreground/30">{dayTasks.length}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {dayTasks.slice(0, 3).map(task => {
                    const cfg = taskConfig[task.type];
                    return (
                      <button key={task._id} onClick={() => openEdit(task)}
                        className="w-full text-left flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.05] transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className="text-xs text-muted-foreground/60 truncate">{task.title}</span>
                      </button>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground/30 pl-2">+{dayTasks.length - 3} {t("other")}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
         <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 min-h-[400px]">
           <div className="flex items-center gap-4 mb-8">
             <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] font-bold text-2xl">
                {fromYMD(selectedDate).getDate()}
             </div>
             <div>
               <h2 className="text-xl font-bold text-foreground">{fromYMD(selectedDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { weekday: "long", month: "long" })}</h2>
               <p className="text-muted-foreground/40">{tasksByDay(selectedDate).length} {t("active_projects")}</p>
             </div>
           </div>
           
           <div className="space-y-3">
             {tasksByDay(selectedDate).map(tsk => {
                const cfg = taskConfig[tsk.type];
                return (
                  <button key={tsk._id} onClick={() => openEdit(tsk)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                    <div className="text-sm font-bold text-muted-foreground/40 w-16">{tsk.time || "09:00"}</div>
                    <div className={`w-1 h-10 rounded-full ${cfg.dot}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground group-hover:text-[#8b5cf6] transition-colors">{tsk.title}</div>
                      <div className="text-xs text-muted-foreground/30">{tsk.duration} {t("duration_mins")} • {tsk.assignees.join(", ")}</div>
                    </div>
                  </button>
                );
             })}
              {tasksByDay(selectedDate).length === 0 && (
                 <CalendarEmptyState 
                   title="No Tasks Scheduled" 
                   description="Your schedule is clear for this day. Take a break or add a new task."
                   action={() => openCreate()}
                 />
              )}
           </div>
         </div>
      )}
      </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-white/10 text-foreground sm:max-w-[550px] rounded-3xl p-6 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]">
                <Plus className="w-5 h-5" />
              </div>
              {mode === "create" ? t("add_task") : t("edit_task")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <FormFields t={t} form={form} sync={sync} clients={clients || []} projects={projects || []} />
            <DialogFooter className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
              {mode === "edit" && (
                <button type="button" onClick={() => { if(confirm(t("delete_confirm"))) { deleteTask({ id: activeTask!._id as Id<"calendar_tasks"> }); setOpen(false); } }}
                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-sm font-semibold">
                  <Trash2 className="w-4 h-4" /> {t("delete_task")}
                </button>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button type="button" onClick={() => setOpen(false)}
                   className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground font-semibold transition-all text-sm">
                  {t("cancel")}
                </button>
                <button type="submit"
                   className="px-8 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition-all text-sm shadow-lg shadow-[#8b5cf6]/20">
                  {mode === "create" ? t("create") : t("update_task")}
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
