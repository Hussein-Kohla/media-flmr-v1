import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ─── Auth Helper: get userId from session token ───────────────────────────────
export async function getUserIdFromToken(ctx: QueryCtx | MutationCtx, token: string | undefined | null): Promise<Id<"users"> | null> {
  if (!token) return null;
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) return null;
  return session.userId;
}

export async function requireUser(ctx: QueryCtx | MutationCtx, token: string | undefined | null): Promise<Id<"users">> {
  const userId = await getUserIdFromToken(ctx, token);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
