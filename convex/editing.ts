import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";

export const listEditingCards = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    return await ctx.db
      .query("editing_cards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createEditingCard = mutation({
  args: {
    token: v.optional(v.string()),
    clientId: v.id("clients"),
    title: v.string(),
    status: v.string(),
    videoType: v.string(),
    dueDate: v.number(),
    notes: v.optional(v.string()),
    thumbnailId: v.optional(v.string()),
    subTasks: v.array(v.object({ task: v.string(), done: v.boolean() })),
  },
  handler: async (ctx: any, args: any) => {
    const { token, ...rest } = args;
    const userId = await requireUser(ctx, token);
    return await ctx.db.insert("editing_cards", { ...rest, userId });
  },
});

export const updateEditingCard = mutation({
  args: {
    token: v.optional(v.string()),
    id: v.id("editing_cards"),
    clientId: v.id("clients"),
    title: v.string(),
    status: v.string(),
    videoType: v.string(),
    dueDate: v.number(),
    notes: v.optional(v.string()),
    thumbnailId: v.optional(v.string()),
    subTasks: v.array(v.object({ task: v.string(), done: v.boolean() })),
  },
  handler: async (ctx: any, args: any) => {
    const { token, id, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(id, updates);
  },
});

export const deleteEditingCard = mutation({
  args: { token: v.optional(v.string()), id: v.id("editing_cards") },
  handler: async (ctx: any, args: any) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});

export const setEditingCardStatus = mutation({
  args: { token: v.optional(v.string()), id: v.id("editing_cards"), status: v.string() },
  handler: async (ctx: any, args: any) => {
    await requireUser(ctx, args.token);
    await ctx.db.patch(args.id, { status: args.status });
  },
});
