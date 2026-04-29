"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { Project } from "@/types";
import { Progress } from "@/components/ui/progress";

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No projects found for this client.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        // Safely compute progress with null checks
        const deliverables = project.deliverables ?? [];
        const completedDeliverables = deliverables.filter((d) => d.done).length;
        const totalDeliverables = deliverables.length;
        const progress = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

        // Format date safely
        const deadlineDate = project.deadline ? new Date(project.deadline) : null;
        const formattedDate = deadlineDate ? deadlineDate.toLocaleDateString() : "No deadline";

        // Budget formatting
        const budgetAmount = project.budget ?? 0;

        // Project link
        const projectLink = project.link ?? null;

        return (
          <Card key={project._id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">
                  {project.projectName || "Untitled Project"}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(project)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(project._id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {project.status || "unknown"}
                </Badge>
                <Badge
                  variant={project.paymentStatus === "paid" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {project.paymentStatus || "pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>${budgetAmount.toLocaleString()}</span>
                </div>
              </div>

              {projectLink && (
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <a href={projectLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" /> View Project
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}