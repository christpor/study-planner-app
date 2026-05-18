import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { userPreferences } from "../db";
import { eq } from "drizzle-orm";

export const preferencesRouter = router({
  /**
   * Get user preferences
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    if (!db) throw new Error("Database not available");
    let prefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ctx.user.id))
      .then((rows) => rows[0]);

    // Create default preferences if they don't exist
    if (!prefs) {
      await db.insert(userPreferences).values({
        userId: ctx.user.id,
        skillLevel: "beginner",
        preferredLayout: "balanced",
        interactionStyle: "hybrid",
        accessibilityMode: "standard",
        darkModePreference: "auto",
      });

      prefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, ctx.user.id))
        .then((rows) => rows[0]);
    }

    return prefs;
  }),

  /**
   * Update user preferences
   */
  update: protectedProcedure
    .input(
      z.object({
        skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        preferredLayout: z.enum(["compact", "balanced", "detailed"]).optional(),
        interactionStyle: z.enum(["voice", "touch", "hybrid"]).optional(),
        accessibilityMode: z
          .enum(["standard", "haptic-only", "voice-only"])
          .optional(),
        darkModePreference: z.enum(["light", "dark", "auto"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      // Get or create preferences
      let prefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, ctx.user.id))
        .then((rows) => rows[0]);

      if (!prefs) {
        await db.insert(userPreferences).values({
          userId: ctx.user.id,
          skillLevel: "beginner",
          preferredLayout: "balanced",
          interactionStyle: "hybrid",
          accessibilityMode: "standard",
          darkModePreference: "auto",
        });
      }

      const updateValues: any = {};
      if (input.skillLevel) updateValues.skillLevel = input.skillLevel;
      if (input.preferredLayout) updateValues.preferredLayout = input.preferredLayout;
      if (input.interactionStyle) updateValues.interactionStyle = input.interactionStyle;
      if (input.accessibilityMode) updateValues.accessibilityMode = input.accessibilityMode;
      if (input.darkModePreference)
        updateValues.darkModePreference = input.darkModePreference;

      await db
        .update(userPreferences)
        .set(updateValues)
        .where(eq(userPreferences.userId, ctx.user.id));

      return { success: true };
    }),
});
