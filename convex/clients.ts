import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserIdFromToken, requireUser } from "./helpers";
import { Doc, Id } from "./_generated/dataModel";

// Reusable validator for client fields
const clientFields = {
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  company: v.optional(v.string()),
  address: v.optional(v.string()),
  industry: v.optional(v.string()),
  facebookPage: v.optional(v.string()),
  status: v.optional(v.string()),
  notes: v.optional(v.string()),
  logoId: v.optional(v.id("_storage")),
  proofImageId: v.optional(v.id("_storage")),
  avatar: v.optional(v.string()),
};

export const listClients = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return null;
    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== userId) return null; // security check
    return client;
  },
});

export const listClientsWithStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
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

        const latestActivity = [...projects, ...payments, ...allEditingCards].sort(
          (a, b) => (b._creationTime || 0) - (a._creationTime || 0)
        )[0];

        return {
          ...client,
          stats: {
            projectCount: projects.length,
            totalBudget,
            totalPaid,
            activeDeliverablesCount: allEditingCards.length,
            lastActivityDate: latestActivity?._creationTime || client._creationTime,
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
    ...clientFields,
  },
  handler: async (ctx, args) => {
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
    ...clientFields,
  },
  handler: async (ctx, args) => {
    const { token, id, ...updates } = args;
    await requireUser(ctx, token);
    await ctx.db.patch(id, updates);
  },
});

export const deleteClient = mutation({
  args: { token: v.optional(v.string()), id: v.id("clients") },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});