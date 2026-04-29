import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";
import { Id } from "./_generated/dataModel";

export const listPaymentsByClient = query({
  args: { token: v.optional(v.string()), clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    return await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .collect();
  },
});

export const createPayment = mutation({
  args: {
    token: v.optional(v.string()),
    clientId: v.id("clients"),
    amount: v.number(),
    paidAmount: v.optional(v.number()),
    date: v.string(),
    description: v.string(),
    status: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, ...rest } = args;
    const userId = await requireUser(ctx, token);
    return await ctx.db.insert("payments", { ...rest, userId });
  },
});

export const updatePayment = mutation({
  args: {
    token: v.optional(v.string()),
    paymentId: v.id("payments"),
    amount: v.optional(v.number()),
    paidAmount: v.optional(v.number()),
    date: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, paymentId, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(paymentId, updates);
  },
});

export const deletePayment = mutation({
  args: { token: v.optional(v.string()), paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.paymentId);
  },
});