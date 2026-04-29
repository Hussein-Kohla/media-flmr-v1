import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";
import { Id } from "./_generated/dataModel";

export const getSettings = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return null;
    
    // Fetch individual settings
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
      
    // Fetch user profile info
    const user = await ctx.db.get(userId);
    
    return {
      settings,
      profile: user ? {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        waPhone: user.waPhone,
      } : null
    };
  },
});

export const updateProfile = mutation({
  args: { 
    token: v.optional(v.string()), 
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    waPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, ...updates } = args;
    const userId = await requireUser(ctx, token);
    await ctx.db.patch(userId, updates);
  },
});

export const updateSettings = mutation({
  args: { token: v.optional(v.string()), agencyName: v.string() },
  handler: async (ctx, args) => {
    const { token, ...rest } = args;
    const userId = await requireUser(ctx, token);
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, rest);
    } else {
      await ctx.db.insert("settings", { ...rest, userId, emailNotifications: true, pushAlerts: true, weeklyReports: true });
    }
  },
});