"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useAuthQuery as useQuery,
  useAuthMutation as useMutation,
} from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import {
  Users,
  Search,
  LayoutGrid,
  List,
  Plus,
  MoreVertical,
  Mail,
  Building,
  Phone,
  Globe,
  FileText,
  MessageSquare,
  Wallet,
  Package,
  Pencil,
  ArrowRight,
  UserCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/DataDisplay";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ClientDetailView from "./client-detail-view";

// ─── Utility ──────────────────────────────────────────────────────────────
function getStatusVariant(
  status: string,
): "success" | "warning" | "info" | "danger" {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  if (status === "done") return "info";
  return "danger";
}

const formatCurrency = (amt?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amt || 0);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "No activity";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// ─── Client Modal (Create/Edit) ───────────────────────────────────────────
function ClientModal({
  open,
  onClose,
  clientToEdit,
}: {
  open: boolean;
  onClose: () => void;
  clientToEdit?: any;
}) {
  const createClient = useMutation(api.clients.createClient);
  const updateClient = useMutation(api.clients.updateClient);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    waPhone: "",
    details: "",
  });

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name || "",
        company: clientToEdit.company || "",
        email: clientToEdit.email || "",
        phone: clientToEdit.phone || "",
        waPhone: clientToEdit.waPhone || "",
        details: clientToEdit.details || "",
      });
    } else {
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        waPhone: "",
        details: "",
      });
    }
  }, [clientToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (clientToEdit) {
        await updateClient({ id: clientToEdit._id, ...formData });
      } else {
        await createClient({ ...formData, status: "active" });
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-2 border-[var(--color-border)] p-8 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-black uppercase tracking-tighter">
            {clientToEdit ? "Edit Client" : "New Strategic Partner"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Fill in the professional details for this partnership.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                Full Name
              </Label>
              <Input
                required
                className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium focus:border-[var(--color-brand)] transition-all"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                Company / Brand
              </Label>
              <Input
                className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium focus:border-[var(--color-brand)] transition-all"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
              Email Address
            </Label>
            <Input
              type="email"
              className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium focus:border-[var(--color-brand)] transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                Phone Number
              </Label>
              <Input
                className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium focus:border-[var(--color-brand)] transition-all"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                WhatsApp
              </Label>
              <Input
                className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium focus:border-[var(--color-brand)] transition-all"
                value={formData.waPhone}
                onChange={(e) =>
                  setFormData({ ...formData, waPhone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
              Additional Details
            </Label>
            <textarea
              className="w-full h-32 bg-muted/30 border-2 border-white/5 rounded-xl p-4 font-medium focus:border-[var(--color-brand)] outline-none transition-all resize-none"
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-bold luxury-button luxury-button-primary h-12 px-8"
            >
              {clientToEdit ? "Save Changes" : "Register Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Client Detail Modal ──────────────────────────────────────────────────
function ClientDetailModal({
  open,
  onClose,
  clientId,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        overlayClassName="backdrop-blur-xl"
        className="sm:max-w-[800px] lg:max-w-[900px] rounded-2xl border-2 border-[var(--color-border)] bg-card p-0 overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Client Details</DialogTitle>
          <DialogDescription className="sr-only">
            View and manage detailed information for the selected client.
          </DialogDescription>
        </DialogHeader>
        {clientId && <ClientDetailView clientId={clientId} />}
      </DialogContent>
    </Dialog>
  );
}

// ─── Avatar Modal ──────────────────────────────────────────────────────
function AvatarModal({
  open,
  onClose,
  client,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  client: any;
  onSave: (avatarUrl: string) => void;
}) {
  const [selected, setSelected] = useState<string>("");
  const [customFileUrl, setCustomFileUrl] = useState<string>("");

  const AVATARS = [
    "https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=transparent",
    "https://api.dicebear.com/7.x/micah/svg?seed=Jack&backgroundColor=transparent",
    "https://api.dicebear.com/7.x/micah/svg?seed=Oliver&backgroundColor=transparent",
    "https://api.dicebear.com/7.x/micah/svg?seed=Caleb&backgroundColor=transparent",
    "https://api.dicebear.com/7.x/micah/svg?seed=Leo&backgroundColor=transparent",
    "https://api.dicebear.com/7.x/micah/svg?seed=Casper&backgroundColor=transparent",
  ];

  useEffect(() => {
    if (client?.avatar && AVATARS.includes(client.avatar)) {
      setSelected(client.avatar);
      setCustomFileUrl("");
    } else if (client?.avatar) {
      setSelected("custom");
      setCustomFileUrl(client.avatar);
    } else {
      setSelected("");
      setCustomFileUrl("");
    }
  }, [client, open]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomFileUrl(reader.result as string);
        setSelected("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selected === "custom") onSave(customFileUrl);
    else onSave(selected);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-2 border-[var(--color-border)] bg-card p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-extrabold">
            Profile Picture
          </DialogTitle>
          <DialogDescription>
            Select an avatar or upload a picture for {client?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-8">
          {AVATARS.map((url) => (
            <button
              key={url}
              onClick={() => setSelected(url)}
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105",
                selected === url
                  ? "border-[var(--color-brand)] shadow-lg"
                  : "border-transparent bg-muted/50",
              )}
            >
              <img
                src={url}
                alt="Avatar option"
                className="w-full h-full object-cover"
              />
              {selected === url && (
                <div className="absolute inset-0 bg-[var(--color-brand)]/10 flex items-center justify-center">
                  <div className="bg-[var(--color-brand)] text-white p-1 rounded-full">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              )}
            </button>
          ))}
          <label
            className={cn(
              "relative aspect-square rounded-2xl overflow-hidden border-4 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all",
              selected === "custom" &&
                "border-[var(--color-brand)] border-solid bg-muted/50",
            )}
          >
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
            {customFileUrl ? (
              <img
                src={customFileUrl}
                alt="Custom upload"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Plus className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Upload
                </span>
              </>
            )}
          </label>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="ghost" onClick={onClose} className="font-bold">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="font-bold luxury-button luxury-button-primary"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Client Card (Grid View) ──────────────────────────────────────────────────
function ClientCard({
  client,
  index,
  onEdit,
  onViewDetails,
  onUpdateAvatar,
}: {
  client: any;
  index: number;
  onEdit: (c: any) => void;
  onViewDetails: (id: string) => void;
  onUpdateAvatar: (c: any) => void;
}) {
  const stats = client.stats || {
    totalBudget: 0,
    activeDeliverablesCount: 0,
    lastActivityDate: "",
  };

  return (
    <div
      onClick={() => onViewDetails(client._id)}
      className="group luxury-card p-8 cursor-pointer animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-8">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onUpdateAvatar(client);
          }}
          className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-muted border-2 border-[var(--color-border)] flex items-center justify-center font-black text-2xl group/avatar"
          style={{ color: `var(--color-brand)` }}
        >
          {client.avatar ? (
            <img
              src={client.avatar}
              alt={client.name}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            client.name.charAt(0).toUpperCase()
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
            <Pencil className="h-5 w-5 text-white" />
          </div>
        </div>
        <StatusBadge variant={getStatusVariant(client.status)}>
          {client.status || "inactive"}
        </StatusBadge>
      </div>

      <div className="space-y-1 mb-8">
        <h3 className="text-2xl font-heading font-black tracking-tight group-hover:text-[var(--color-brand)] transition-colors line-clamp-1">
          {client.name}
        </h3>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <Building className="h-4 w-4 opacity-50" />
          <span className="truncate">
            {client.company || "Individual Client"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 py-6 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
          <Wallet className="h-3 w-3 text-[var(--color-brand)]" />
          <span className="font-bold text-foreground">
            Total: {formatCurrency(stats.totalBudget)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground font-sans">
          <FileText className="h-3 w-3 text-[var(--color-brand)]" />
          <span>{stats.activeDeliverablesCount} Videos Editing</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(client);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-[var(--color-brand)] hover:text-white transition-all"
            title="Edit Client"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(client._id);
          }}
          className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)] hover:underline"
        >
          Details →
        </button>
      </div>
    </div>
  );
}

// ─── Client Row (List View) ───────────────────────────────────────────────────
function ClientRow({
  client,
  index,
  onViewDetails,
}: {
  client: any;
  index: number;
  onViewDetails: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onViewDetails(client._id)}
      className="group luxury-card flex items-center justify-between p-4 cursor-pointer animate-in fade-in slide-in-from-left-4 fill-mode-both"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <div
          className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted border border-[var(--color-border)] flex items-center justify-center font-black text-sm"
          style={{
            background: `var(--color-brand)15`,
            color: `var(--color-brand)`,
          }}
        >
          {client.avatar ? (
            <img
              src={client.avatar}
              alt={client.name}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
            />
          ) : (
            client.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-bold text-lg leading-none">
            {client.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {client.company || "Client"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:block">
          <StatusBadge variant={getStatusVariant(client.status)}>
            {client.status || "inactive"}
          </StatusBadge>
        </div>
        <div className="hidden lg:block text-sm text-muted-foreground w-36 text-right truncate">
          {client.phone || client.email || "—"}
        </div>

        <div className="flex items-center gap-2 translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          {client.email && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:${client.email}`);
              }}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)] transition-colors"
              title="Send Email"
            >
              <Mail className="h-4 w-4" />
            </button>
          )}
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const clients = useQuery(api.clients.listClientsWithStats, {});
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "paused" | "archived">(
    "active",
  );
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarClient, setAvatarClient] = useState<any>(null);
  const updateClient = useMutation(api.clients.updateClient);

  const openDetailModal = (id: string) => {
    setSelectedClientId(id);
    setShowDetailModal(true);
  };

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const q = search.toLowerCase();
    return clients.filter((c: any) => {
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q);

      let matchesTab = false;
      if (activeTab === "active")
        matchesTab = c.status === "active" || c.status === "done" || !c.status;
      else if (activeTab === "paused") matchesTab = c.status === "paused";
      else if (activeTab === "archived") matchesTab = c.status === "archived";

      return matchesSearch && matchesTab;
    });
  }, [clients, search, activeTab]);

  const openCreateModal = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const openEditModal = (client: any) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const openAvatarModal = (client: any) => {
    setAvatarClient(client);
    setShowAvatarModal(true);
  };

  const handleSaveAvatar = async (avatarUrl: string) => {
    if (!avatarClient) return;
    try {
      await updateClient({ id: avatarClient._id, avatar: avatarUrl });
    } catch (e) {
      console.error("Failed to update avatar", e);
    }
  };

  if (clients === undefined) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-16 w-48 bg-muted animate-pulse rounded-xl" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-muted animate-pulse rounded-xl border-2 border-[var(--color-border)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-full">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] z-0"
          style={{
            backgroundImage: `radial-gradient(var(--color-ink-primary) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 space-y-12">
          <div className="sticky top-0 z-20 bg-[var(--color-surface-0)] pt-2 pb-6 -mx-4 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-heading font-extrabold uppercase tracking-tighter leading-none">
                  Clients
                </h1>
                <p className="text-muted-foreground font-medium max-w-md text-sm">
                  A curated gallery of professional relationships and strategic
                  partnerships.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 bg-card border-2 border-[var(--color-border)] p-1 rounded-lg">
                  <Button
                    variant={view === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("grid")}
                    className={cn(
                      "h-8 w-8 p-0",
                      view === "grid" &&
                        "shadow-[2px_2px_0px_0px_var(--color-border)]",
                    )}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("list")}
                    className={cn(
                      "h-8 w-8 p-0",
                      view === "list" && "shadow-sm",
                    )}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={openCreateModal}
                  className="h-10 px-6 font-bold luxury-button luxury-button-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Client
                </Button>
              </div>
            </div>

            <div className="mt-6 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-[var(--color-brand)]" />
              <Input
                id="clients-search"
                name="clients-search"
                placeholder="Search by name, company, or email..."
                className="h-14 pl-12 text-base font-medium border-2 border-[var(--color-border)] focus:border-[var(--color-brand)] transition-all bg-card rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-full w-fit border border-white/10 shadow-inner mt-4">
              <button
                onClick={() => setActiveTab("active")}
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  activeTab === "active"
                    ? "bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-105"
                    : "text-muted-foreground hover:text-white hover:bg-white/5",
                )}
              >
                Active Clients
                {activeTab === "active" && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-glow" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("paused")}
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  activeTab === "paused"
                    ? "bg-[#f59e0b] text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105"
                    : "text-muted-foreground hover:text-white hover:bg-white/5",
                )}
              >
                Paused
              </button>

              <button
                onClick={() => setActiveTab("archived")}
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  activeTab === "archived"
                    ? "bg-[#6b7280] text-white shadow-[0_0_20px_rgba(107,114,128,0.4)] scale-105"
                    : "text-muted-foreground hover:text-white hover:bg-white/5",
                )}
              >
                Archived
              </button>
            </div>
          </div>

          <div
            className={cn(
              "transition-all duration-500 ease-in-out",
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col gap-0 border-t-2 border-[var(--color-border)]",
            )}
          >
            {filteredClients.map((client, i) =>
              view === "grid" ? (
                <ClientCard
                  key={client._id}
                  client={client}
                  index={i}
                  onEdit={openEditModal}
                  onViewDetails={openDetailModal}
                  onUpdateAvatar={openAvatarModal}
                />
              ) : (
                <ClientRow
                  key={client._id}
                  client={client}
                  index={i}
                  onViewDetails={openDetailModal}
                />
              ),
            )}
          </div>

          {filteredClients.length === 0 && (
            <div className="py-20 text-center text-muted-foreground font-bold">
              {search
                ? `No match found for "${search}"`
                : "No clients found in this category."}
            </div>
          )}
        </div>
      </div>

      <ClientModal
        open={showModal}
        onClose={() => setShowModal(false)}
        clientToEdit={editingClient}
      />
      <ClientDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        clientId={selectedClientId || ""}
      />
      <AvatarModal
        open={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        client={avatarClient}
        onSave={handleSaveAvatar}
      />
    </>
  );
}
