import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Password Hashing ─────────────────────────────────────────────────────────
// Use a simple but secure method available in the Convex runtime (Web Crypto)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── Token Generation ────────────────────────────────────────────────────────
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const normalized = email.toLowerCase().trim();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", normalized))
      .first();
    if (existing) {
      throw new Error("An account with this email already exists");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const passwordHash = await hashPassword(password);
    const userId = await ctx.db.insert("users", {
      email: normalized,
      passwordHash,
      createdAt: Date.now(),
    });
    // Auto sign-in: create session
    const token = generateToken();
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: Date.now() + SESSION_TTL_MS,
      createdAt: Date.now(),
    });
    return { token, userId };
  },
});

// ─── Sign In ──────────────────────────────────────────────────────────────────
export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const normalized = email.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", normalized))
      .first();
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) {
      throw new Error("Invalid email or password");
    }
    const token = generateToken();
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: Date.now() + SESSION_TTL_MS,
      createdAt: Date.now(),
    });
    return { token, userId: user._id, email: user.email };
  },
});

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// ─── Get Current User (by token) ──────────────────────────────────────────────
export const getCurrentUser = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return { userId: user._id, email: user.email };
  },
});

// ─── Validate Token (internal helper) ─────────────────────────────────────────
export const validateSession = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    return session.userId;
  },
});
