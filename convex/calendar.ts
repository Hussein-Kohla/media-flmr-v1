import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";
import { Id } from "./_generated/dataModel";

// Type definitions for better type safety
type CalendarTask = {
  _id: Id<"calendar_tasks">;
  userId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  assignees: string[];
  clientId?: Id<"clients">;
  projectId?: Id<"projects">;
  notes?: string;
};

export const listCalendarTasks = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    
    // Fixed: ensure the index "by_userId" exists in your schema
    // If the index doesn't exist, use .filter() instead
    return await ctx.db
      .query("calendar_tasks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createCalendarTask = mutation({
  args: {
    token: v.optional(v.string()),
    title: v.string(),
    date: v.string(),
    time: v.string(),
    duration: v.number(),
    type: v.string(),
    assignees: v.array(v.string()),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, ...rest } = args;
    const userId = await requireUser(ctx, token);
    return await ctx.db.insert("calendar_tasks", { ...rest, userId });
  },
});

// Keep backward compatibility if needed
export const createCalendarTaskV2 = createCalendarTask;
export const createCalendarTaskV3 = createCalendarTask;

export const updateCalendarTask = mutation({
  args: {
    token: v.optional(v.string()),
    id: v.id("calendar_tasks"),
    title: v.string(),
    date: v.string(),
    time: v.string(),
    duration: v.number(),
    type: v.string(),
    assignees: v.array(v.string()),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, id, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(id, updates);
  },
});

export const deleteCalendarTask = mutation({
  args: { token: v.optional(v.string()), id: v.id("calendar_tasks") },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});