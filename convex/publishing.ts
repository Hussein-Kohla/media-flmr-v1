import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";

export const listPublishingPosts = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    return await ctx.db
      .query("publishing_posts")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();
  },
});

export const createPublishingPost = mutation({
  args: {
    token: v.optional(v.string()),
    clientId: v.id("clients"), title: v.string(), caption: v.optional(v.string()),
    platform: v.string(), publishDate: v.number(),
    linkedEditingId: v.optional(v.id("editing_cards")), status: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const { token, ...rest } = args;
    const userId = await requireUser(ctx, token);
    return await ctx.db.insert("publishing_posts", { ...rest, userId });
  },
});

export const updatePublishingPost = mutation({
  args: {
    token: v.optional(v.string()),
    id: v.id("publishing_posts"),
    clientId: v.optional(v.id("clients")), title: v.optional(v.string()),
    caption: v.optional(v.string()), platform: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    linkedEditingId: v.optional(v.id("editing_cards")), status: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { token, id, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(id, updates);
  },
});

export const deletePublishingPost = mutation({
  args: { token: v.optional(v.string()), id: v.id("publishing_posts") },
  handler: async (ctx: any, args: any) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});
