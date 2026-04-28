"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  useAuthQuery as useQuery,
  useAuthMutation as useMutation,
} from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import Image from "next/image";
import {
  CheckCircle2,
  Circle,
  Clock3,
  Pencil,
  Trash2,
  Plus,
  ImageIcon,
  Loader2,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientAvatar } from "@/components/ui/DataDisplay";
import {
  Client,
  EditingCard,
  EditingStatus,
  EditingVideoType,
  EditingSubTask,
} from "@/types";
import { useApp } from "@/lib/context_fixed";

type EditingForm = {
  clientId: Id<"clients"> | "";
  title: string;
  videoType: EditingVideoType;
  status: EditingStatus;
  dueDate: number;
  subTasks: EditingSubTask[];
  notes: string;
  thumbnailId?: string;
};

type DraftState = {
  form: EditingForm;
  selectedFile: File | null;
  selectedFilePreview: string | null;
};

const statusOrder: EditingStatus[] = ["pending", "in_progress", "done"];
const videoTypeOptions: EditingVideoType[] = ["long", "short", "ad", "other"];

const statusConfig: Record<
  EditingStatus,
  { labelKey: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    labelKey: "pending",
    color: "#94a3b8",
    bg: "#94a3b818",
    icon: Circle,
  },
  in_progress: {
    labelKey: "in_progress",
    color: "#38bdf8",
    bg: "#38bdf818",
    icon: Clock3,
  },
  done: {
    labelKey: "done",
    color: "#34d399",
    bg: "#34d39918",
    icon: CheckCircle2,
  },
};

const typeConfig: Record<EditingVideoType, { color: string; bg: string }> = {
  long: { color: "#8b5cf6", bg: "#8b5cf618" },
  short: { color: "#38bdf8", bg: "#38bdf818" },
  ad: { color: "#fb7185", bg: "#fb718518" },
  other: { color: "#94a3b8", bg: "#94a3b818" },
};

const CardThumbnail = React.memo(({ url }: { url?: string }) => {
  if (!url) return null;
  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/[0.02]">
      <Image
        src={url}
        alt="Thumbnail"
        className="w-full h-full object-cover"
        fill
      />
    </div>
  );
});
CardThumbnail.displayName = "CardThumbnail";

const CardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 relative overflow-hidden">
    <div className="flex items-start gap-3 pl-1">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <div className="w-full pl-1 mt-1">
      <div className="flex items-center justify-between mb-1.5">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
    <div className="flex items-center justify-between mt-1 pl-1">
      <Skeleton className="h-3 w-20" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="w-7 h-7 rounded-lg" />
      </div>
    </div>
  </div>
);

const EditingCardItem = React.memo(
  ({
    card,
    clientMap,
    onEdit,
    onDelete,
    onDragStart,
    t,
    formatDate,
    thumbnailUrl,
  }: {
    card: EditingCard;
    clientMap: Record<string, Client>;
    onEdit: (c: EditingCard) => void;
    onDelete: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    t: any;
    formatDate: any;
    thumbnailUrl?: string;
  }) => {
    const client = clientMap[card.clientId];
    const completed = card.subTasks.filter((t) => t.done).length;
    const progress = card.subTasks.length
      ? Math.round((completed / card.subTasks.length) * 100)
      : 0;
    const typeCfg = typeConfig[card.videoType];
    const isOverdue =
      new Date(card.dueDate).setHours(0, 0, 0, 0) <
        new Date().setHours(0, 0, 0, 0) && card.status !== "done";
    const cfg = statusConfig[card.status];

    return (
      <div
        key={card._id}
        draggable
        onDragStart={(e) => onDragStart(e, card._id)}
        className={`group rounded-xl border border-border bg-card p-4 hover:border-accent/40 transition-all duration-200 cursor-grab active:cursor-grabbing shadow-sm flex flex-col gap-3 relative overflow-hidden ${card.status === "done" ? "grayscale opacity-60" : ""}`}
      >
        {/* Accent left line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 opacity-60"
          style={{ backgroundColor: client?.color || cfg.color }}
        />

        <div className="flex items-start gap-3 pl-1">
          {thumbnailUrl && <CardThumbnail url={thumbnailUrl} />}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground/90 truncate">
                {card.title}
              </h3>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0"
                style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}
              >
                {t(card.videoType)}
              </span>
            </div>
            {client && (
              <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5 font-medium">
                <ClientAvatar client={client} size={4} />
                {client.name}
              </div>
            )}
          </div>
        </div>

        {/* Progress Line */}
        {card.subTasks.length > 0 && (
          <div className="w-full pl-1 mt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">
                {completed} / {card.subTasks.length}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground/50">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, backgroundColor: cfg.color }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 pl-1">
          <div
            className={`flex items-center gap-1.5 text-[11px] font-medium ${isOverdue ? "text-rose-400" : "text-muted-foreground/40"}`}
          >
            <Clock3 className="w-3 h-3" />
            <span>
              {isOverdue ? t("overdue") + " · " : ""}
              {formatDate(card.dueDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(card)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all border border-transparent hover:border-border"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(card._id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  },
);
EditingCardItem.displayName = "EditingCardItem";

function emptyForm(defaultClientId: Id<"clients"> | "" = ""): EditingForm {
  return {
    clientId: defaultClientId,
    title: "",
    videoType: "long",
    status: "pending",
    dueDate: Date.now(),
    subTasks: [{ task: "", done: false }],
    notes: "",
    thumbnailId: undefined,
  };
}
const selectCls =
  "h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white focus:outline-none focus:border-[#8b5cf6]/50";
const inputCls =
  "bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:border-[#8b5cf6]/50";

export default function EditingPage() {
  const { t, language, formatDate } = useApp();
  const cards = useQuery(api.editing.listEditingCards, {});
  const clients = (useQuery(api.clients.listClients, {}) || []) as Client[];

  const createCard = useMutation(api.editing.createEditingCard);
  const updateCard = useMutation(api.editing.updateEditingCard);
  const deleteCard = useMutation(api.editing.deleteEditingCard);
  const setStatus = useMutation(api.editing.setEditingCardStatus);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [typeFilter, setTypeFilter] = useState<EditingVideoType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<EditingStatus | "all">(
    "all",
  );
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<
    "all" | "overdue" | "today" | "week"
  >("all");
  const [open, setOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [form, setForm] = useState<EditingForm>(emptyForm());
  const [titleError, setTitleError] = useState("");
  const [dateError, setDateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const createDraftRef = useRef<DraftState | null>(null);

  // Track dragging styling
  const [dragOverCol, setDragOverCol] = useState<EditingStatus | null>(null);

  const thumbnailUrl = useQuery(api.storage.getFileUrl, {
    storageId: form.thumbnailId as Id<"_storage"> | undefined,
  });

  useEffect(() => {
    if (!selectedFilePreview) return;
    return () => URL.revokeObjectURL(selectedFilePreview);
  }, [selectedFilePreview]);

  useEffect(() => {
    if (editingCard) return;
    if (open && !form.clientId && clients.length > 0)
      setForm((cur) => ({ ...cur, clientId: clients[0]._id as Id<"clients"> }));
  }, [clients, editingCard, open, form.clientId]);

  useEffect(() => {
    if (open && !editingCard)
      createDraftRef.current = { form, selectedFile, selectedFilePreview };
  }, [form, selectedFile, selectedFilePreview, open, editingCard]);

  const clientMap = useMemo(
    () =>
      Object.fromEntries(clients.map((c: any) => [c._id, c])) as Record<
        string,
        Client
      >,
    [clients],
  );

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return (cards as EditingCard[]).filter((card: any) => {
      const cardDate = new Date(card.dueDate);
      cardDate.setHours(0, 0, 0, 0);
      if (typeFilter !== "all" && card.videoType !== typeFilter) return false;
      if (statusFilter !== "all" && card.status !== statusFilter) return false;
      if (clientFilter !== "all" && card.clientId !== clientFilter)
        return false;
      if (dueFilter === "overdue" && !(cardDate < today)) return false;
      if (dueFilter === "today" && cardDate.getTime() !== today.getTime())
        return false;
      if (dueFilter === "week" && (cardDate < today || cardDate > endOfWeek))
        return false;
      return true;
    });
  }, [cards, typeFilter, statusFilter, clientFilter, dueFilter]);

  const grouped = useMemo(() => {
    const g: Record<EditingStatus, EditingCard[]> = {
      pending: [],
      in_progress: [],
      done: [],
    };
    if (!cards) return g;
    filteredCards.forEach((c: any) => g[c.status].push(c));
    return g;
  }, [filteredCards, cards]);

  const storageIds = useMemo(
    () =>
      filteredCards
        .map((c) => c.thumbnailId)
        .filter(Boolean) as Id<"_storage">[],
    [filteredCards],
  );
  const thumbnailsMap =
    useQuery(
      api.storage.getMultipleFileUrls,
      storageIds.length ? { storageIds } : "skip",
    ) || {};

  const openNewCard = () => {
    const draft = createDraftRef.current;
    const defaultClientId =
      (clients[0]?._id as Id<"clients"> | undefined) || "";
    setEditingCard(null);
    setForm(draft?.form || emptyForm(defaultClientId));
    setSelectedFile(draft?.selectedFile || null);
    setSelectedFilePreview(draft?.selectedFilePreview || null);
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    if (editingCard) {
      setEditingCard(null);
      return;
    }
    createDraftRef.current = { form, selectedFile, selectedFilePreview };
  };

  const syncField = <K extends keyof EditingForm>(
    key: K,
    value: EditingForm[K],
  ) => {
    setForm((cur) => ({ ...cur, [key]: value }));
    if (key === "title") setTitleError("");
    if (key === "dueDate") setDateError("");
  };

  const syncSubTask = (index: number, updates: Partial<EditingSubTask>) =>
    setForm((cur) => {
      const st = [...cur.subTasks];
      st[index] = { ...st[index], ...updates };
      return { ...cur, subTasks: st };
    });

  const uploadThumbnail = async () => {
    if (!selectedFile) return form.thumbnailId;
    const uploadUrl = await generateUploadUrl();
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: selectedFile,
    });
    const result = await response.json();
    return result.storageId as string;
  };

  const validateForm = () => {
    let isValid = true;
    if (!form.title.trim()) {
      setTitleError(t("title_required") || "Title is required");
      isValid = false;
    } else {
      setTitleError("");
    }

    if (form.dueDate && form.dueDate < Date.now() - 86400000) {
      // Allow today (approx)
      setDateError(
        t("future_date_required") || "Due date must be today or in the future",
      );
      isValid = false;
    } else {
      setDateError("");
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const thumbnailId = await uploadThumbnail();
      const payload = {
        clientId: form.clientId as Id<"clients">,
        title: form.title.trim(),
        videoType: form.videoType,
        status: form.status,
        dueDate: form.dueDate,
        subTasks: form.subTasks.filter((item) => item.task.trim().length > 0),
        notes: form.notes.trim() || undefined,
        thumbnailId,
      };
      if (editingCard)
        await updateCard({
          id: editingCard._id as Id<"editing_cards">,
          ...payload,
        });
      else {
        await createCard(payload);
        createDraftRef.current = null;
      }
      setOpen(false);
      setEditingCard(null);
      setSelectedFile(null);
      setSelectedFilePreview(null);
      setForm(emptyForm((clients[0]?._id as Id<"clients">) || ""));
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      alert(editingCard ? t("update_failed") : t("create_failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("cardId", cardId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, status: EditingStatus) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOverCol !== status) setDragOverCol(status);
    },
    [dragOverCol],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, status: EditingStatus) => {
      e.preventDefault();
      setDragOverCol(null);
      const cardId = e.dataTransfer.getData("cardId") as Id<"editing_cards">;
      if (cardId) {
        const originalStatus = cards?.find(
          (c: any) => c._id === cardId,
        )?.status;
        try {
          await setStatus({ id: cardId, status });
        } catch (error) {
          if (originalStatus) {
            await setStatus({ id: cardId, status: originalStatus });
          }
          alert("Failed to move card. Reverted.");
        }
      }
    },
    [setStatus, cards],
  );

  const handleEdit = useCallback((card: EditingCard) => {
    setEditingCard(card);
    setForm({
      clientId: card.clientId as Id<"clients">,
      title: card.title,
      videoType: card.videoType,
      status: card.status,
      dueDate: card.dueDate,
      subTasks: card.subTasks.length
        ? card.subTasks
        : [{ task: "", done: false }],
      notes: card.notes || "",
      thumbnailId: card.thumbnailId,
    });
    setSelectedFile(null);
    setSelectedFilePreview(null);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm(t("delete_confirm")))
        await deleteCard({ id: id as Id<"editing_cards"> });
    },
    [t, deleteCard],
  );

  const totalCards = cards?.length || 0;
  const doneCards = ((cards as EditingCard[]) || []).filter(
    (c) => c.status === "done",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#38bdf8] mb-1">
            {t("pipeline")}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {t("editing")}
          </h1>
        </div>
        <button
          onClick={openNewCard}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> {t("new_card")}
        </button>
      </div>

      {totalCards > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/30 p-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">
                {t("overall_progress")}
              </span>
              <span className="text-xs font-bold text-foreground/60">
                {doneCards} / {totalCards}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#34d399] transition-all duration-500"
                style={{
                  width: `${Math.round((doneCards / Math.max(totalCards, 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/30 p-4">
        <Filter className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as EditingVideoType | "all")
          }
          className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus:outline-none"
        >
          <option value="all" className="bg-[#0f1117]">
            {t("all_types")}
          </option>
          {videoTypeOptions.map((tok: string) => (
            <option key={tok} value={tok} className="bg-card capitalize">
              {t(tok)}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as EditingStatus | "all")
          }
          className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus:outline-none"
        >
          <option value="all" className="bg-card">
            {t("all_statuses")}
          </option>
          {statusOrder.map((s: string) => (
            <option key={s} value={s} className="bg-card capitalize">
              {t(s)}
            </option>
          ))}
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus:outline-none min-w-[140px]"
        >
          <option value="all" className="bg-card">
            {t("all_clients")}
          </option>
          {clients.map((c: any) => (
            <option key={c._id} value={c._id} className="bg-card">
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={dueFilter}
          onChange={(e) => setDueFilter(e.target.value as typeof dueFilter)}
          className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus:outline-none"
        >
          <option value="all" className="bg-card">
            {t("all_due")}
          </option>
          <option value="overdue" className="bg-card">
            {t("overdue")}
          </option>
          <option value="today" className="bg-card">
            {t("today")}
          </option>
          <option value="week" className="bg-card">
            {t("week")}
          </option>
        </select>
      </div>

      {/* Kanban Board */}
      <div className="flex overflow-x-auto pb-4 snap-x gap-4 xl:grid xl:grid-cols-3 xl:overflow-visible">
        {statusOrder.map((status) => {
          const cfg = statusConfig[status];
          const StatusIcon = cfg.icon;
          const colCards = grouped[status];
          const isDragOver = dragOverCol === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col min-w-[85vw] sm:min-w-[400px] snap-center ${isDragOver ? "border-[#8b5cf6] bg-card/50 shadow-lg" : "border-border bg-card/30"}`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <StatusIcon
                    className="w-3.5 h-3.5"
                    style={{ color: cfg.color }}
                  />
                  <span className="text-sm font-semibold capitalize text-foreground/70">
                    {t(status)}
                  </span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ color: cfg.color, backgroundColor: cfg.bg }}
                >
                  {colCards.length}
                </span>
              </div>

              <div className="p-3 space-y-3 flex-1 min-h-[300px]">
                {cards === undefined ? (
                  <>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </>
                ) : (
                  <>
                    {colCards.map((card) => (
                      <EditingCardItem
                        key={card._id}
                        card={card}
                        clientMap={clientMap}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDragStart={handleDragStart}
                        t={t}
                        formatDate={formatDate}
                        thumbnailUrl={
                          thumbnailsMap[card.thumbnailId || ""] ?? undefined
                        }
                      />
                    ))}
                    {colCards.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-border text-center">
                        <span className="text-xs text-muted-foreground/30">
                          {t("drop_cards")}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeDrawer())}
        direction="right"
      >
        <DrawerContent className="bg-[#0f1117] border-l border-white/10 w-full sm:max-w-md h-full ml-auto">
          <div className="flex flex-col h-full overflow-hidden">
            <DrawerHeader className="border-b border-white/[0.05] pb-4">
              <DrawerTitle className="text-white text-xl">
                {editingCard ? t("edit_card") : t("new_card")}
              </DrawerTitle>
              <DrawerDescription className="text-white/40">
                {t("video_card_details")}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <form
                id="editing-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Visual Thumbnail Upload Area */}
                <div>
                  <Label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
                    {t("thumbnail_image")}
                  </Label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="h-32 w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] flex items-center justify-center cursor-pointer hover:bg-white/[0.03] hover:border-[#8b5cf6]/50 transition-all overflow-hidden relative group"
                  >
                    {selectedFilePreview || thumbnailUrl ? (
                      <Image
                        src={selectedFilePreview || thumbnailUrl || ""}
                        alt="Thumbnail"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        fill
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-5 h-5 text-white/30 group-hover:text-[#8b5cf6] transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">
                          {t("click_to_drop")}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {t("change_image")}
                      </span>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setSelectedFile(f);
                        setSelectedFilePreview(
                          f ? URL.createObjectURL(f) : null,
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50 block mb-1">
                      {t("client")}
                    </Label>
                    <select
                      value={form.clientId}
                      onChange={(e) =>
                        syncField("clientId", e.target.value as Id<"clients">)
                      }
                      className={selectCls}
                    >
                      <option value="" className="bg-[#0f1117]">
                        {t("choose_client")}
                      </option>
                      {clients.map((c) => (
                        <option
                          key={c._id}
                          value={c._id}
                          className="bg-[#0f1117]"
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50 block mb-1">
                      {t("video_type")}
                    </Label>
                    <select
                      value={form.videoType}
                      onChange={(e) =>
                        syncField(
                          "videoType",
                          e.target.value as EditingVideoType,
                        )
                      }
                      className={selectCls}
                    >
                      {videoTypeOptions.map((tox) => (
                        <option
                          key={tox}
                          value={tox}
                          className="bg-[#0f1117] capitalize"
                        >
                          {t(tox)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50 block mb-1">
                      {t("title")}
                    </Label>
                    <Input
                      value={form.title}
                      onChange={(e) => syncField("title", e.target.value)}
                      placeholder={t("title")}
                      className={`${inputCls} ${titleError ? "border-rose-500" : ""}`}
                    />
                    {titleError && (
                      <p className="text-[10px] text-rose-400 mt-1">
                        {titleError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50 block mb-1">
                      {t("status")}
                    </Label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        syncField("status", e.target.value as EditingStatus)
                      }
                      className={selectCls}
                    >
                      {statusOrder.map((s) => (
                        <option
                          key={s}
                          value={s}
                          className="bg-[#0f1117] capitalize"
                        >
                          {t(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50 block mb-1">
                      {t("due_date")}
                    </Label>
                    <Input
                      type="date"
                      value={
                        form.dueDate
                          ? new Date(form.dueDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        syncField(
                          "dueDate",
                          e.target.value
                            ? new Date(e.target.value).getTime()
                            : Date.now(),
                        )
                      }
                      className={`${inputCls} ${dateError ? "border-rose-500" : ""}`}
                    />
                    {dateError && (
                      <p className="text-[10px] text-rose-400 mt-1">
                        {dateError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                      {t("subtasks_checklist")}
                    </Label>
                    <button
                      type="button"
                      onClick={() =>
                        syncField("subTasks", [
                          ...form.subTasks,
                          { task: "", done: false },
                        ])
                      }
                      className="flex items-center gap-1 text-xs font-medium text-[#8b5cf6] hover:text-[#7c3aed] transition-colors bg-[#8b5cf6]/10 px-2.5 py-1 rounded-lg"
                    >
                      <Plus className="w-3 h-3" /> {t("add_subtask")}
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {form.subTasks.map((subTask, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]"
                      >
                        <Checkbox
                          checked={subTask.done}
                          onCheckedChange={(checked) =>
                            syncSubTask(index, { done: Boolean(checked) })
                          }
                          className="border-white/20 data-[state=checked]:bg-[#8b5cf6] data-[state=checked]:border-[#8b5cf6] ml-2"
                        />
                        <Input
                          value={subTask.task}
                          onChange={(e) =>
                            syncSubTask(index, { task: e.target.value })
                          }
                          placeholder={t("subtask")}
                          className="bg-transparent border-none focus-visible:ring-0 text-sm px-0 h-8"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            syncField(
                              "subTasks",
                              form.subTasks.filter((_, i) => i !== index),
                            )
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0 mr-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {form.subTasks.length === 0 && (
                      <div className="text-center py-4 border border-dashed border-white/10 rounded-xl text-xs text-white/30">
                        {t("no_subtasks")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-white/[0.05]">
                  <Label className="text-xs text-white/50 block mb-1">
                    {t("notes")}
                  </Label>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#8b5cf6]/50"
                    value={form.notes}
                    onChange={(e) => syncField("notes", e.target.value)}
                    placeholder={t("additional_notes")}
                  />
                </div>
              </form>
            </div>

            <DrawerFooter className="border-t border-white/[0.05] p-4 bg-[#07080c] z-10 sticky bottom-0">
              <button
                form="editing-form"
                type="submit"
                disabled={
                  isSaving || !form.title.trim() || !!titleError || !!dateError
                }
                className="w-full py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCard ? t("save") : t("create")}
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                className="w-full py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-all bg-white/[0.02]"
              >
                {t("cancel")}
              </button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
