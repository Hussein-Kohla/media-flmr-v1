import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const migrateOldData = mutation({
  args: { targetEmail: v.string() },
  handler: async (ctx, { targetEmail }) => {
    // 1. Find the target user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", targetEmail.toLowerCase().trim()))
      .first();

    if (!user) {
      throw new Error(`User with email ${targetEmail} not found. Please log in first to create an account.`);
    }

    const userId = user._id;
    let migratedCount = 0;

    // 2. Helper to migrate a table
    const migrateTable = async (table: any) => {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        if (!record.userId) {
          await ctx.db.patch(record._id, { userId });
          migratedCount++;
        }
      }
    };

    // 3. Migrate all tables
    await migrateTable("clients");
    await migrateTable("editing_cards");
    await migrateTable("calendar_tasks");
    await migrateTable("projects");
    await migrateTable("publishing_posts");
    await migrateTable("payments");
    await migrateTable("notes");
    await migrateTable("settings");

    return { success: true, migratedCount, assignedTo: user.email };
  },
});
