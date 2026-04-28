"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthQuery as useQuery, useAuthMutation as useMutation } from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientAvatar } from "@/components/ui/DataDisplay";
import {
  Plus, CalendarDays, CheckCircle2, Clock3,
  Link2, Send, Loader2, AlertTriangle, PenSquare, Share2, Users
} from "lucide-react";
import { useApp } from "@/lib/context_fixed";
import { Client, EditingCard, PublishingPost, PublishingStatus } from "@/types";

const statusConfig: Record<PublishingStatus, { labelKey: string; color: string; bg: string; icon: React.ElementType }> = {
  not_ready: { labelKey: "not_ready",  color: "#94a3b8", bg: "#94a3b818", icon: Clock3 },
  ready:     { labelKey: "ready",      color: "#34d399", bg: "#34d39918", icon: CheckCircle2 },
  published: { labelKey: "published",  color: "#8b5cf6", bg: "#8b5cf618", icon: Send },
};

const platformsList = ["Facebook", "Instagram", "YouTube", "TikTok", "LinkedIn", "Twitter", "Other"];

type ViewMode = "all" | "client" | "overdue" | "week";

function emptyForm(defaultClientId: Id<"clients"> | "" = "") {
  return { 
    clientId: defaultClientId, 
    title: "", 
    caption: "", 
    platform: "Facebook",
    publishDate: Date.now(), 
    linkedEditingId: "", 
    status: "not_ready" as PublishingStatus,
  };
}

const selectCls = "h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-foreground focus:outline-none focus:border-[#8b5cf6]/50";
const inputCls  = "bg-white/[0.05] border-white/10 text-foreground placeholder:text-muted-foreground/30 focus:border-[#8b5cf6]/50";

function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/3 bg-white/10" />
            <Skeleton className="h-3 w-1/4 bg-white/10" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl bg-white/10" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-xl bg-white/10" />
        <Skeleton className="h-14 rounded-xl bg-white/10" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-20 rounded-xl bg-white/10" />
        <Skeleton className="h-8 w-20 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

// Avatar component is now imported from DataDisplay

export default function PublishingPage() {
  const { t, language, formatDate, formatDateTime } = useApp();
  const posts         = useQuery<{ }, PublishingPost[]>(api.publishing.listPublishingPosts, {});
  const clients       = useQuery<{ }, Client[]>(api.clients.listClients, {});
  const editingCards  = useQuery<{ }, EditingCard[]>(api.editing.listEditingCards, {});
  
  const createPost    = useMutation(api.publishing.createPublishingPost);
  const updatePost    = useMutation(api.publishing.updatePublishingPost);
  const deletePost    = useMutation(api.publishing.deletePublishingPost);

  const [viewMode, setViewMode]       = useState<ViewMode>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [open, setOpen]               = useState(false);
  const [editingPost, setEditingPost] = useState<PublishingPost | null>(null);
  const [form, setForm]               = useState(emptyForm());
  const [isSaving, setIsSaving]       = useState(false);

  const clientMap  = useMemo(() => Object.fromEntries((clients || []).map((c: Client) => [c._id, c])) as Record<string, Client>, [clients]);
  const editingMap = useMemo(() => Object.fromEntries((editingCards || []).map((c: EditingCard) => [c._id, c])) as Record<string, EditingCard>, [editingCards]);

  useEffect(() => {
    if (!open) return;
    if (editingPost) {
      const pDate = new Date(editingPost.publishDate);
      setForm({ 
        clientId: editingPost.clientId as Id<"clients">, 
        title: editingPost.title,
        caption: editingPost.caption || "", 
        platform: editingPost.platform || "Facebook",
        publishDate: editingPost.publishDate,
        linkedEditingId: editingPost.linkedEditingId || "", 
        status: editingPost.status,
      });
    } else {
      setForm(emptyForm((clients?.[0]?._id as Id<"clients">) || ""));
    }
  }, [open, editingPost, clients]);


  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 6);
    return [...posts].filter(post => {
      if (viewMode === "client" && clientFilter !== "all" && post.clientId !== clientFilter) return false;
      if (viewMode === "overdue" && !(new Date(post.publishDate).setHours(0,0,0,0) < now.getTime())) return false;
      if (viewMode === "week") {
        const d = new Date(post.publishDate); d.setHours(0,0,0,0);
        if (d < now || d > weekEnd) return false;
      }
      return true;
    }).sort((a, b) => a.publishDate - b.publishDate);
  }, [posts, viewMode, clientFilter]);

  const linkedEditing   = form.linkedEditingId ? editingMap[form.linkedEditingId] : null;
  const linkedReady     = linkedEditing ? linkedEditing.status === "done" : null;
  const effectiveStatus: PublishingStatus = form.status === "published" ? "published" : linkedReady ? "ready" : "not_ready";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) {
      alert("Please select a target client first.");
      return;
    }
    
    setIsSaving(true);
    try {
      
      const payload = {
        clientId: form.clientId as Id<"clients">,
        title: form.title.trim() || t("new_post"),
        caption: form.caption.trim() || undefined,
        platform: form.platform,
        publishDate: form.publishDate,
        linkedEditingId: form.linkedEditingId ? (form.linkedEditingId as Id<"editing_cards">) : undefined,
        status: effectiveStatus,
      };
      if (editingPost) await updatePost({ id: editingPost._id as Id<"publishing_posts">, ...payload });
      else await createPost(payload);
      setOpen(false); setEditingPost(null);
     } catch (err) {
       alert(editingPost ? t("update_failed") : t("create_failed"));
     } finally { setIsSaving(false); }
  };


  const handleDelete = async (id: string) => {
    if (confirm(t("delete_confirm"))) await deletePost({ id: id as Id<"publishing_posts"> });
  };

  const isOverdue = (date: number) => new Date(date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

  // Summary counts
  const counts = useMemo(() => ({
    total:      posts?.length || 0,
     published:  posts?.filter((p: PublishingPost) => p.status === "published").length || 0,
     ready:      posts?.filter((p: PublishingPost) => p.status === "ready").length || 0,
     overdue:    posts?.filter((p: PublishingPost) => isOverdue(p.publishDate) && p.status !== "published").length || 0,
  }), [posts, isOverdue]);

  // Form helpers
  const sync = (key: keyof typeof form, val: any) => {
    setForm(cur => {
      const next = { ...cur, [key]: val };
      if (key === "clientId" && val !== cur.clientId) next.linkedEditingId = "";
      return next;
    });
  };
  const selectedClient = form.clientId ? clientMap[form.clientId] : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#fb7185] mb-1">{t("schedule")}</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{t("publishing")}</h1>
        </div>
        <button
          onClick={() => { setEditingPost(null); setOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02]">
          <Plus className="w-4 h-4" /> {t("new_post")}
        </button>
      </div>

       {/* Stats */}
       {posts && posts.length > 0 && (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t("total_posts"),  value: counts.total,     color: "#8b5cf6" },
            { label: t("published_count"),    value: counts.published,  color: "#34d399" },
            { label: t("ready_count"),        value: counts.ready,      color: "#38bdf8" },
            { label: t("overdue_count"),      value: counts.overdue,    color: "#fb7185" },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-2xl font-bold mb-0.5" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex rounded-xl bg-white/[0.05] p-1 gap-1">
          {(["all", "client", "overdue", "week"] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                viewMode === mode ? "bg-[#8b5cf6] text-white" : "text-muted-foreground hover:text-foreground"
              }`}>
              {mode === "all" ? t("all_types") : mode === "client" ? t("by_client") : mode === "overdue" ? t("overdue") : t("this_week")}
            </button>
          ))}
        </div>
        {viewMode === "client" && (
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}
            className="h-8 rounded-lg border border-white/10 bg-white/[0.05] px-2 text-xs text-white focus:outline-none min-w-[160px]">
             <option value="all" className="bg-[#0f1117]">{t("all_clients")}</option>
                     {clients?.map((c: Client) => <option key={c._id} value={c._id} className="bg-[#0f1117]">{c.name}</option>)}
          </select>
        )}
        <span className="ml-auto text-xs text-white/30">{filteredPosts.length} {t("publishing")}</span>
      </div>

      {/* Posts list */}
      {posts === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.06] p-16 text-center">
          <Send className="w-10 h-10 text-muted-foreground/10 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/30">{t("no_posts_found")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map(post => {
            const client  = clientMap[post.clientId];
            const linked  = post.linkedEditingId ? editingMap[post.linkedEditingId] : null;
            const missingProject = !!post.linkedEditingId && !linked;
            const warning = linked && linked.status !== "done" && post.status !== "published";
            const overdue = isOverdue(post.publishDate) && post.status !== "published";
            const cfg     = statusConfig[post.status];
            const StatusIcon = cfg.icon;

            return (
              <div key={post._id}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-all duration-200 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    <ClientAvatar client={client} size={10} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-base font-semibold text-foreground/90">{post.title}</h3>
                         {warning && (
                           <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                             <AlertTriangle className="w-3 h-3" /> {t("edit_unfinished")}
                           </span>
                         )}
                         {missingProject && (
                           <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-medium border border-rose-500/20">
                             <AlertTriangle className="w-3 h-3" /> Missing Project
                           </span>
                         )}
                         {overdue && !warning && !missingProject && (
                           <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-medium border border-rose-500/20">
                             <Clock3 className="w-3 h-3" /> {t("overdue")}
                           </span>
                         )}
                      </div>
                      <p className="text-xs text-muted-foreground">{client?.name || t("none")} <span className="mx-1">•</span> <span className="font-medium text-[#fb7185]">{post.platform}</span></p>
                    </div>
                  </div>
                  {/* Status badge */}
                  <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 border"
                    style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: `${cfg.color}30` }}>
                    <StatusIcon className="w-3 h-3" />
                    {t(post.status)}
                  </span>
                </div>
                
                {post.caption && (
                  <div className="text-sm text-foreground/70 bg-white/[0.02] p-3 rounded-xl border border-white/5 mb-4 line-clamp-2">
                    {post.caption}
                  </div>
                )}

                {/* Sub grid */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <CalendarDays className="w-3.5 h-3.5" /> {t("publish_date")}
                    </div>
                    <div className={ `text-sm font-semibold ${overdue ? "text-rose-400" : "text-foreground/80"}` }>
                      {formatDate(post.publishDate)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Link2 className="w-3.5 h-3.5" /> {t("linked_video")}
                    </div>
                    <div className="text-sm font-semibold text-foreground/80 truncate">{linked?.title || (post.linkedEditingId ? "Project Deleted" : t("no_project"))}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      {/* WhatsApp icon removed */}
                    </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setEditingPost(post); setOpen(true); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-all bg-white/[0.02]">
                      <PenSquare className="w-3.5 h-3.5" /> {t("edit")}
                    </button>
                    <button onClick={() => handleDelete(post._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/20 text-xs text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v: boolean) => { setOpen(v); if (!v) setEditingPost(null); }}>
        <DialogContent className="bg-card border-white/10 text-foreground sm:max-w-[700px] max-h-[90vh] overflow-y-auto w-[90vw] rounded-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-foreground text-xl">{editingPost ? t("edit_task") : t("create_post")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-2 mt-2">
            
            {/* Client Context */}
            <div className="space-y-2 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
               <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">1. {t("client")}</Label>
               <div className="flex items-center gap-3">
                 {selectedClient ? <ClientAvatar client={selectedClient} size={8} /> : <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Users className="w-4 h-4 text-muted-foreground/20"/></div>}
                 <select value={form.clientId}
                    onChange={e => sync("clientId", e.target.value as Id<"clients">)}
                    className={selectCls}>
                    <option value="" className="bg-[#0f1117]">{t("select_client_first")}</option>
                     {clients?.map((cl: Client) => <option key={cl._id} value={cl._id} className="bg-[#0f1117]">{cl.name}</option>)}
                  </select>
               </div>
            </div>

            <div className="space-y-4">
               <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">2. {t("video_card_details")}</Label>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("linked_video")}</Label>
                    <select value={form.linkedEditingId}
                      onChange={e => sync("linkedEditingId", e.target.value)} className={selectCls}>
                       <option value="" className="bg-[#0f1117]">{t("no_video")}</option>
                        {editingCards?.filter((ed: EditingCard) => !form.clientId || ed.clientId === form.clientId).map((ed: EditingCard) => (
                          <option key={ed._id} value={ed._id} className="bg-[#0f1117]">
                            {ed.title} — ({t(ed.status)})
                          </option>
                        ))}
                    </select>
                     {editingCards && form.clientId && !editingCards.some((ed: EditingCard) => ed.clientId === form.clientId) && (
                      <p className="text-[10px] text-amber-400/60 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {t("no_videos_for_this_client")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("platform")}</Label>
                    <div className="relative">
                       <Share2 className="w-4 h-4 text-muted-foreground/30 absolute left-3 top-3 pointer-events-none" />
                       <select value={form.platform} onChange={e => sync("platform", e.target.value)} className={`${selectCls} pl-9`}>
                         {platformsList.map(p => <option key={p} value={p} className="bg-[#0f1117]">{p}</option>)}
                       </select>
                    </div>
                  </div>
               </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("task_title")}</Label>
                   <Input value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => sync("title", e.target.value)}
                     placeholder={t("title")} className={inputCls} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("publish_date")}</Label>
                      <Input type="datetime-local" className={inputCls}
                        value={new Date(form.publishDate - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => sync("publishDate", new Date(e.target.value).getTime())} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("status")}</Label>
                      <select value={form.status}
                        onChange={e => sync("status", e.target.value as PublishingStatus)} className={selectCls}>
                        <option value="not_ready" className="bg-[#0f1117]">{t("not_ready")}</option>
                        <option value="ready" className="bg-[#0f1117]">{t("ready")}</option>
                        <option value="published" className="bg-[#0f1117]">{t("published")}</option>
                      </select>
                    </div>
                </div>

                 <div className="space-y-1.5">
                   <Label className="text-xs text-muted-foreground">{t("caption_placeholder")}</Label>
                   <textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-[#8b5cf6]/50"
                     value={form.caption} onChange={e => sync("caption", e.target.value)}
                     placeholder={t("caption_placeholder")} />
                 </div>
             </div>
             
             {/* Status preview */}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs font-medium">
               <div className="flex items-center gap-2">
                 <span className="text-muted-foreground/40">{t("linked_editor_status")}:</span>
                 {linkedEditing ? (
                    <span className={`px-2 py-0.5 rounded-full ${linkedEditing.status === "done" ? "bg-[#34d399]/20 text-[#34d399]" : "bg-amber-500/20 text-amber-400"}`}>
                       {t(linkedEditing.status)}
                    </span>
                 ) : (
                    <span className="text-muted-foreground/30">{t("no_project")}</span>
                 )}
               </div>
               <div className="hidden sm:block w-px h-6 bg-white/10" />
               <div className="flex items-center gap-2">
                 <span className="text-muted-foreground/40">{t("computed_publishing_status")}:</span>
                 <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: statusConfig[effectiveStatus].bg, color: statusConfig[effectiveStatus].color }}>
                    {t(effectiveStatus)}
                 </span>
               </div>
            </div>


            <DialogFooter className="gap-2 pt-4 mt-2 border-t border-white/[0.05]">
              <button type="button" onClick={() => setOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-muted-foreground text-sm font-medium hover:text-foreground transition-all bg-white/[0.02]">
                {t("cancel")}
              </button>
              <button type="submit" disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingPost ? t("save_post") : t("create_post")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
