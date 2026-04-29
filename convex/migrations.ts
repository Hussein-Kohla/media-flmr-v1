import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Define all table names that can be migrated
type TableName = 
  | "clients"
  | "editing_cards"
  | "calendar_tasks"
  | "projects"
  | "publishing_posts"
  | "payments"
  | "notes"
  | "settings";

export const migrateOldData = mutation({
  args: { targetEmail: v.string() },
  handler: async (ctx, { targetEmail }) => {
    // 1. Find the target user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", targetEmail.toLowerCase().trim()))
      .first();

    if (!user) {
      throw new Error(
        `User with email ${targetEmail} not found. Please log in first to create an account.`
      );
    }

    const userId = user._id;
    let migratedCount = 0;

    // 2. Helper to migrate a table – using a generic type for safety
    const migrateTable = async (table: TableName) => {
      // Query all records from the given table
      const records = await ctx.db.query(table).collect();
      
      for (const record of records) {
        // ✅ Fix line 24: safely access userId via type assertion (since schema may not have the field yet)
        const hasUserId = (record as any).userId !== undefined;
        if (!hasUserId) {
          // ✅ Fix line 22: patch with the target userId using proper type
          await ctx.db.patch(record._id, { userId } as Partial<Doc<typeof table>>);
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