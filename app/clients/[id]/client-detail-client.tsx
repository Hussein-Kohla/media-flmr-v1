"use client";

import { useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  useAuthQuery as useQuery,
  useAuthMutation as useMutation,
} from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import { ProjectModal } from "@/components/clients/project-modal";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  FileText,
  Edit2,
  Trash2,
  AlertCircle,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  Archive,
  MessageCircle,
  ExternalLink,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { Project } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import { StatusBadge, ClientAvatar } from "@/components/ui/DataDisplay";

function getStatusVariant(
  status: string,
): "success" | "warning" | "info" | "danger" {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  return "info";
}

export default function ClientDetailClient() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("id");

  // 🔥 Fix: Added "as any" to explicitly bypass the {} strict typing error
  const client = useQuery(api.clients.getClient, {
    id: clientId as Id<"clients">,
  }) as any;

  const projects = (useQuery(api.projects.listProjectsByClient, {
    clientId: clientId as Id<"clients">,
  }) || []) as Project[];

  const updateClient = useMutation(api.clients.updateClient);
  const deleteClientMutation = useMutation(api.clients.deleteClient);
  const deleteProject = useMutation(api.projects.deleteProject);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
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
        window.location.href = "/clients";
      } catch {
        alert("Failed to archive client.");
      }
    }
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
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold">Client Not Found</h2>
          <p className="text-muted-foreground">
            This client doesn&apos;t exist or was removed.
          </p>
        </div>
        <Link href="/clients">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Button>
        </Link>
      </div>
    );

  const initials = client.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalPaid = projects.reduce(
    (sum, p) =>
      p.paymentStatus === "paid"
        ? sum + p.budget
        : p.paymentStatus === "partial"
          ? sum + p.budget * 0.5
          : sum,
    0,
  );
  const pendingAmount = totalBudget - totalPaid;
  const activeProjects = projects.filter((p) => p.status !== "done").length;
  const totalDeliverables = projects.reduce(
    (sum, p) => sum + p.deliverables.length,
    0,
  );
  const nextDeadline = projects
    .filter((p) => p.status !== "done")
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )[0]?.deadline;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-[var(--color-brand)] transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        All Clients
      </Link>

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
              className="gap-2 font-bold"
              onClick={() =>
                window.open(
                  `https://wa.me/${client.phone?.replace(/\\D/g, "")}`,
                )
              }
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              className="gap-2 font-bold"
              onClick={() => (window.location.href = `mailto:${client.email}`)}
            >
              <Mail className="h-4 w-4" /> Email
            </Button>
            <Button
              variant="outline"
              className="gap-2 font-bold"
              onClick={handleUpdateStatus}
            >
              <UserCheck className="h-4 w-4" /> Update Status
            </Button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Card */}
        <div className="luxury-card p-6 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Phone className="h-12 w-12" />
          </div>
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

        {/* Financial Card */}
        <div className="luxury-card p-6 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-heading font-bold uppercase tracking-tight flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[var(--color-brand)]" /> Financials
          </h3>
          <div className="space-y-4 font-body">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total Budget
              </span>
              <span className="font-bold">${totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="font-bold text-green-500">
                ${totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-bold text-orange-500">
                ${pendingAmount.toLocaleString()}
              </span>
            </div>
            <div className="pt-4 border-t border-[var(--color-border)] flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground italic">
                Payment methods tracked per project
              </span>
            </div>
          </div>
        </div>

        {/* Project Summary Card */}
        <div className="luxury-card p-6 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-heading font-bold uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--color-brand)]" /> Summary
          </h3>
          <div className="space-y-4 font-body">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Active Projects
              </span>
              <span className="font-bold">{activeProjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total Deliverables
              </span>
              <span className="font-bold">{totalDeliverables}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Next Deadline
              </span>
              <span className="font-bold">
                {nextDeadline
                  ? new Date(nextDeadline).toLocaleDateString()
                  : "No deadline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[var(--color-border)] pb-4">
            <h2 className="text-3xl font-heading font-extrabold uppercase tracking-tighter">
              Project Pipeline
            </h2>
            <Button
              onClick={handleAddProject}
              className="gap-2 font-bold luxury-button luxury-button-primary"
            >
              <Plus className="h-4 w-4" />
              Create New Project
            </Button>
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
                {projects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No projects linked to this client.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const completed = project.deliverables.filter(
                      (d) => d.done,
                    ).length;
                    const progress =
                      project.deliverables.length > 0
                        ? (completed / project.deliverables.length) * 100
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
                              ${project.budget.toLocaleString()}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center border-b-2 border-[var(--color-border)] pb-4">
            <h2 className="text-3xl font-heading font-extrabold uppercase tracking-tighter">
              CRM Notes
            </h2>
          </div>

          <div className="luxury-card p-6 min-h-[200px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="h-12 w-12" />
            </div>
            <div className="relative space-y-4">
              {client.notes ? (
                <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {client.notes}
                </p>
              ) : (
                <p className="text-sm font-body text-muted-foreground italic">
                  No notes available for this client.
                </p>
              )}
              <Button
                variant="ghost"
                className="w-full gap-2 text-xs font-bold"
                onClick={() => {
                  const newNotes = prompt(
                    "Update client notes:",
                    client.notes || "",
                  );
                  if (newNotes !== null) {
                    updateClient({
                      id: clientId as Id<"clients">,
                      notes: newNotes,
                    });
                  }
                }}
              >
                <Edit2 className="h-3 w-3" /> Update Notes
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="gap-2 font-bold luxury-button"
              onClick={() => alert("Billing update coming soon!")}
            >
              <CreditCard className="h-4 w-4" /> Update Billing
            </Button>
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

      <ProjectModal
        key={selectedProject?._id || "new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId as Id<"clients">}
        project={selectedProject || undefined}
      />
    </div>
  );
}
