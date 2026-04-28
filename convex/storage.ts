import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: { token: v.optional(v.string()) }, // Accept token from auth wrapper
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  }
});

export const getFileUrl = query({
  args: { 
    storageId: v.optional(v.string()),
    token: v.optional(v.string()) // Accept token from auth wrapper
  },
  handler: async (ctx, args) => {
    if (!args.storageId) return null;
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getMultipleFileUrls = query({
  args: { 
    storageIds: v.array(v.string()),
    token: v.optional(v.string()) // Accept token from auth wrapper
  },
  handler: async (ctx, args) => {
    const urls: Record<string, string | null> = {};
    for (const id of args.storageIds) {
      urls[id] = await ctx.storage.getUrl(id);
    }
    return urls;
  },
});
