import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";

export const listNotesByClient = query({
  args: { token: v.optional(v.string()), clientId: v.id("clients") },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    return await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .collect();
  },
});

export const createNote = mutation({
  args: {
    token: v.optional(v.string()),
    clientId: v.id("clients"), content: v.string(), color: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const { token, ...rest } = args;
    const userId = await requireUser(ctx, token);
    return await ctx.db.insert("notes", { ...rest, userId, updatedAt: Date.now() });
  },
});

export const updateNote = mutation({
  args: {
    token: v.optional(v.string()),
    noteId: v.id("notes"), content: v.optional(v.string()), color: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { token, noteId, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(noteId, { ...updates, updatedAt: Date.now() });
  },
});

export const deleteNote = mutation({
  args: { token: v.optional(v.string()), noteId: v.id("notes") },
  handler: async (ctx: any, args: any) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.noteId);
  },
});
