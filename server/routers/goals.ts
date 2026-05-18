import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { goals, tasks } from "../db";
import { eq, and, desc } from "drizzle-orm";

export const goalsRouter = router({
  /**
   * Get all goals for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!db) throw new Error("Database not available");
    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, ctx.user.id))
      .orderBy(desc(goals.createdAt));

    // Enrich with task counts
    const enriched = await Promise.all(
      userGoals.map(async (goal) => {
        const goalTasks = await db!
          .select()
          .from(tasks)
          .where(eq(tasks.goalId, goal.id));

        const completedCount = goalTasks.filter((t) => t.completedAt).length;

        return {
          ...goal,
          totalTasksCount: goalTasks.length,
          completedTasksCount: completedCount,
          progressPercentage:
            goalTasks.length > 0
              ? Math.round((completedCount / goalTasks.length) * 100)
              : 0,
        };
      })
    );

    return enriched;
  }),

  /**
   * Get a single goal by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, input.id), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Goal not found");
      }

      const goalTasks = await db!
        .select()
        .from(tasks)
        .where(eq(tasks.goalId, goal.id))
        .orderBy(desc(tasks.dueDate));

      return {
        ...goal,
        tasks: goalTasks,
      };
    }),

  /**
   * Create a new goal
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        targetDate: z.number(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      const result = await db.insert(goals).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        targetDate: new Date(input.targetDate),
        priority: input.priority,
      });

      return {
        id: (result as any).insertId || 0,
        ...input,
      };
    }),

  /**
   * Update a goal
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        targetDate: z.number().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      const { id, ...updateData } = input;

      // Verify ownership
      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, id), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Goal not found or unauthorized");
      }

      const updateValues: any = {};
      if (updateData.title) updateValues.title = updateData.title;
      if (updateData.description) updateValues.description = updateData.description;
      if (updateData.targetDate)
        updateValues.targetDate = new Date(updateData.targetDate);
      if (updateData.priority) updateValues.priority = updateData.priority;

      await db.update(goals).set(updateValues).where(eq(goals.id, id));

      return { success: true };
    }),

  /**
   * Mark a goal as complete
   */
  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, input.id), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Goal not found or unauthorized");
      }

      await db
        .update(goals)
        .set({ completedAt: new Date() })
        .where(eq(goals.id, input.id));

      return { success: true };
    }),

  /**
   * Delete a goal
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!db) throw new Error("Database not available");
      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, input.id), eq(goals.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!goal) {
        throw new Error("Goal not found or unauthorized");
      }

      await db.delete(goals).where(eq(goals.id, input.id));

      return { success: true };
    }),
});
