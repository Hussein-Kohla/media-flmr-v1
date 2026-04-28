"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthMutation as useMutation } from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2 } from "lucide-react";
import { Project, Deliverable } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: Id<"clients">;
  project?: Project;
}

export function ProjectModal({ isOpen, onClose, clientId, project }: ProjectModalProps) {
  const { data: session } = authClient.useSession();
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);

  const [projectName, setProjectName] = useState(project?.projectName || "");
  const [budget, setBudget] = useState(project?.budget?.toString() || "");
  const [startDate, setStartDate] = useState(project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "");
  const [link, setLink] = useState(project?.link || "");
  const [tasks, setTasks] = useState<Deliverable[]>(project?.deliverables || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTask = () => {
    setTasks([...tasks, { item: "", done: false }]);
  };

  const updateTask = (index: number, updates: Partial<Deliverable>) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], ...updates };
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!projectName.trim()) newErrors.projectName = "Project name is required";
    if (!budget || isNaN(Number(budget))) newErrors.budget = "Valid budget is required";
    if (!startDate) newErrors.startDate = "Start date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const projectData = {
      projectName: projectName.trim(),
      budget: Number(budget),
      paymentStatus: (project?.paymentStatus || "unpaid") as any,
      status: (project?.status || "pending") as any,
      deadline: project?.deadline || new Date().getTime(), // Maintaining existing values if any
      startDate: new Date(startDate).getTime(),
      link,
      deliverables: tasks,
      proofImageId: project?.proofImageId,
      createdBy: "system",
    };

    if (project) {
      await updateProject({ id: project._id as Id<"projects">, userId: session?.user.id || "", ...projectData });
    } else {
      await createProject({ clientId: clientId as Id<"clients">, userId: session?.user.id || "", ...projectData });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
    <DialogHeader>
    <DialogTitle>{project ? "Edit Project" : "Add New Project"}</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
    <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
    <Label htmlFor="projectName">Project Name</Label>
    <Input
    id="projectName"
    value={projectName}
    onChange={(e) => {
      setProjectName(e.target.value);
      if (errors.projectName) setErrors(prev => { const n = { ...prev }; delete n.projectName; return n; });
    }}
    className={errors.projectName ? "border-red-500" : ""}
    />
    {errors.projectName && <p className="text-xs text-red-500">{errors.projectName}</p>}
    </div>
    <div className="space-y-2">
    <Label htmlFor="budget">Budget</Label>
    <Input
    id="budget"
    type="number"
    value={budget}
    onChange={(e) => {
      setBudget(e.target.value);
      if (errors.budget) setErrors(prev => { const n = { ...prev }; delete n.budget; return n; });
    }}
    className={errors.budget ? "border-red-500" : ""}
    />
    {errors.budget && <p className="text-xs text-red-500">{errors.budget}</p>}
    </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
    <Label htmlFor="startDate">Start Date</Label>
    <Input
    id="startDate"
    type="date"
    value={startDate}
    onChange={(e) => {
      setStartDate(e.target.value);
      if (errors.startDate) setErrors(prev => { const n = { ...prev }; delete n.startDate; return n; });
    }}
    className={errors.startDate ? "border-red-500" : ""}
    />
    {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
    </div>
    <div className="space-y-2">
    <Label htmlFor="link">Project Link</Label>
    <Input
    id="link"
    value={link}
    onChange={(e) => setLink(e.target.value)}
    placeholder="https://..."
    />
    </div>
    </div>

    <div className="space-y-4 pt-4 border-t border-white/5">
    <div className="flex items-center justify-between">
    <Label className="text-lg font-bold">Tasks</Label>
    <Button type="button" variant="outline" size="sm" onClick={addTask} className="h-8 gap-1">
    <Plus className="h-3 w-3" /> Add Task
    </Button>
    </div>
    <div className="space-y-3">
    {tasks.map((task, index) => (
      <div key={index} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
      <Checkbox
      checked={task.done}
      onCheckedChange={(checked: boolean) => updateTask(index, { done: checked })}
      />
      <Input
      value={task.item}
      onChange={(e) => updateTask(index, { item: e.target.value })}
      className="flex-1 bg-transparent border-none focus-visible:ring-0 h-8"
      placeholder="Task description..."
      />
      <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => removeTask(index)}
      className="h-8 w-8 text-red-500 hover:bg-red-500/10"
      >
      <Trash2 className="h-4 w-4" />
      </Button>
      </div>
    ))}
    {tasks.length === 0 && (
      <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed border-white/5 rounded-xl">No tasks added yet.</p>
    )}
    </div>
    </div>

    <DialogFooter className="pt-6">
    <Button type="button" variant="ghost" onClick={onClose} className="font-bold">Cancel</Button>
    <Button type="submit" className="font-bold luxury-button luxury-button-primary h-12 px-8" disabled={!projectName.trim() || !budget || !startDate}>
      {project ? "Save Changes" : "Create Project"}
    </Button>
    </DialogFooter>
    </form>
    </DialogContent>
    </Dialog>
  );
}
