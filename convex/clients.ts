import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";
import { Doc } from "./_generated/dataModel";

export const listClients = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    return await ctx.db
      .query("clients")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getClient = query({
  args: { id: v.id("clients"), token: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return null;
    const client = await ctx.db.get(args.id);
    if (!client) return null;
    return client;
  },
});

export const listClientsWithStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return [];
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const clientsWithStats = await Promise.all(
      clients.map(async (client: Doc<"clients">) => {
        const projects = await ctx.db
          .query("projects")
          .filter((q) => q.eq(q.field("clientId"), client._id))
          .collect();
        const payments = await ctx.db
          .query("payments")
          .filter((q) => q.eq(q.field("clientId"), client._id))
          .collect();
        const allEditingCards = await ctx.db
          .query("editing_cards")
          .filter((q) => q.eq(q.field("clientId"), client._id))
          .collect();
          
        const totalBudget = payments.reduce((sum: number, p: Doc<"payments">) => sum + (p.amount || 0), 0);
        const totalPaid = payments
          .filter((p: Doc<"payments">) => p.status === "paid" || p.isCompleted === true)
          .reduce((sum: number, p: Doc<"payments">) => sum + (p.paidAmount || 0), 0);

        const latestActivity = [...projects, ...payments, ...allEditingCards].sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))[0];

        return {
          ...client,
          stats: {
            projectCount: projects.length,
            totalBudget, // Matched with Payments 'amount' sum from inside
            totalPaid,
            activeDeliverablesCount: allEditingCards.length, 
            lastActivityDate: latestActivity?._creationTime || client.createdAt || client._creationTime,
          },
        };
      })
    );
    return clientsWithStats;
  },
});

export const createClient = mutation({
  args: {
    token: v.optional(v.string()),
    name: v.string(),
    email: v.optional(v.any()),
    phone: v.optional(v.any()),
    company: v.optional(v.any()),
    address: v.optional(v.any()),
    industry: v.optional(v.any()),
    facebookPage: v.optional(v.any()),
    status: v.optional(v.any()),
    notes: v.optional(v.any()),
    logoId: v.optional(v.any()),
    proofImageId: v.optional(v.any()),
    createdBy: v.optional(v.any()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { token, ...rest } = args;
    const userId = await requireUser(ctx, token);
    return await ctx.db.insert("clients", {
      ...rest,
      userId,
      createdAt: Date.now(),
      status: rest.status || "active",
    });
  },
});

export const updateClient = mutation({
  args: {
    token: v.optional(v.string()),
    id: v.id("clients"),
    name: v.optional(v.any()),
    email: v.optional(v.any()),
    phone: v.optional(v.any()),
    company: v.optional(v.any()),
    address: v.optional(v.any()),
    industry: v.optional(v.any()),
    facebookPage: v.optional(v.any()),
    status: v.optional(v.any()),
    notes: v.optional(v.any()),
    logoId: v.optional(v.any()),
    proofImageId: v.optional(v.any()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { token, id, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(id, updates);
  },
});

export const deleteClient = mutation({
  args: { token: v.optional(v.string()), id: v.id("clients") },
  handler: async (ctx: any, args: any) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});
