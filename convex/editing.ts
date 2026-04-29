import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";
import { Id } from "./_generated/dataModel";

// Define the subTask type for reuse
const subTaskValidator = v.object({
  task: v.string(),
  done: v.boolean(),
});

export const listEditingCards = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
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
    subTasks: v.array(subTaskValidator),
  },
  handler: async (ctx, args) => {
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
    subTasks: v.array(subTaskValidator),
  },
  handler: async (ctx, args) => {
    const { token, id, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(id, updates);
  },
});

export const deleteEditingCard = mutation({
  args: { token: v.optional(v.string()), id: v.id("editing_cards") },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});

export const setEditingCardStatus = mutation({
  args: {
    token: v.optional(v.string()),
    id: v.id("editing_cards"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token);
    await ctx.db.patch(args.id, { status: args.status });
  },
});