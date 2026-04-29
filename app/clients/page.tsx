"use client";

import React, { useState, useMemo, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Client {
  _id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  waPhone?: string;
  details?: string;
  status: "active" | "paused" | "done" | "archived";
  avatar?: string;
  stats?: {
    totalBudget: number;
    activeDeliverablesCount: number;
    lastActivityDate: string;
  };
}

// ─── Mock hooks (replace with your actual Convex hooks) ───────────────────────
// Replace these with your actual imports:
// import { useAuthQuery as useQuery, useAuthMutation as useMutation } from "@/lib/auth-context";
// import { api } from "@/convex/_generated/api";

function useQuery(_api: unknown, _args: unknown): Client[] | undefined {
  // Replace with: return useAuthQuery(api.clients.listClientsWithStats, {});
  return [];
}

function useMutation(_api: unknown): (...args: unknown[]) => Promise<void> {
  // Replace with: return useAuthMutation(api.clients.createClient) etc.
  return async () => {};
}

// Mock API object — replace with: import { api } from "@/convex/_generated/api";
const api = {
  clients: {
    listClientsWithStats: "listClientsWithStats",
    createClient: "createClient",
    updateClient: "updateClient",
  },
};

// ─── UI Primitives (inline replacements) ─────────────────────────────────────
// Replace with your actual imports from @/components/ui/*

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function Button({
  children,
  onClick,
  type = "button",
  variant = "default",
  size,
  className = "",
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "ghost";
  size?: "sm";
  className?: string;
  title?: string;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50";
  const variants: Record<string, string> = {
    default: "bg-[var(--color-brand)] text-white hover:opacity-90",
    ghost: "bg-transparent hover:bg-muted/50 text-foreground",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 text-sm",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        base,
        variants[variant],
        sizes[size ?? "default"],
        className,
      )}
    >
      {children}
    </button>
  );
}

function Input({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  className = "",
}: {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={cn(
        "w-full rounded-xl border bg-card px-4 py-2 text-sm outline-none transition-all",
        className,
      )}
    />
  );
}

function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block text-sm font-medium", className)}>
      {children}
    </label>
  );
}

function StatusBadge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "success" | "warning" | "info" | "danger";
}) {
  const colors: Record<string, string> = {
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        colors[variant],
      )}
    >
      {children}
    </span>
  );
}

// Simple Dialog primitive
function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border-2 border-[var(--color-border)] shadow-2xl overflow-auto max-h-[90vh]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2">{children}</div>
);
const DialogTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <h2 className={cn("text-xl font-bold", className)}>{children}</h2>;
const DialogDescription = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
);
const DialogFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("flex justify-end gap-3", className)}>{children}</div>;

// ─── Icons (inline SVGs — replace with lucide-react if installed) ─────────────
// If lucide-react is installed, replace with:
// import { Users, Search, LayoutGrid, List, Plus, Mail, Building, FileText, Wallet, Pencil } from "lucide-react";

const SearchIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const LayoutGridIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const ListIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const PlusIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const MailIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
const BuildingIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);
const WalletIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);
const FileTextIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const PencilIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

// ─── Utility ──────────────────────────────────────────────────────────────────
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
  }).format(amt ?? 0);

// ─── Client Modal (Create / Edit) ─────────────────────────────────────────────
interface ClientFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  waPhone: string;
  details: string;
}

function ClientModal({
  open,
  onClose,
  clientToEdit,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  onCreate: (data: ClientFormData & { status: string }) => Promise<void>;
  onUpdate: (data: { id: string } & Partial<ClientFormData>) => Promise<void>;
}) {
  const [formData, setFormData] = useState<ClientFormData>({
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
        name: clientToEdit.name ?? "",
        company: clientToEdit.company ?? "",
        email: clientToEdit.email ?? "",
        phone: clientToEdit.phone ?? "",
        waPhone: clientToEdit.waPhone ?? "",
        details: clientToEdit.details ?? "",
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
        await onUpdate({ id: clientToEdit._id, ...formData });
      } else {
        await onCreate({ ...formData, status: "active" });
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-2 border-[var(--color-border)] p-8 rounded-3xl w-full max-w-lg mx-4">
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
                className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium"
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
                className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium"
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
              className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium"
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
                className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium"
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
                className="h-12 bg-muted/30 border-white/5 rounded-xl font-medium"
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
              className="font-bold h-12 px-8 bg-[var(--color-brand)] text-white hover:opacity-90"
            >
              {clientToEdit ? "Save Changes" : "Register Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Avatar Modal ──────────────────────────────────────────────────────────────
const AVATARS = [
  "https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/micah/svg?seed=Jack&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/micah/svg?seed=Oliver&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/micah/svg?seed=Caleb&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/micah/svg?seed=Leo&backgroundColor=transparent",
  "https://api.dicebear.com/7.x/micah/svg?seed=Casper&backgroundColor=transparent",
];

function AvatarModal({
  open,
  onClose,
  client,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (avatarUrl: string) => void;
}) {
  const [selected, setSelected] = useState<string>("");
  const [customFileUrl, setCustomFileUrl] = useState<string>("");

  useEffect(() => {
    if (!client) return;
    if (client.avatar && AVATARS.includes(client.avatar)) {
      setSelected(client.avatar);
      setCustomFileUrl("");
    } else if (client.avatar) {
      setSelected("custom");
      setCustomFileUrl(client.avatar);
    } else {
      setSelected("");
      setCustomFileUrl("");
    }
  }, [client, open]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomFileUrl(reader.result as string);
      setSelected("custom");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(selected === "custom" ? customFileUrl : selected);
    onClose();
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-2 border-[var(--color-border)] bg-card p-6 w-full max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-extrabold">
            Profile Picture
          </DialogTitle>
          <DialogDescription>
            Select an avatar or upload a picture for {client.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-8">
          {AVATARS.map((url) => (
            <button
              key={url}
              type="button"
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
                    <PlusIcon />
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
                <PlusIcon />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
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
            className="font-bold bg-[var(--color-brand)] text-white hover:opacity-90"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Client Card (Grid View) ───────────────────────────────────────────────────
function ClientCard({
  client,
  index,
  onEdit,
  onViewDetails,
  onUpdateAvatar,
}: {
  client: Client;
  index: number;
  onEdit: (c: Client) => void;
  onViewDetails: (id: string) => void;
  onUpdateAvatar: (c: Client) => void;
}) {
  const stats = client.stats ?? {
    totalBudget: 0,
    activeDeliverablesCount: 0,
    lastActivityDate: "",
  };

  return (
    <div
      onClick={() => onViewDetails(client._id)}
      className="group relative bg-card border-2 border-[var(--color-border)] rounded-2xl p-8 cursor-pointer transition-all hover:border-[var(--color-brand)]/40 hover:shadow-lg"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-8">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onUpdateAvatar(client);
          }}
          className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-muted border-2 border-[var(--color-border)] flex items-center justify-center font-black text-2xl group/avatar cursor-pointer"
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
            <PencilIcon />
          </div>
        </div>
        <StatusBadge variant={getStatusVariant(client.status)}>
          {client.status ?? "inactive"}
        </StatusBadge>
      </div>

      <div className="space-y-1 mb-8">
        <h3 className="text-2xl font-heading font-black tracking-tight group-hover:text-[var(--color-brand)] transition-colors line-clamp-1">
          {client.name}
        </h3>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <BuildingIcon />
          <span className="truncate">
            {client.company ?? "Individual Client"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 py-6 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
          <WalletIcon />
          <span className="font-bold text-foreground">
            Total: {formatCurrency(stats.totalBudget)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileTextIcon />
          <span>{stats.activeDeliverablesCount} Videos Editing</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(client);
          }}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-[var(--color-brand)] hover:text-white transition-all"
          title="Edit Client"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
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

// ─── Client Row (List View) ────────────────────────────────────────────────────
function ClientRow({
  client,
  index,
  onViewDetails,
}: {
  client: Client;
  index: number;
  onViewDetails: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onViewDetails(client._id)}
      className="group bg-card border-b-2 border-[var(--color-border)] flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-all"
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
            {client.company ?? "Client"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:block">
          <StatusBadge variant={getStatusVariant(client.status)}>
            {client.status ?? "inactive"}
          </StatusBadge>
        </div>
        <div className="hidden lg:block text-sm text-muted-foreground w-36 text-right truncate">
          {client.phone ?? client.email ?? "—"}
        </div>
        <div className="flex items-center gap-2 translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          {client.email && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:${client.email}`);
              }}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)] transition-colors"
              title="Send Email"
            >
              <MailIcon />
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  // ⚠️  Replace these with your actual Convex hooks:
  const clients = useQuery(api.clients.listClientsWithStats, {}) as
    | Client[]
    | undefined;
  const createClientMutation = useMutation(api.clients.createClient);
  const updateClientMutation = useMutation(api.clients.updateClient);

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "paused" | "archived">(
    "active",
  );
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarClient, setAvatarClient] = useState<Client | null>(null);

  const openDetailView = (id: string) => {
    setSelectedClientId(id);
    // Replace with your routing or detail modal logic
    console.log("Open detail for", id);
  };

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const q = search.toLowerCase();
    return clients.filter((c: Client) => {
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false);

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

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const openAvatarModal = (client: Client) => {
    setAvatarClient(client);
    setShowAvatarModal(true);
  };

  const handleSaveAvatar = async (avatarUrl: string) => {
    if (!avatarClient) return;
    try {
      await updateClientMutation({ id: avatarClient._id, avatar: avatarUrl });
    } catch (e) {
      console.error("Failed to update avatar", e);
    }
  };

  const handleCreate = async (data: ClientFormData & { status: string }) => {
    await createClientMutation(data);
  };

  const handleUpdate = async (
    data: { id: string } & Partial<ClientFormData>,
  ) => {
    await updateClientMutation(data);
  };

  if (clients === undefined) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div className="h-16 w-48 bg-muted animate-pulse rounded-xl" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
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
      <div className="relative min-h-full p-4 md:p-6">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] z-0"
          style={{
            backgroundImage: `radial-gradient(var(--color-ink-primary, #000) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 space-y-12">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-[var(--color-surface-0,#fff)] pt-2 pb-6 -mx-4 px-4">
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
                {/* View toggle */}
                <div className="flex items-center gap-1 bg-card border-2 border-[var(--color-border)] p-1 rounded-lg">
                  <Button
                    variant={view === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("grid")}
                    className="h-8 w-8 p-0"
                    title="Grid view"
                  >
                    <LayoutGridIcon />
                  </Button>
                  <Button
                    variant={view === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("list")}
                    className="h-8 w-8 p-0"
                    title="List view"
                  >
                    <ListIcon />
                  </Button>
                </div>

                <Button
                  onClick={openCreateModal}
                  className="h-10 px-6 font-bold bg-[var(--color-brand)] text-white hover:opacity-90"
                >
                  <span className="mr-2">
                    <PlusIcon />
                  </span>
                  New Client
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="mt-6 relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[var(--color-brand)]">
                <SearchIcon />
              </span>
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
              {(["active", "paused", "archived"] as const).map((tab) => {
                const colors: Record<string, string> = {
                  active: "bg-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.4)]",
                  paused: "bg-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.4)]",
                  archived:
                    "bg-[#6b7280] shadow-[0_0_20px_rgba(107,114,128,0.4)]",
                };
                const labels: Record<string, string> = {
                  active: "Active Clients",
                  paused: "Paused",
                  archived: "Archived",
                };
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                      activeTab === tab
                        ? `${colors[tab]} text-white scale-105`
                        : "text-muted-foreground hover:text-white hover:bg-white/5",
                    )}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid / List */}
          <div
            className={cn(
              "transition-all duration-500 ease-in-out",
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col gap-0 border-t-2 border-[var(--color-border)]",
            )}
          >
            {filteredClients.map((client: Client, i: number) =>
              view === "grid" ? (
                <ClientCard
                  key={client._id}
                  client={client}
                  index={i}
                  onEdit={openEditModal}
                  onViewDetails={openDetailView}
                  onUpdateAvatar={openAvatarModal}
                />
              ) : (
                <ClientRow
                  key={client._id}
                  client={client}
                  index={i}
                  onViewDetails={openDetailView}
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

      {/* Modals */}
      <ClientModal
        open={showModal}
        onClose={() => setShowModal(false)}
        clientToEdit={editingClient}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
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
