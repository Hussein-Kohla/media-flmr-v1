import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Auth Tables ──────────────────────────────────────────────────────────
  users: defineTable({
    email: v.string(),
    passwordHash: v.optional(v.string()), // Optional to accept old data
    name: v.optional(v.string()),         
    avatar: v.optional(v.string()),       
    waPhone: v.optional(v.string()),      
    password: v.optional(v.string()),     
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  // ── App Tables ───────────────────────────────────────────────────────────
  clients: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    industry: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    waPhone: v.optional(v.any()),
    avatarId: v.optional(v.string()),
    avatar: v.optional(v.string()),
    color: v.optional(v.string()),
    facebookPage: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
    logoId: v.optional(v.string()),
    proofImageId: v.optional(v.string()),
    socials: v.optional(v.array(v.string())),
    createdAt: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    userId: v.optional(v.id("users")), // Optional for compatibility
  }).index("by_userId", ["userId"]),

  editing_cards: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    status: v.string(),
    videoType: v.string(),
    dueDate: v.number(),
    notes: v.optional(v.string()),
    thumbnailId: v.optional(v.string()),
    userId: v.optional(v.id("users")), 
    waReminder: v.optional(v.any()),
    waReminderOffset: v.optional(v.any()),
    waReminderPending: v.optional(v.any()),
    waReminderTime: v.optional(v.any()),
    subTasks: v.array(v.object({
      task: v.string(),
      done: v.boolean(),
    })),
  }).index("by_userId", ["userId"]),

  calendar_tasks: defineTable({
    title: v.string(),
    date: v.string(),
    time: v.string(),
    duration: v.optional(v.number()),
    type: v.string(),
    notes: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    waReminder: v.optional(v.any()),
    waPhone: v.optional(v.any()),
    assignees: v.optional(v.array(v.string())),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
  }).index("by_userId", ["userId"]),

  projects: defineTable({
    projectName: v.string(),
    clientId: v.id("clients"),
    status: v.string(),
    userId: v.optional(v.id("users")),
    budget: v.optional(v.any()),
    deadline: v.optional(v.any()),
    deliverables: v.optional(v.array(v.object({
      item: v.string(),
      done: v.boolean(),
    }))),
    paymentStatus: v.optional(v.string()),
    startDate: v.optional(v.any()),
    link: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  publishing_posts: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    caption: v.optional(v.string()),
    platform: v.string(),
    publishDate: v.number(),
    linkedEditingId: v.optional(v.id("editing_cards")),
    status: v.string(),
    waReminder: v.optional(v.any()),
    waReminderTime: v.optional(v.any()),
    userId: v.optional(v.id("users")),
  }).index("by_userId", ["userId"]),

  payments: defineTable({
    clientId: v.id("clients"),
    amount: v.number(),
    date: v.string(),
    description: v.string(),
    status: v.optional(v.string()),
    details: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
    paidAmount: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  }).index("by_userId", ["userId"]),

  notes: defineTable({
    clientId: v.id("clients"),
    content: v.string(),
    color: v.string(),
    updatedAt: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  }).index("by_userId", ["userId"]),

  settings: defineTable({
    agencyName: v.optional(v.string()),
    emailNotifications: v.optional(v.boolean()),
    pushAlerts: v.optional(v.boolean()),
    weeklyReports: v.optional(v.boolean()),
    whatsappNumber: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  }).index("by_userId", ["userId"]),
});
