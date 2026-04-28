export type ClientStatus = "active" | "paused" | "done";

export interface Client {
  _id: string;
  _creationTime: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  industry?: string;
  address?: string;
  facebookPage?: string;
  status: ClientStatus;
  notes?: string;
  color?: string;
  avatarId?: string;
  logoId?: string;
  proofImageId?: string;
  waPhone?: any;
  avatar?: string;
  socials?: string[];
  createdAt?: number;
  createdBy?: string;
  userId?: string;
}

export type EditingStatus = "pending" | "in_progress" | "done";
export type EditingVideoType = "long" | "short" | "ad" | "other";

export interface EditingSubTask {
  task: string;
  done: boolean;
}

export interface EditingCard {
  _id: string;
  _creationTime: number;
  clientId: string;
  title: string;
  status: EditingStatus;
  videoType: EditingVideoType;
  dueDate: number;
  notes?: string;
  thumbnailId?: string;
  subTasks: EditingSubTask[];
  userId?: string;
  waReminder?: any;
  waReminderOffset?: any;
  waReminderPending?: any;
  waReminderTime?: any;
}

export type CalendarTaskType = "meeting" | "deadline" | "reminder" | "shoot" | "other";
export type TaskType = CalendarTaskType;
export type ViewMode = "week" | "month" | "day";

export interface CalendarTask {
  _id: string;
  _creationTime: number;
  title: string;
  date: string;
  time?: string;
  duration?: number;
  type: CalendarTaskType;
  assignees: string[];
  clientId?: string;
  projectId?: string;
  notes?: string;
  userId?: string;
  waReminder?: any;
  waPhone?: any;
}

export interface Project {
  _id: string;
  _creationTime: number;
  clientId: string;
  projectName: string;
  status: "pending" | "in_progress" | "done" | "completed";
  budget?: number;
  deadline?: string;
  startDate?: string;
  link?: string;
  deliverables: Deliverable[];
  paymentStatus: "unpaid" | "partial" | "paid";
  proofImageId?: string;
  userId?: string;
}

export interface Deliverable {
  item: string;
  done: boolean;
}

export type PublishingStatus = "not_ready" | "ready" | "published";

export interface PublishingPost {
  _id: string;
  _creationTime: number;
  clientId: string;
  title: string;
  caption?: string;
  platform: string;
  publishDate: number;
  linkedEditingId?: string;
  status: PublishingStatus;
  waReminder?: any;
  waReminderTime?: any;
  userId?: string;
}

export interface Payment {
  _id: string;
  _creationTime: number;
  clientId: string;
  amount: number;
  date: string;
  description: string;
  status?: string;
  details?: string;
  isCompleted?: boolean;
  paidAmount?: number;
  userId?: string;
}

export interface Note {
  _id: string;
  _creationTime: number;
  clientId: string;
  content: string;
  color: string;
  updatedAt?: number;
  userId?: string;
}
