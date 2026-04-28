import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";

export const listProjects = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listProjectsByClient = query({
  args: { token: v.optional(v.string()), clientId: v.id("clients") },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    token: v.optional(v.string()),
    clientId: v.id("clients"), projectName: v.string(), budget: v.number(),
    status: v.string(), deadline: v.number(), startDate: v.number(),
    link: v.optional(v.string()),
    deliverables: v.array(v.object({ item: v.string(), done: v.boolean() })),
    paymentStatus: v.optional(v.string()), proofImageId: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { token, deadline, startDate, ...rest } = args;
    const userId = await requireUser(ctx, token);
    return await ctx.db.insert("projects", {
      ...rest, userId,
      deadline: new Date(deadline).toISOString(),
      startDate: new Date(startDate).toISOString(),
    });
  },
});

export const updateProject = mutation({
  args: {
    token: v.optional(v.string()),
    id: v.id("projects"),
    projectName: v.optional(v.string()), budget: v.optional(v.number()),
    status: v.optional(v.string()), deadline: v.optional(v.number()),
    startDate: v.optional(v.number()), link: v.optional(v.string()),
    deliverables: v.optional(v.array(v.object({ item: v.string(), done: v.boolean() }))),
    paymentStatus: v.optional(v.string()), proofImageId: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { token, id, deadline, startDate, ...updates } = args;
    await requireUser(ctx, token);
    const finalUpdates: any = { ...updates };
    if (deadline !== undefined) finalUpdates.deadline = new Date(deadline).toISOString();
    if (startDate !== undefined) finalUpdates.startDate = new Date(startDate).toISOString();
    await ctx.db.patch(id, finalUpdates);
  },
});

export const deleteProject = mutation({
  args: { token: v.optional(v.string()), id: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});
