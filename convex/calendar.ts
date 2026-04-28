import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";

export const listCalendarTasks = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    return await ctx.db
      .query("calendar_tasks")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();
  },
});

export const createCalendarTask = mutation({
  args: {
    token: v.optional(v.string()),
    title: v.string(), date: v.string(), time: v.string(), duration: v.number(),
    type: v.string(), assignees: v.array(v.string()),
    clientId: v.optional(v.id("clients")), projectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { token, ...rest } = args;
    const userId = await requireUser(ctx, token);
    return await ctx.db.insert("calendar_tasks", { ...rest, userId });
  },
});

export const createCalendarTaskV2 = createCalendarTask;
export const createCalendarTaskV3 = createCalendarTask;

export const updateCalendarTask = mutation({
  args: {
    token: v.optional(v.string()),
    id: v.id("calendar_tasks"),
    title: v.string(), date: v.string(), time: v.string(), duration: v.number(),
    type: v.string(), assignees: v.array(v.string()),
    clientId: v.optional(v.id("clients")), projectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { token, id, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(id, updates);
  },
});

export const deleteCalendarTask = mutation({
  args: { token: v.optional(v.string()), id: v.id("calendar_tasks") },
  handler: async (ctx: any, args: any) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});
