"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useAuthQuery as useQuery,
  useAuthMutation as useMutation,
} from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import { ProjectModal } from "@/components/clients/project-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Edit2,
  Trash2,
  AlertCircle,
  Wallet,
  TrendingUp,
  MessageCircle,
  ExternalLink,
  UserCheck,
  Calendar,
  DollarSign,
  CreditCard,
  Info,
  Archive,
  X,
  Database,
  Zap,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { Client, Project, Payment, Note } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import { StatusBadge, ClientAvatar } from "@/components/ui/DataDisplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const NOTE_COLORS = {
  purple: {
    bg: "bg-[#E9D5FF]",
    text: "text-[#6B21A8]",
    border: "border-[#D8B4FE]",
    shadow: "shadow-purple-200",
  },
  gold: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#92400E]",
    border: "border-[#FDE68A]",
    shadow: "shadow-amber-200",
  },
  blue: {
    bg: "bg-[#DBEAFE]",
    text: "text-[#1E40AF]",
    border: "border-[#BFDBFE]",
    shadow: "shadow-blue-200",
  },
  charcoal: {
    bg: "bg-[#E5E7EB]",
    text: "text-[#374151]",
    border: "border-[#D1D5DB]",
    shadow: "shadow-gray-200",
  },
};

const COLOR_KEYS = Object.keys(NOTE_COLORS);

function getStatusVariant(
  status: string,
): "success" | "warning" | "info" | "danger" {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  return "info";
}

function StickyNote({
  note,
  updateNote,
  deleteNote,
  onClick,
}: {
  note: Note;
  updateNote: (args: { noteId: string; content: string }) => Promise<void>;
  deleteNote: (args: { noteId: string }) => Promise<void>;
  onClick: () => void;
}) {
  const colors =
    NOTE_COLORS[note.color as keyof typeof NOTE_COLORS] || NOTE_COLORS.charcoal;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 shadow-sm cursor-pointer transition-all hover:scale-105 hover:shadow-md group ${colors.bg} ${colors.border}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="w-2 h-2 rounded-full bg-current opacity-40" />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${colors.text} hover:bg-white/50`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${colors.text} hover:bg-white/50 text-destructive`}
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm("Delete this note?")) {
                await deleteNote({ noteId: note._id });
              }
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <p className={`text-sm font-body line-clamp-4 ${colors.text}`}>
        {note.content ?? (
          <span className="italic opacity-50">Empty note...</span>
        )}
      </p>
    </div>
  );
}

function ExpandedNoteModal({
  isOpen,
  onClose,
  note,
  updateNote,
}: {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  updateNote: (args: { noteId: string; content: string }) => Promise<void>;
}) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) setContent(note.content || "");
  }, [note]);

  const handleSave = async () => {
    if (note) {
      await updateNote({ noteId: note._id, content });
    }
  };

  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        overlayClassName="backdrop-blur-xl"
        className="max-w-4xl bg-card border-2 border-[var(--color-border)] p-0 overflow-hidden"
      >
        <DialogHeader className="p-6 border-b-2 border-[var(--color-border)] flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tighter">
            Note Editor
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div
          className="p-8 bg-[#fffdf0] min-h-[60vh]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 31px, #cbd5e1 31px, #cbd5e1 32px)",
          }}
        >
          <textarea
            dir="auto"
            className="w-full h-full min-h-[50vh] bg-transparent border-none focus:ring-0 text-slate-900 resize-none p-0 leading-[32px] text-[16px] font-body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Start writing your luxury note..."
          />
        </div>
        <div className="p-6 border-t-2 border-[var(--color-border)] flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-bold text-xs"
          >
            Close
          </Button>
          <Button
            onClick={handleSave}
            className="font-bold luxury-button luxury-button-primary text-xs"
          >
            Save Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ClientDetailViewProps {
  clientId: string;
}

function SimpleStatusSelect({
  value,
  onChange,
  onArchive,
}: {
  value: string;
  onChange: (v: string) => void;
  onArchive: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statuses = [
    { label: "Active", value: "active", color: "text-green-500" },
    { label: "Done", value: "done", color: "text-blue-500" },
    { label: "Archive", value: "archived", color: "text-red-500" },
  ];

  const currentStatus = statuses.find((s) => s.value === value) || statuses[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="h-10 px-6 rounded-full font-bold text-sm bg-transparent border-2 border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 outline-none focus:ring-0"
      >
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-white/40" />
          <span className={cn("capitalize", currentStatus.color)}>
            {currentStatus.label}
          </span>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-2 w-[160px] bg-[#121217] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[9999] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {statuses.map((s) => (
            <div
              key={s.value}
              onClick={() => {
                if (s.value === "archived") onArchive();
                else onChange(s.value);
                setIsOpen(false);
              }}
              className="flex items-center justify-between px-5 py-3 text-sm font-bold cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className={s.color}>{s.label}</span>
              {value === s.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const client = useQuery(api.clients.getClient, {
    id: clientId as Id<"clients">,
  }) as Client | undefined | null;
  const projectsList =
    useQuery(api.projects.listProjectsByClient, {
      clientId: clientId as Id<"clients">,
    }) || [];
  const paymentsList =
    useQuery(api.payments.listPaymentsByClient, {
      clientId: clientId as Id<"clients">,
    }) || [];
  const notes =
    useQuery(api.notes.listNotesByClient, {
      clientId: clientId as Id<"clients">,
    }) || [];
  const updateClient = useMutation(api.clients.updateClient);
  const deleteClientMutation = useMutation(api.clients.deleteClient);
  const deleteProject = useMutation(api.projects.deleteProject);
  const createPayment = useMutation(api.payments.createPayment);
  const updatePayment = useMutation(api.payments.updatePayment);
  const deletePayment = useMutation(api.payments.deletePayment);

  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isExpandedNoteOpen, setIsExpandedNoteOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    email: "",
    phone: "",
    facebookPage: "",
    address: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paidAmount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    status: "paid" as "paid" | "pending",
    details: "",
    id: "" as string | null,
  });

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleEditContact = () => {
    setContactForm({
      email: client?.email || "",
      phone: client?.phone || "",
      facebookPage: client?.facebookPage || "",
      address: client?.address || "",
    });
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async () => {
    try {
      await updateClient({
        id: clientId as Id<"clients">,
        ...contactForm,
      });
      setIsContactModalOpen(false);
    } catch (e) {
      alert("Failed to update contact information.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject({ id: id as Id<"projects"> });
      } catch {
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  const handleUpdateStatus = async () => {
    const newStatus = prompt(
      "Enter new status (active, paused, done):",
      client?.status,
    );
    if (newStatus && newStatus !== client?.status) {
      try {
        await updateClient({
          id: clientId as Id<"clients">,
          status: newStatus as any,
        });
      } catch {
        alert("Failed to update status.");
      }
    }
  };

  const handleArchiveClient = async () => {
    if (
      confirm(
        "Are you sure you want to archive this client? This will remove them from your active list.",
      )
    ) {
      try {
        await deleteClientMutation({ id: clientId as Id<"clients"> });
        // In a modal view, we might want to notify the parent to close the modal or refresh.
        // For now, we'll alert success.
        alert("Client archived successfully.");
      } catch {
        alert("Failed to archive client.");
      }
    }
  };

  const handleSavePayment = async () => {
    if (!paymentForm.description.trim() || !paymentForm.amount) {
      alert("Please provide the Payment Purpose and the Total Amount.");
      return;
    }

    try {
      const amountNum = parseFloat(paymentForm.amount) || 0;
      const paidNum = parseFloat(paymentForm.paidAmount) || 0;

      if (paymentForm.id) {
        await updatePayment({
          paymentId: paymentForm.id as Id<"payments">,
          amount: amountNum,
          paidAmount: paidNum,
          date: paymentForm.date,
          description: paymentForm.description,
          status: paymentForm.status,
          details: paymentForm.details,
        });
      } else {
        await createPayment({
          clientId: clientId as Id<"clients">,
          amount: amountNum,
          paidAmount: paidNum,
          date: paymentForm.date,
          description: paymentForm.description,
          status: paymentForm.status,
          details: paymentForm.details,
        });
      }
      handleNewPayment();
    } catch (e) {
      alert("Failed to save payment.");
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setPaymentForm({
      amount: payment.amount?.toString() ?? "",
      paidAmount: payment.paidAmount?.toString() ?? "",
      date: payment.date,
      description: payment.description,
      status: (payment.status as "paid" | "pending") ?? "paid",
      details: payment.details ?? "",
      id: payment._id,
    });
  };

  const handleDeletePayment = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      try {
        await deletePayment({ paymentId: id as Id<"payments"> });
      } catch {
        alert("Failed to delete payment.");
      }
    }
  };

  const handleNewPayment = () => {
    setPaymentForm({
      amount: "",
      paidAmount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      status: "paid",
      details: "",
      id: null,
    });
  };

  if (!clientId)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Invalid Client ID</p>
      </div>
    );

  if (client === undefined)
    return (
      <div className="space-y-8">
        <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 w-full bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );

  if (client === null)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-heading font-bold">Client Not Found</h2>
          <p className="text-muted-foreground">
            This client doesn&apos;t exist or was removed.
          </p>
        </div>
      </div>
    );

  const initials = client.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const totalBudget = (paymentsList as Payment[]).reduce(
    (sum: number, p: Payment) => sum + (p.amount || 0),
    0,
  );
  // totalPaid is sum of paidAmount field in payments
  const totalPaid = (Array.isArray(paymentsList) ? paymentsList : []).reduce(
    (sum, p: any) => sum + (p.paidAmount || 0),
    0,
  );

  const pendingAmount = Math.max(0, totalBudget - totalPaid);
  const activeProjects = (
    Array.isArray(projectsList) ? projectsList : []
  ).filter((p: any) => p.status !== "done").length;
  const totalDeliverables = (
    Array.isArray(projectsList) ? projectsList : []
  ).reduce((sum, p: any) => sum + (p.deliverables?.length || 0), 0);
  const nextDeadline = (Array.isArray(projectsList) ? projectsList : []).filter(
    (p: any) => p.status !== "done",
  );

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="relative p-8 rounded-3xl overflow-hidden border-2 border-[var(--color-border)] bg-card">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <ClientAvatar
              client={client}
              size={20}
              className="w-20 h-20 shadow-xl border-2"
            />
            <div>
              <h1 className="text-5xl font-heading font-extrabold tracking-tighter bg-gradient-to-r from-white to-muted-foreground bg-clip-text text-transparent">
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge variant={getStatusVariant(client.status)}>
                  {client.status}
                </StatusBadge>
                {client.company && (
                  <span className="text-muted-foreground font-medium">
                    {client.company}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="h-10 px-6 rounded-full font-bold text-sm bg-transparent border-white/10 hover:bg-green-600/10 hover:text-green-500 hover:border-green-500/50 transition-all gap-2"
              onClick={() => {
                const phone = client.phone?.replace(/\D/g, "");
                if (phone) window.open(`https://wa.me/${phone}`, "_blank");
                else alert("Phone number not set.");
              }}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>

            <Button
              variant="outline"
              className="h-10 px-6 rounded-full font-bold text-sm bg-transparent border-white/10 hover:bg-blue-600/10 hover:text-blue-500 hover:border-blue-500/50 transition-all gap-2"
              onClick={() => {
                if (client.facebookPage) {
                  const url = client.facebookPage.startsWith("http")
                    ? client.facebookPage
                    : `https://${client.facebookPage}`;
                  window.open(url, "_blank");
                } else alert("Facebook page not set.");
              }}
            >
              <Globe className="h-4 w-4" /> Facebook
            </Button>

            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() =>
                  updateClient({
                    id: clientId as Id<"clients">,
                    status: "active" as any,
                  })
                }
                className={cn(
                  "h-9 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
                  client.status === "active"
                    ? "bg-green-500/20 text-green-500 border border-green-500/30"
                    : "text-white/40 hover:text-white/60",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    client.status === "active" ? "bg-green-500" : "bg-white/20",
                  )}
                />
                Active
              </button>
              <button
                type="button"
                onClick={() =>
                  updateClient({
                    id: clientId as Id<"clients">,
                    status: "done" as any,
                  })
                }
                className={cn(
                  "h-9 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
                  client.status === "done"
                    ? "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                    : "text-white/40 hover:text-white/60",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    client.status === "done" ? "bg-blue-500" : "bg-white/20",
                  )}
                />
                Done
              </button>
              <button
                type="button"
                onClick={handleArchiveClient}
                className={cn(
                  "h-9 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
                  (client.status as string) === "archived"
                    ? "bg-red-500/20 text-red-500 border border-red-500/30"
                    : "text-white/40 hover:text-white/60",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    (client.status as string) === "archived"
                      ? "bg-red-500"
                      : "bg-white/20",
                  )}
                />
                Archive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Card */}
        <div
          className="luxury-card p-6 space-y-6 relative overflow-hidden group cursor-pointer hover:border-[var(--color-brand)] transition-all"
          onClick={handleEditContact}
        >
          <h3 className="text-xl font-heading font-bold uppercase tracking-tight flex items-center gap-2">
            <Phone className="h-5 w-5 text-[var(--color-brand)]" /> Contact Info
          </h3>
          <div className="space-y-4 font-body">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm truncate">{client.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm truncate">
                {client.facebookPage || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.address || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Financials Summary Card */}
        <div
          className="md:col-span-2 luxury-card p-8 cursor-pointer hover:border-[var(--color-brand)] transition-all group relative overflow-hidden"
          onClick={() => setIsPaymentModalOpen(true)}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="h-24 w-24" />
          </div>

          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-tighter flex items-center gap-2">
              <Wallet className="h-6 w-6 text-[var(--color-brand)]" />{" "}
              FINANCIALS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Day
                </p>
                <p className="text-xl font-body font-bold">{today}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Total Budget
                </p>
                <p className="text-xl font-body font-bold">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Remaining
                </p>
                <p
                  className={`text-xl font-body font-bold ${pendingAmount > 0 ? "text-orange-500" : "text-green-500"}`}
                >
                  ${pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground group-hover:text-[var(--color-brand)] transition-colors">
              <Info className="h-3 w-3" /> Click to manage payments
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <Button
              asChild
              className="h-14 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-2xl flex items-center justify-between px-5 group transition-all duration-300 shadow-lg shadow-purple-500/10 hover:scale-[1.02] border-none cursor-pointer"
            >
              <Link href={`/calendar?new=true&clientId=${clientId}`}>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 fill-white" />
                  <span className="text-xs font-black uppercase tracking-widest italic">
                    New Project
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-all" />
              </Link>
            </Button>

            <Button
              asChild
              className="h-14 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-2xl flex items-center justify-between px-5 group transition-all duration-300 shadow-lg shadow-purple-500/10 hover:scale-[1.02] border-none cursor-pointer"
            >
              <Link href="/clients">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest italic">
                    Client Hub
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-all" />
              </Link>
            </Button>

            <Button
              asChild
              className="h-14 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-2xl flex items-center justify-between px-5 group transition-all duration-300 shadow-lg shadow-purple-500/10 hover:scale-[1.02] border-none cursor-pointer"
            >
              <Link href="/calendar">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest italic">
                    Calendar
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-all" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-between border-b-2 border-[var(--color-border)] pb-4">
            <h2 className="text-3xl font-heading font-extrabold uppercase tracking-tighter">
              Project Pipeline
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body">
              <thead>
                <tr className="text-xs font-bold uppercase text-muted-foreground border-b border-[var(--color-border)]">
                  <th className="pb-4 pl-4">Project</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Progress</th>
                  <th className="pb-4 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {(Array.isArray(projectsList) ? projectsList.length : 0) ===
                0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No projects linked to this client.
                    </td>
                  </tr>
                ) : (
                  (Array.isArray(projectsList) ? projectsList : []).map(
                    (project: any) => {
                      const completed = (project.deliverables ?? []).filter(
                        (d: any) => d.done,
                      ).length;
                      const progress =
                        (project.deliverables ?? []).length > 0
                          ? (completed / (project.deliverables ?? []).length) *
                            100
                          : 0;
                      return (
                        <tr
                          key={project._id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 pl-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">
                                {project.projectName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ${(project.budget ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <StatusBadge
                              variant={getStatusVariant(project.status)}
                            >
                              {project.status}
                            </StatusBadge>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[var(--color-brand)]"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">
                                {Math.round(progress)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-right pr-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProject(project)}
                                className="h-8 w-8"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProject(project._id)}
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {project.link && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  asChild
                                >
                                  <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center border-b-2 border-[var(--color-border)] pb-4">
            <h2 className="text-3xl font-heading font-extrabold uppercase tracking-tighter">
              STICKY NOTES
            </h2>
          </div>

          <div
            className="luxury-card p-6 min-h-[200px] relative overflow-hidden group cursor-pointer hover:border-[var(--color-brand)] transition-all"
            onClick={() => setIsNotesModalOpen(true)}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="h-12 w-12" />
            </div>
            <div className="relative space-y-6">
              <div className="flex flex-wrap gap-3">
                {(Array.isArray(notes) ? notes : []).map((note: any) => (
                  <p className="text-sm font-body text-muted-foreground italic">
                    No sticky notes yet.
                  </p>
                ) : (
                  (Array.isArray(notes) ? notes : []).map((note: any) => (
                    <div
                      key={note._id}
                      className={`w-10 h-10 rounded-lg border-2 shadow-sm transition-transform group-hover:scale-110 ${
                        note.color === "purple"
                          ? "bg-purple-200 border-purple-300"
                          : note.color === "gold"
                            ? "bg-amber-100 border-amber-200"
                            : note.color === "blue"
                              ? "bg-blue-100 border-blue-200"
                              : "bg-gray-200 border-gray-300"
                      }`}
                    />
                  ))
                )}
              </div>
              <Button
                variant="outline"
                className="w-full gap-2 text-xs font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotesModalOpen(true);
                }}
              >
                <Plus className="h-3 w-3" /> Add Note
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="destructive"
              className="gap-2 font-bold luxury-button"
              onClick={handleArchiveClient}
            >
              <Archive className="h-4 w-4" /> Archive Client
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-2 border-[var(--color-border)] p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b-2 border-[var(--color-border)]">
            <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tighter">
              Edit Contact Information
            </DialogTitle>
            <DialogDescription className="sr-only">
              Update the contact details for this client.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">
                  Email Address
                </label>
                <Input
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="bg-background border-[var(--color-border)]"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">
                  Phone Number
                </label>
                <Input
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phone: e.target.value })
                  }
                  className="bg-background border-[var(--color-border)]"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">
                  Facebook Page URL
                </label>
                <Input
                  value={contactForm.facebookPage}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      facebookPage: e.target.value,
                    })
                  }
                  className="bg-background border-[var(--color-border)]"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">
                  Physical Address
                </label>
                <Input
                  value={contactForm.address}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, address: e.target.value })
                  }
                  className="bg-background border-[var(--color-border)]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsContactModalOpen(false)}
                className="font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveContact}
                className="gap-2 font-bold luxury-button luxury-button-primary text-xs"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProjectModal
        key={selectedProject?._id || "new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId as Id<"clients">}
        project={selectedProject || undefined}
      />

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-7xl h-[95vh] bg-[#0a0a0c] border-2 border-white/10 p-0 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader className="p-10 border-b border-white/5 flex-shrink-0 bg-gradient-to-r from-card to-card/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#8b5cf6]">
                  Financial Ledger
                </p>
                <DialogTitle className="text-5xl font-black italic uppercase tracking-tighter text-white">
                  Payment Management
                </DialogTitle>
                <DialogDescription className="text-white/40 text-sm font-medium">
                  Detailed financial tracking for {client?.name}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-full hover:bg-white/10 w-12 h-12"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-10 space-y-12">
            {/* Statistics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Total Value
                </p>
                <p className="text-3xl font-black italic text-white">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-500/[0.03] border border-green-500/20 rounded-2xl p-6 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-500/50">
                  Total Paid
                </p>
                <p className="text-3xl font-black italic text-green-400">
                  ${totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-500/[0.03] border border-red-500/20 rounded-2xl p-6 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/50">
                  Total Pending
                </p>
                <p className="text-3xl font-black italic text-red-400">
                  ${pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment Form Shell */}
            <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <CreditCard className="w-40 h-40" />
              </div>

              <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
                  <div className="relative w-12 h-12 rounded-full bg-[#1a1a1e] flex items-center justify-center text-[#8b5cf6] border border-white/10 shadow-2xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  {paymentForm.id ? "Modify Record" : "Payment Adding"}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Purpose Field (What is this for?) */}
                <div className="lg:col-span-2 space-y-3">
                  <label className="text-[11px] uppercase font-black tracking-widest text-white/40 pl-1">
                    Payment Purpose / Source
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <Input
                      placeholder="e.g. Website First Deposit, Social Media Ad Budget..."
                      value={paymentForm.description}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          description: e.target.value,
                        })
                      }
                      className="bg-white/[0.03] border-white/10 h-14 pl-12 text-lg font-medium focus:border-[#8b5cf6]/50 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] uppercase font-black tracking-widest text-white/40 pl-1">
                    Total Amount (Target)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: e.target.value,
                        })
                      }
                      className="bg-white/[0.03] border-white/10 h-14 pl-12 text-xl font-black italic focus:border-[#8b5cf6]/50 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] uppercase font-black tracking-widest text-white/40 pl-1">
                    Paid Amount (So Far)
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500/40" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={paymentForm.paidAmount}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          paidAmount: e.target.value,
                        })
                      }
                      className="bg-white/[0.03] border-white/10 h-14 pl-12 text-xl font-black italic text-green-400 focus:border-green-500/50 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[11px] uppercase font-black tracking-widest text-white/40">
                      Date of Entry
                    </label>
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <Input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, date: e.target.value })
                    }
                    className="bg-white/[0.03] border-white/10 h-14 px-6 text-base text-white font-bold focus:border-[#8b5cf6]/50 rounded-2xl"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] uppercase font-black tracking-widest text-white/40 pl-1">
                    Payment Status
                  </label>
                  <div className="flex bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl h-14">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentForm({ ...paymentForm, status: "paid" })
                      }
                      className={cn(
                        "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        paymentForm.status === "paid"
                          ? "bg-green-500 text-white shadow-lg"
                          : "text-white/30 hover:text-white/50",
                      )}
                    >
                      ✅ Paid
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentForm({ ...paymentForm, status: "pending" })
                      }
                      className={cn(
                        "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        paymentForm.status === "pending"
                          ? "bg-orange-500 text-white shadow-lg"
                          : "text-white/30 hover:text-white/50",
                      )}
                    >
                      ⏳ Pending
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <label className="text-[11px] uppercase font-black tracking-widest text-white/40 pl-1">
                    Extended Details / Comments
                  </label>
                  <Input
                    placeholder="Add more specific details about this transaction..."
                    value={paymentForm.details}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        details: e.target.value,
                      })
                    }
                    className="bg-white/[0.03] border-white/10 h-14 px-6 text-base focus:border-[#8b5cf6]/50 rounded-2xl"
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6 items-end">
                  {paymentForm.id && (
                    <Button
                      variant="ghost"
                      onClick={handleNewPayment}
                      className="h-14 px-8 font-bold uppercase text-xs tracking-[0.2em] hover:bg-white/5"
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button
                    onClick={handleSavePayment}
                    className="h-14 px-12 font-black uppercase text-sm tracking-[0.2em] italic bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:scale-[1.02] transition-all"
                  >
                    {paymentForm.id ? "Update Transaction" : "Commit Payment"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="space-y-6">
              <h3 className="text-xl font-black italic uppercase tracking-widest text-white/60 pl-2">
                Transaction History
              </h3>
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 bg-white/[0.01]">
                      <th className="py-6 pl-8">Entry Date</th>
                      <th className="py-6">Purpose / Description</th>
                      <th className="py-6">Financials (Paid/Total)</th>
                      <th className="py-6">State</th>
                      <th className="py-6 text-right pr-8">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(Array.isArray(paymentsList) ? paymentsList.length : 0) ===
                    0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-20">
                            <Database className="w-12 h-12" />
                            <p className="text-sm font-bold uppercase tracking-widest">
                              No transactions discovered
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      (Array.isArray(paymentsList) ? paymentsList : []).map(
                        (payment: any) => {
                          const remaining =
                            payment.amount - (payment.paidAmount || 0);
                          return (
                            <tr
                              key={payment._id}
                              className="group hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-6 pl-8">
                                <span className="text-sm font-bold text-white/60">
                                  {payment.date}
                                </span>
                              </td>
                              <td className="py-6">
                                <div className="space-y-1">
                                  <p className="text-base font-bold text-white">
                                    {payment.description}
                                  </p>
                                  {payment.details && (
                                    <p className="text-xs text-white/30 truncate max-w-xs">
                                      {payment.details}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-6">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-black italic text-green-400">
                                    $
                                    {(payment.paidAmount || 0).toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-white/20">
                                    /
                                  </span>
                                  <span className="text-sm font-bold text-white/40">
                                    ${payment.amount.toLocaleString()}
                                  </span>
                                </div>
                                {remaining > 0 && (
                                  <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-1">
                                    Pending: ${remaining.toLocaleString()}
                                  </p>
                                )}
                              </td>
                              <td className="py-6">
                                <div
                                  className={cn(
                                    "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    payment.status === "paid"
                                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                                      : "bg-orange-500/10 text-orange-400 border-orange-500/20",
                                  )}
                                >
                                  {payment.status}
                                </div>
                              </td>
                              <td className="py-6 text-right pr-8">
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditPayment(payment)}
                                    className="h-10 w-10 bg-white/5 hover:bg-white/10 rounded-xl"
                                  >
                                    <Edit2 className="h-4 w-4 text-[#8b5cf6]" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeletePayment(payment._id)
                                    }
                                    className="h-10 w-10 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        },
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="max-w-7xl bg-card border-2 border-[var(--color-border)] p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b-2 border-[var(--color-border)] flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tighter">
                Sticky Notes Workspace
              </DialogTitle>
              <DialogDescription className="sr-only">
                Create and manage sticky notes for the client.
              </DialogDescription>
            </div>
            <Button
              onClick={async () => {
                const randomColor =
                  COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
                await createNote({
                  clientId: clientId as Id<"clients">,
                  content: "",
                  color: randomColor,
                });
              }}
              className="gap-2 font-bold luxury-button luxury-button-primary text-xs"
            >
              <Plus className="h-4 w-4" /> New Note
            </Button>
          </DialogHeader>

          <div className="p-10 bg-muted/20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {notes.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <p className="text-muted-foreground font-body italic">
                    No sticky notes yet. Create your first one!
                  </p>
                </div>
              ) : (
                notes.map((note: any) => (
                  <StickyNote
                    key={note._id}
                    note={note}
                    updateNote={updateNote}
                    deleteNote={deleteNote}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsExpandedNoteOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedNote && (
        <ExpandedNoteModal
          isOpen={isExpandedNoteOpen}
          onClose={() => setIsExpandedNoteOpen(false)}
          note={selectedNote}
          updateNote={updateNote}
        />
      )}
    </div>
  );
}
